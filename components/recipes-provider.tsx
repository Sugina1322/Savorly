import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { recipes as recipeSeed, Recipe } from '@/data/recipes';
import { useSettings } from '@/components/settings-provider';
import {
  buildTasteProfile,
  buildRecipeDraft,
  buildSmartCollections,
  buildSmartSuggestions,
  rankRecipes,
  type SearchResult,
  type SmartCollection,
  type TasteProfile,
  type UserInteractions,
} from '@/utils/recipe-intelligence';

type RecipesContextValue = {
  recipes: Recipe[];
  savedCount: number;
  toggleFavorite: (id: string) => void;
  searchRecipes: (query: string) => SearchResult[];
  smartSuggestions: { recipe: Recipe; score: number; reason: string }[];
  smartCollections: SmartCollection[];
  addRecipeFromIdea: (input: { title: string; cuisine: string; cookTime: string; description: string }) => Recipe;
  recordSearchQuery: (query: string) => void;
  trackRecipeView: (id: string) => void;
  tasteProfile: TasteProfile;
};

type AddRecipeInput = {
  title: string;
  cuisine: string;
  cookTime: string;
  description: string;
};

const RecipesContext = createContext<RecipesContextValue | null>(null);
const RECIPES_STORAGE_KEY = 'savorly.recipes.v2';
const RECIPE_SIGNALS_STORAGE_KEY = 'savorly.recipe-signals.v2';
const DEFAULT_INTERACTIONS: UserInteractions = {
  searches: [],
  viewsByRecipeId: {},
};

export function RecipesProvider({ children }: PropsWithChildren) {
  const { settings } = useSettings();
  const [recipes, setRecipes] = useState(recipeSeed);
  const [savedIds, setSavedIds] = useState(() => new Set(recipeSeed.filter((recipe) => recipe.saved).map((recipe) => recipe.id)));
  const [interactions, setInteractions] = useState<UserInteractions>(DEFAULT_INTERACTIONS);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    Promise.all([AsyncStorage.getItem(RECIPES_STORAGE_KEY), AsyncStorage.getItem(RECIPE_SIGNALS_STORAGE_KEY)])
      .then(([storedRecipes, storedSignals]) => {
        if (storedRecipes) {
          try {
            const parsedRecipes = JSON.parse(storedRecipes) as Recipe[];
            setRecipes(parsedRecipes);
            setSavedIds(new Set(parsedRecipes.filter((recipe) => recipe.saved).map((recipe) => recipe.id)));
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
    }

    if (settings.spiceLevel === 'mild') {
      tasteProfile.tags.Comfort = (tasteProfile.tags.Comfort ?? 0) + 4;
    }

    if (settings.spiceLevel === 'bold') {
      tasteProfile.tags.Spicy = (tasteProfile.tags.Spicy ?? 0) + 8;
    }

    return {
      recipes: mappedRecipes,
      savedCount: mappedRecipes.filter((recipe) => recipe.saved).length,
      searchRecipes: (query: string) => rankRecipes(mappedRecipes, query, tasteProfile),
      smartSuggestions: buildSmartSuggestions(mappedRecipes, savedIds, tasteProfile),
      smartCollections: buildSmartCollections(mappedRecipes, savedIds, tasteProfile),
      tasteProfile,
      toggleFavorite,
      addRecipeFromIdea,
      recordSearchQuery,
      trackRecipeView,
    };
  }, [addRecipeFromIdea, interactions, recordSearchQuery, recipes, savedIds, settings, toggleFavorite, trackRecipeView]);

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipes() {
  const context = useContext(RecipesContext);

  if (!context) {
    throw new Error('useRecipes must be used inside RecipesProvider');
  }

  return context;
}
