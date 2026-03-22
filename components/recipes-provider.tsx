import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { recipes as recipeSeed, Recipe } from '@/data/recipes';
import { useSettings } from '@/components/settings-provider';
import {
  buildKitchenPulse,
  buildTasteProfile,
  buildRecipeDraft,
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
} from '@/utils/recipe-intelligence';

type RecipesContextValue = {
  recipes: Recipe[];
  featuredPick: FeaturedRecipePick | null;
  kitchenPulse: KitchenPulse;
  mealPlans: Record<string, Partial<Record<MealSlot, string>>>;
  savedCount: number;
  toggleFavorite: (id: string) => void;
  searchRecipes: (query: string) => SearchResult[];
  smartSuggestions: { recipe: Recipe; score: number; reason: string }[];
  smartCollections: SmartCollection[];
  addRecipeFromIdea: (input: {
    title: string;
    cuisine: string;
    cookTime: string;
    servings?: string;
    description: string;
    ingredients?: string[];
    steps?: string[];
  }) => Recipe;
  deleteRecipe: (id: string) => void;
  setMealPlanSlot: (dateKey: string, slot: MealSlot, recipeId: string) => void;
  clearMealPlanSlot: (dateKey: string, slot: MealSlot) => void;
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
  ingredients?: string[];
  steps?: string[];
};

export type MealSlot = 'breakfast' | 'lunch' | 'dinner';

const RecipesContext = createContext<RecipesContextValue | null>(null);
const RECIPES_STORAGE_KEY = 'savorly.recipes.v2';
const RECIPE_SIGNALS_STORAGE_KEY = 'savorly.recipe-signals.v2';
const MEAL_PLAN_STORAGE_KEY = 'savorly.meal-plan.v1';
const DEFAULT_INTERACTIONS: UserInteractions = {
  searches: [],
  viewsByRecipeId: {},
};
const SEED_RECIPE_IDS = new Set(recipeSeed.map((recipe) => recipe.id));

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
      ...recipe,
      isUserCreated: true,
    }));

  return [...customRecipes, ...mergedSeedRecipes];
}

export function RecipesProvider({ children }: PropsWithChildren) {
  const { settings } = useSettings();
  const [recipes, setRecipes] = useState(recipeSeed);
  const [savedIds, setSavedIds] = useState(() => new Set(recipeSeed.filter((recipe) => recipe.saved).map((recipe) => recipe.id)));
  const [interactions, setInteractions] = useState<UserInteractions>(DEFAULT_INTERACTIONS);
  const [mealPlans, setMealPlans] = useState<Record<string, Partial<Record<MealSlot, string>>>>({});
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(RECIPES_STORAGE_KEY),
      AsyncStorage.getItem(RECIPE_SIGNALS_STORAGE_KEY),
      AsyncStorage.getItem(MEAL_PLAN_STORAGE_KEY),
    ])
      .then(([storedRecipes, storedSignals, storedMealPlans]) => {
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
      })
      .finally(() => setIsHydrated(true));
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const mappedRecipes = recipes.map((recipe) => ({
      ...recipe,
      saved: savedIds.has(recipe.id),
    }));

    AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(mappedRecipes)).catch((error) => {
      console.warn('Failed to save recipes', error);
    });
  }, [isHydrated, recipes, savedIds]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(RECIPE_SIGNALS_STORAGE_KEY, JSON.stringify(interactions)).catch((error) => {
      console.warn('Failed to save recipe signals', error);
    });
  }, [interactions, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(MEAL_PLAN_STORAGE_KEY, JSON.stringify(mealPlans)).catch((error) => {
      console.warn('Failed to save meal plans', error);
    });
  }, [isHydrated, mealPlans]);

  const toggleFavorite = useCallback((id: string) => {
    setSavedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
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
      kitchenPulse: buildKitchenPulse(mappedRecipes, tasteProfile, interactions, mealPlans),
      mealPlans,
      savedCount: mappedRecipes.filter((recipe) => recipe.saved).length,
      searchRecipes: (query: string) => rankRecipes(mappedRecipes, query, tasteProfile),
      smartSuggestions: buildSmartSuggestions(mappedRecipes, savedIds, tasteProfile),
      smartCollections: buildSmartCollections(mappedRecipes, savedIds, tasteProfile),
      tasteProfile,
      toggleFavorite,
      addRecipeFromIdea,
      deleteRecipe,
      setMealPlanSlot,
      clearMealPlanSlot,
      recordSearchQuery,
      trackRecipeView,
    };
  }, [addRecipeFromIdea, clearMealPlanSlot, deleteRecipe, interactions, mealPlans, recordSearchQuery, recipes, savedIds, setMealPlanSlot, settings, toggleFavorite, trackRecipeView]);

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipes() {
  const context = useContext(RecipesContext);

  if (!context) {
    throw new Error('useRecipes must be used inside RecipesProvider');
  }

  return context;
}
