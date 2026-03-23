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
const STORAGE_WRITE_DEBOUNCE_MS = 250;

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

function useDebouncedStorageWrite(key: string, value: string, isEnabled: boolean, errorLabel: string) {
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const timeout = setTimeout(() => {
      AsyncStorage.setItem(key, value).catch((error) => {
        console.warn(errorLabel, error);
      });
    }, STORAGE_WRITE_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [errorLabel, isEnabled, key, value]);
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
  const mappedRecipes = useMemo(
    () =>
      recipes.map((recipe) => ({
        ...recipe,
        saved: savedIds.has(recipe.id),
      })),
    [recipes, savedIds]
  );
  const recommendationsEnabled = settings.smartSuggestions;

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

  useDebouncedStorageWrite(
    buildStorageKey(RECIPES_STORAGE_KEY, storageScope),
    JSON.stringify(mappedRecipes),
    isHydrated,
    'Failed to save recipes'
  );
  useDebouncedStorageWrite(
    buildStorageKey(RECIPE_SIGNALS_STORAGE_KEY, storageScope),
    JSON.stringify(interactions),
    isHydrated,
    'Failed to save recipe signals'
  );
  useDebouncedStorageWrite(
    buildStorageKey(MEAL_PLAN_STORAGE_KEY, storageScope),
    JSON.stringify(mealPlans),
    isHydrated,
    'Failed to save meal plans'
  );
  useDebouncedStorageWrite(
    buildStorageKey(COOKING_PROGRESS_STORAGE_KEY, storageScope),
    JSON.stringify(cookingProgress),
    isHydrated,
    'Failed to save cooking progress'
  );

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

  const enhancedTasteProfile = useMemo(() => {
    const tasteProfile = buildTasteProfile(mappedRecipes, savedIds, interactions);
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

    return tasteProfile;
  }, [interactions, mappedRecipes, savedIds, settings.dietaryFocus, settings.preferredCuisines, settings.smartSuggestions, settings.spiceLevel]);
  const featuredPick = useMemo(
    () => pickFeaturedRecipe(mappedRecipes, savedIds, enhancedTasteProfile),
    [enhancedTasteProfile, mappedRecipes, savedIds]
  );
  const kitchenPulse = useMemo(
    () => (recommendationsEnabled ? buildKitchenPulse(mappedRecipes, enhancedTasteProfile, interactions, mealPlans) : null),
    [enhancedTasteProfile, interactions, mappedRecipes, mealPlans, recommendationsEnabled]
  );
  const smartSuggestions = useMemo(
    () => (recommendationsEnabled ? buildSmartSuggestions(mappedRecipes, savedIds, enhancedTasteProfile) : []),
    [enhancedTasteProfile, mappedRecipes, recommendationsEnabled, savedIds]
  );
  const smartCollections = useMemo(
    () => (recommendationsEnabled ? buildSmartCollections(mappedRecipes, savedIds, enhancedTasteProfile) : []),
    [enhancedTasteProfile, mappedRecipes, recommendationsEnabled, savedIds]
  );
  const savedCount = savedIds.size;
  const searchRecipes = useCallback(
    (query: string) => rankRecipes(mappedRecipes, query, enhancedTasteProfile),
    [enhancedTasteProfile, mappedRecipes]
  );

  const value = useMemo(() => {
    return {
      recipes: mappedRecipes,
      featuredPick,
      kitchenPulse,
      mealPlans,
      cookingProgress,
      savedCount,
      searchRecipes,
      smartSuggestions,
      smartCollections,
      tasteProfile: enhancedTasteProfile,
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
  }, [addRecipeFromIdea, clearMealPlanSlot, clearSavedRecipes, cookingProgress, deleteRecipe, enhancedTasteProfile, featuredPick, kitchenPulse, mappedRecipes, mealPlans, recordSearchQuery, savedCount, searchRecipes, setCookingProgress, setMealPlanSlot, smartCollections, smartSuggestions, toggleFavorite, trackRecipeView, updateRecipeFromIdea]);

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipes() {
  const context = useContext(RecipesContext);

  if (!context) {
    throw new Error('useRecipes must be used inside RecipesProvider');
  }

  return context;
}
