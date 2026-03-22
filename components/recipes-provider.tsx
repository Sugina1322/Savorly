import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { useAuth } from '@/components/auth-provider';
import { recipes as recipeSeed, Recipe } from '@/data/recipes';
import { useSettings } from '@/components/settings-provider';
import {
  buildKitchenPulse,
  buildTasteProfile,
  buildRecipeDraft,
  isRecipeReliable,
  buildSmartCollections,
  buildSmartSuggestions,
  type KitchenPulse,
  pickFeaturedRecipe,
  rankRecipes,
  type FeaturedRecipePick,
  type SearchResult,
  type SmartCollection,
  type TasteProfile,
  type UserInteractions,
  upgradeLegacyUserRecipe,
} from '@/utils/recipe-intelligence';

type RecipesContextValue = {
  recipes: Recipe[];
  featuredPick: FeaturedRecipePick | null;
  kitchenPulse: KitchenPulse | null;
  mealPlans: Record<string, Partial<Record<MealSlot, string>>>;
  cookingProgress: Record<string, number>;
  savedCount: number;
  toggleFavorite: (id: string) => void;
  clearSavedRecipes: () => void;
  searchRecipes: (query: string) => SearchResult[];
  smartSuggestions: { recipe: Recipe; score: number; reason: string }[];
  smartCollections: SmartCollection[];
  addRecipeFromIdea: (input: {
    title: string;
    cuisine: string;
    cookTime: string;
    servings?: string;
    description: string;
    image?: string;
    ingredients?: string[];
    steps?: string[];
  }) => Recipe;
  updateRecipeFromIdea: (id: string, input: AddRecipeInput) => Recipe | null;
  deleteRecipe: (id: string) => void;
  setMealPlanSlot: (dateKey: string, slot: MealSlot, recipeId: string) => void;
  clearMealPlanSlot: (dateKey: string, slot: MealSlot) => void;
  setCookingProgress: (recipeId: string, stepIndex: number) => void;
  recordSearchQuery: (query: string) => void;
  trackRecipeView: (id: string) => void;
  tasteProfile: TasteProfile;
};

type AddRecipeInput = {
  title: string;
  cuisine: string;
  cookTime: string;
  servings?: string;
  description: string;
  image?: string;
  ingredients?: string[];
  steps?: string[];
};

export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

const RecipesContext = createContext<RecipesContextValue | null>(null);
const RECIPES_STORAGE_KEY = 'savorly.recipes.v3';
const RECIPE_SIGNALS_STORAGE_KEY = 'savorly.recipe-signals.v3';
const MEAL_PLAN_STORAGE_KEY = 'savorly.meal-plan.v2';
const COOKING_PROGRESS_STORAGE_KEY = 'savorly.cooking-progress.v2';
const DEFAULT_INTERACTIONS: UserInteractions = {
  searches: [],
  viewsByRecipeId: {},
  recentlySavedRecipeIds: [],
};
const SEED_RECIPE_IDS = new Set(recipeSeed.map((recipe) => recipe.id));
const DEFAULT_RECIPES = recipeSeed;

function buildStorageKey(baseKey: string, scope: string) {
  return `${baseKey}.${scope}`;
}

function getDefaultSavedIds() {
  return new Set(DEFAULT_RECIPES.filter((recipe) => recipe.saved).map((recipe) => recipe.id));
}

function getDefaultRecipeState() {
  return {
    recipes: DEFAULT_RECIPES,
    savedIds: getDefaultSavedIds(),
    interactions: DEFAULT_INTERACTIONS,
    mealPlans: {},
    cookingProgress: {},
  };
}

function removeRecipeFromMealPlans(
  current: Record<string, Partial<Record<MealSlot, string>>>,
  recipeId: string
) {
  const next: Record<string, Partial<Record<MealSlot, string>>> = {};

  Object.entries(current).forEach(([dateKey, dayPlan]) => {
    const filteredDayPlan = Object.fromEntries(
      Object.entries(dayPlan).filter(([, plannedRecipeId]) => plannedRecipeId !== recipeId)
    ) as Partial<Record<MealSlot, string>>;

    if (Object.keys(filteredDayPlan).length > 0) {
      next[dateKey] = filteredDayPlan;
    }
  });

  return next;
}

function mergeSeedRecipesWithStoredRecipes(storedRecipes: Recipe[]) {
  const storedRecipeMap = new Map(storedRecipes.map((recipe) => [recipe.id, recipe]));
  const mergedSeedRecipes = recipeSeed.map((seedRecipe) => {
    const storedRecipe = storedRecipeMap.get(seedRecipe.id);

    if (!storedRecipe) {
      return seedRecipe;
    }

    return {
      ...seedRecipe,
      saved: storedRecipe.saved,
      isUserCreated: false,
    };
  });
  const customRecipes = storedRecipes
    .filter((recipe) => !SEED_RECIPE_IDS.has(recipe.id))
    .map((recipe) => ({
      ...upgradeLegacyUserRecipe(recipe),
      isUserCreated: true,
    }))
    .filter((recipe) => {
      if (isRecipeReliable(recipe)) {
        return true;
      }

      console.warn(`Skipping unreliable custom recipe "${recipe.title}" because its method is incomplete or generated.`);
      return false;
    });

  return [...customRecipes, ...mergedSeedRecipes];
}

export function RecipesProvider({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const { settings } = useSettings();
  const storageScope = user?.id ?? 'guest';
  const [recipes, setRecipes] = useState(DEFAULT_RECIPES);
  const [savedIds, setSavedIds] = useState(getDefaultSavedIds);
  const [interactions, setInteractions] = useState<UserInteractions>(DEFAULT_INTERACTIONS);
  const [mealPlans, setMealPlans] = useState<Record<string, Partial<Record<MealSlot, string>>>>({});
  const [cookingProgress, setCookingProgressState] = useState<Record<string, number>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const defaults = getDefaultRecipeState();
    let isActive = true;
    setIsHydrated(false);
    setRecipes(defaults.recipes);
    setSavedIds(defaults.savedIds);
    setInteractions(defaults.interactions);
    setMealPlans(defaults.mealPlans);
    setCookingProgressState(defaults.cookingProgress);

    Promise.all([
      AsyncStorage.getItem(buildStorageKey(RECIPES_STORAGE_KEY, storageScope)),
      AsyncStorage.getItem(buildStorageKey(RECIPE_SIGNALS_STORAGE_KEY, storageScope)),
      AsyncStorage.getItem(buildStorageKey(MEAL_PLAN_STORAGE_KEY, storageScope)),
      AsyncStorage.getItem(buildStorageKey(COOKING_PROGRESS_STORAGE_KEY, storageScope)),
    ])
      .then(([storedRecipes, storedSignals, storedMealPlans, storedCookingProgress]) => {
        if (!isActive) {
          return;
        }

        if (storedRecipes) {
          try {
            const parsedRecipes = JSON.parse(storedRecipes) as Recipe[];
            const mergedRecipes = mergeSeedRecipesWithStoredRecipes(parsedRecipes);
            setRecipes(mergedRecipes);
            setSavedIds(new Set(mergedRecipes.filter((recipe) => recipe.saved).map((recipe) => recipe.id)));
          } catch (error) {
            console.warn('Failed to parse stored recipes', error);
          }
        }

        if (storedSignals) {
          try {
            const parsedSignals = JSON.parse(storedSignals) as UserInteractions;
            setInteractions({
              searches: Array.isArray(parsedSignals.searches) ? parsedSignals.searches : [],
              viewsByRecipeId: parsedSignals.viewsByRecipeId ?? {},
              recentlySavedRecipeIds: Array.isArray(parsedSignals.recentlySavedRecipeIds)
                ? parsedSignals.recentlySavedRecipeIds.filter((value): value is string => typeof value === 'string')
                : [],
            });
          } catch (error) {
            console.warn('Failed to parse recipe signals', error);
          }
        }

        if (storedMealPlans) {
          try {
            const parsedMealPlans = JSON.parse(storedMealPlans) as Record<string, Partial<Record<MealSlot, string>>>;
            setMealPlans(parsedMealPlans ?? {});
          } catch (error) {
            console.warn('Failed to parse stored meal plans', error);
          }
        }

        if (storedCookingProgress) {
          try {
            const parsedCookingProgress = JSON.parse(storedCookingProgress) as Record<string, number>;
            setCookingProgressState(parsedCookingProgress ?? {});
          } catch (error) {
            console.warn('Failed to parse cooking progress', error);
          }
        }
      })
      .finally(() => {
        if (isActive) {
          setIsHydrated(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, [storageScope]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const mappedRecipes = recipes.map((recipe) => ({
      ...recipe,
      saved: savedIds.has(recipe.id),
    }));

    AsyncStorage.setItem(buildStorageKey(RECIPES_STORAGE_KEY, storageScope), JSON.stringify(mappedRecipes)).catch((error) => {
      console.warn('Failed to save recipes', error);
    });
  }, [isHydrated, recipes, savedIds, storageScope]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(buildStorageKey(RECIPE_SIGNALS_STORAGE_KEY, storageScope), JSON.stringify(interactions)).catch((error) => {
      console.warn('Failed to save recipe signals', error);
    });
  }, [interactions, isHydrated, storageScope]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(buildStorageKey(MEAL_PLAN_STORAGE_KEY, storageScope), JSON.stringify(mealPlans)).catch((error) => {
      console.warn('Failed to save meal plans', error);
    });
  }, [isHydrated, mealPlans, storageScope]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(buildStorageKey(COOKING_PROGRESS_STORAGE_KEY, storageScope), JSON.stringify(cookingProgress)).catch((error) => {
      console.warn('Failed to save cooking progress', error);
    });
  }, [cookingProgress, isHydrated, storageScope]);

  const toggleFavorite = useCallback((id: string) => {
    const isSaved = savedIds.has(id);

    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    setInteractions((current) => ({
      ...current,
      recentlySavedRecipeIds: isSaved
        ? current.recentlySavedRecipeIds.filter((recipeId) => recipeId !== id)
        : [...current.recentlySavedRecipeIds.filter((recipeId) => recipeId !== id), id].slice(-20),
    }));
  }, [savedIds]);

  const clearSavedRecipes = useCallback(() => {
    setSavedIds(new Set());
    setInteractions((current) => ({
      ...current,
      recentlySavedRecipeIds: [],
    }));
  }, []);

  const addRecipeFromIdea = useCallback((input: AddRecipeInput) => {
    const nextRecipe = buildRecipeDraft(input);
    setRecipes((current) => [nextRecipe, ...current]);
    setSavedIds((current) => {
      const next = new Set(current);
      next.add(nextRecipe.id);
      return next;
    });
    return nextRecipe;
  }, []);

  const updateRecipeFromIdea = useCallback((id: string, input: AddRecipeInput) => {
    if (SEED_RECIPE_IDS.has(id)) {
      return null;
    }

    const nextRecipe = buildRecipeDraft(input);
    let updatedRecipe: Recipe | null = null;

    setRecipes((current) =>
      current.map((recipe) => {
        if (recipe.id !== id) {
          return recipe;
        }

        updatedRecipe = {
          ...nextRecipe,
          id: recipe.id,
          saved: recipe.saved,
          featured: recipe.featured,
          isUserCreated: true,
        };

        return updatedRecipe;
      })
    );

    return updatedRecipe;
  }, []);

  const deleteRecipe = useCallback((id: string) => {
    if (SEED_RECIPE_IDS.has(id)) {
      return;
    }

    setRecipes((current) => current.filter((recipe) => recipe.id !== id));
    setSavedIds((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });
    setInteractions((current) => {
      const nextViewsByRecipeId = { ...current.viewsByRecipeId };
      delete nextViewsByRecipeId[id];

      return {
        ...current,
        viewsByRecipeId: nextViewsByRecipeId,
        recentlySavedRecipeIds: current.recentlySavedRecipeIds.filter((recipeId) => recipeId !== id),
      };
    });
    setMealPlans((current) => removeRecipeFromMealPlans(current, id));
  }, []);

  const setMealPlanSlot = useCallback((dateKey: string, slot: MealSlot, recipeId: string) => {
    setMealPlans((current) => ({
      ...current,
      [dateKey]: {
        ...(current[dateKey] ?? {}),
        [slot]: recipeId,
      },
    }));
  }, []);

  const clearMealPlanSlot = useCallback((dateKey: string, slot: MealSlot) => {
    setMealPlans((current) => {
      const nextDay = { ...(current[dateKey] ?? {}) };
      delete nextDay[slot];

      if (Object.keys(nextDay).length === 0) {
        const next = { ...current };
        delete next[dateKey];
        return next;
      }

      return {
        ...current,
        [dateKey]: nextDay,
      };
    });
  }, []);

  const setCookingProgress = useCallback((recipeId: string, stepIndex: number) => {
    setCookingProgressState((current) => {
      const nextStepIndex = Math.max(0, stepIndex);

      if ((current[recipeId] ?? 0) === nextStepIndex) {
        return current;
      }

      return {
        ...current,
        [recipeId]: nextStepIndex,
      };
    });
  }, []);

  const recordSearchQuery = useCallback((query: string) => {
    const normalized = query.trim().toLowerCase();

    if (normalized.length < 2) {
      return;
    }

    setInteractions((current) => {
      const nextSearches = [...current.searches.filter((item) => item !== normalized), normalized].slice(-12);
      return {
        ...current,
        searches: nextSearches,
      };
    });
  }, []);

  const trackRecipeView = useCallback((id: string) => {
    setInteractions((current) => ({
      ...current,
      viewsByRecipeId: {
        ...current.viewsByRecipeId,
        [id]: (current.viewsByRecipeId[id] ?? 0) + 1,
      },
    }));
  }, []);

  const value = useMemo(() => {
    const mappedRecipes = recipes.map((recipe) => ({
      ...recipe,
      saved: savedIds.has(recipe.id),
    }));
    const tasteProfile = buildTasteProfile(mappedRecipes, savedIds, interactions);
    const recommendationsEnabled = settings.smartSuggestions;

    settings.preferredCuisines.forEach((cuisine) => {
      tasteProfile.cuisines[cuisine] = (tasteProfile.cuisines[cuisine] ?? 0) + 8;
    });

    if (settings.dietaryFocus === 'vegetarian') {
      tasteProfile.tags.Vegetarian = (tasteProfile.tags.Vegetarian ?? 0) + 10;
      tasteProfile.tags.Fresh = (tasteProfile.tags.Fresh ?? 0) + 4;
    }

    if (settings.dietaryFocus === 'high-protein') {
      tasteProfile.tags['Protein-packed'] = (tasteProfile.tags['Protein-packed'] ?? 0) + 10;
      tasteProfile.categories['High protein'] = (tasteProfile.categories['High protein'] ?? 0) + 10;
    }

    if (settings.spiceLevel === 'mild') {
      tasteProfile.tags.Comfort = (tasteProfile.tags.Comfort ?? 0) + 4;
    }

    if (settings.spiceLevel === 'bold') {
      tasteProfile.tags.Spicy = (tasteProfile.tags.Spicy ?? 0) + 8;
    }

    return {
      recipes: mappedRecipes,
      featuredPick: pickFeaturedRecipe(mappedRecipes, savedIds, tasteProfile),
      kitchenPulse: recommendationsEnabled ? buildKitchenPulse(mappedRecipes, tasteProfile, interactions, mealPlans) : null,
      mealPlans,
      cookingProgress,
      savedCount: mappedRecipes.filter((recipe) => recipe.saved).length,
      searchRecipes: (query: string) => rankRecipes(mappedRecipes, query, tasteProfile),
      smartSuggestions: recommendationsEnabled ? buildSmartSuggestions(mappedRecipes, savedIds, tasteProfile) : [],
      smartCollections: recommendationsEnabled ? buildSmartCollections(mappedRecipes, savedIds, tasteProfile) : [],
      tasteProfile,
      toggleFavorite,
      clearSavedRecipes,
      addRecipeFromIdea,
      updateRecipeFromIdea,
      deleteRecipe,
      setMealPlanSlot,
      clearMealPlanSlot,
      setCookingProgress,
      recordSearchQuery,
      trackRecipeView,
    };
  }, [addRecipeFromIdea, clearMealPlanSlot, clearSavedRecipes, cookingProgress, deleteRecipe, interactions, mealPlans, recordSearchQuery, recipes, savedIds, setCookingProgress, setMealPlanSlot, settings, toggleFavorite, trackRecipeView, updateRecipeFromIdea]);

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipes() {
  const context = useContext(RecipesContext);

  if (!context) {
    throw new Error('useRecipes must be used inside RecipesProvider');
  }

  return context;
}
