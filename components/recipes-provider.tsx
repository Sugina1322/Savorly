import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

import { recipes as recipeSeed, Recipe } from '@/data/recipes';

type RecipesContextValue = {
  recipes: Recipe[];
  savedCount: number;
  toggleFavorite: (id: string) => void;
};

const RecipesContext = createContext<RecipesContextValue | null>(null);

export function RecipesProvider({ children }: PropsWithChildren) {
  const [savedIds, setSavedIds] = useState(() => new Set(recipeSeed.filter((recipe) => recipe.saved).map((recipe) => recipe.id)));

  const value = useMemo(() => {
    const mappedRecipes = recipeSeed.map((recipe) => ({
      ...recipe,
      saved: savedIds.has(recipe.id),
    }));

    return {
      recipes: mappedRecipes,
      savedCount: mappedRecipes.filter((recipe) => recipe.saved).length,
      toggleFavorite: (id: string) => {
        setSavedIds((current) => {
          const next = new Set(current);
          if (next.has(id)) {
            next.delete(id);
          } else {
            next.add(id);
          }
          return next;
        });
      },
    };
  }, [savedIds]);

  return <RecipesContext.Provider value={value}>{children}</RecipesContext.Provider>;
}

export function useRecipes() {
  const context = useContext(RecipesContext);

  if (!context) {
    throw new Error('useRecipes must be used inside RecipesProvider');
  }

  return context;
}
