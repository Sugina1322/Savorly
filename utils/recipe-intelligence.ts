import type { Recipe } from '@/data/recipes';

export type SearchResult = {
  recipe: Recipe;
  score: number;
  reason: string;
};

export type SmartCollection = {
  id: string;
  title: string;
  subtitle: string;
  recipeIds: string[];
};

export type UserInteractions = {
  searches: string[];
  viewsByRecipeId: Record<string, number>;
};

export type TasteProfile = {
  cuisines: Record<string, number>;
  tags: Record<string, number>;
  ingredients: Record<string, number>;
  preferredCookTime: number | null;
};

type AddRecipeIdea = {
  title: string;
  cuisine: string;
  cookTime: string;
  description: string;
};

const STOP_WORDS = new Set(['the', 'and', 'with', 'for', 'your', 'into', 'from', 'that', 'this', 'are']);
const K1 = 1.4;
const B = 0.75;

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function tokenize(text: string) {
  return normalize(text)
    .split(/[^a-z0-9]+/i)
    .map((token) => token.trim())
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

function unique<T>(items: T[]) {
  return [...new Set(items)];
}

function incrementWeight(map: Record<string, number>, key: string, amount: number) {
  map[key] = (map[key] ?? 0) + amount;
}

function getRecipeTokens(recipe: Recipe) {
  return unique([
    ...tokenize(recipe.title),
    ...tokenize(recipe.cuisine),
    ...tokenize(recipe.description),
    ...recipe.tags.flatMap((tag) => tokenize(tag)),
    ...recipe.ingredients.flatMap((ingredient) => tokenize(ingredient)),
  ]);
}

function getDocumentLength(recipe: Recipe) {
  return getRecipeTokens(recipe).length;
}

function getTokenFrequency(recipe: Recipe, token: string) {
  const fields = [
    recipe.title,
    recipe.cuisine,
    recipe.description,
    recipe.tags.join(' '),
    recipe.ingredients.join(' '),
  ]
    .join(' ')
    .toLowerCase();

  return fields.split(token).length - 1;
}

function getDocumentFrequency(recipes: Recipe[], token: string) {
  return recipes.reduce((count, recipe) => {
    const hasToken = getRecipeTokens(recipe).includes(token);
    return hasToken ? count + 1 : count;
  }, 0);
}

function getBm25Score(recipe: Recipe, recipes: Recipe[], queryTokens: string[]) {
  const avgDocLength =
    recipes.reduce((total, current) => total + getDocumentLength(current), 0) / Math.max(recipes.length, 1);
  const docLength = getDocumentLength(recipe);

  return queryTokens.reduce((score, token) => {
    const tf = getTokenFrequency(recipe, token);

    if (tf === 0) {
      return score;
    }

    const df = getDocumentFrequency(recipes, token);
    const idf = Math.log(1 + (recipes.length - df + 0.5) / (df + 0.5));
    const numerator = tf * (K1 + 1);
    const denominator = tf + K1 * (1 - B + B * (docLength / Math.max(avgDocLength, 1)));

    return score + idf * (numerator / denominator);
  }, 0);
}

export function buildTasteProfile(recipes: Recipe[], savedIds: Set<string>, interactions: UserInteractions): TasteProfile {
  const cuisines: Record<string, number> = {};
  const tags: Record<string, number> = {};
  const ingredients: Record<string, number> = {};
  const cookTimes: number[] = [];

  recipes.forEach((recipe) => {
    const saveBoost = savedIds.has(recipe.id) ? 6 : 0;
    const viewBoost = interactions.viewsByRecipeId[recipe.id] ?? 0;
    const weight = saveBoost + viewBoost;

    if (weight === 0) {
      return;
    }

    incrementWeight(cuisines, recipe.cuisine, weight);
    recipe.tags.forEach((tag) => incrementWeight(tags, tag, weight));
    recipe.ingredients.forEach((ingredient) => incrementWeight(ingredients, normalize(ingredient), Math.max(1, weight / 2)));

    for (let index = 0; index < weight; index += 1) {
      cookTimes.push(recipe.cookTime);
    }
  });

  interactions.searches.forEach((search, index) => {
    const recencyWeight = Math.max(1, interactions.searches.length - index);
    tokenize(search).forEach((token) => incrementWeight(ingredients, token, recencyWeight));
  });

  const preferredCookTime =
    cookTimes.length > 0 ? Math.round(cookTimes.reduce((total, time) => total + time, 0) / cookTimes.length) : null;

  return {
    cuisines,
    tags,
    ingredients,
    preferredCookTime,
  };
}

function getTasteBoost(recipe: Recipe, tasteProfile: TasteProfile) {
  const cuisineBoost = tasteProfile.cuisines[recipe.cuisine] ?? 0;
  const tagBoost = recipe.tags.reduce((total, tag) => total + (tasteProfile.tags[tag] ?? 0), 0);
  const ingredientBoost = recipe.ingredients.reduce(
    (total, ingredient) => total + (tasteProfile.ingredients[normalize(ingredient)] ?? 0),
    0
  );
  const timeBoost =
    tasteProfile.preferredCookTime === null
      ? 0
      : Math.max(0, 6 - Math.abs(recipe.cookTime - tasteProfile.preferredCookTime) / 5);

  return cuisineBoost * 0.8 + tagBoost * 0.45 + ingredientBoost * 0.18 + timeBoost;
}

export function rankRecipes(recipes: Recipe[], query: string, tasteProfile: TasteProfile) {
  const queryTokens = unique(tokenize(query));

  if (queryTokens.length === 0) {
    return recipes
      .map((recipe) => ({
        recipe,
        score: getTasteBoost(recipe, tasteProfile) + (recipe.saved ? 5 : 0) + (recipe.featured ? 2 : 0),
        reason: recipe.saved
          ? 'Saved and reinforced by your taste profile'
          : recipe.featured
            ? 'Featured and aligned with your taste profile'
            : 'Recommended from your taste profile',
      }))
      .sort((left, right) => right.score - left.score);
  }

  return recipes
    .map<SearchResult | null>((recipe) => {
      const bm25 = getBm25Score(recipe, recipes, queryTokens);
      const tasteBoost = getTasteBoost(recipe, tasteProfile);
      const titleMatch = queryTokens.some((token) => recipe.title.toLowerCase().includes(token));
      const ingredientMatch = queryTokens.some((token) =>
        recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(token))
      );
      const score = bm25 * 10 + tasteBoost + (titleMatch ? 3 : 0) + (ingredientMatch ? 2 : 0);

      if (score <= 0) {
        return null;
      }

      const reason = titleMatch
        ? 'BM25-style title match plus taste-profile boost'
        : ingredientMatch
          ? 'Ingredient match plus taste-profile boost'
          : 'Semantic-style keyword match from your taste profile';

      return {
        recipe,
        score,
        reason,
      };
    })
    .filter((result): result is SearchResult => Boolean(result))
    .sort((left, right) => right.score - left.score);
}

export function buildSmartSuggestions(recipes: Recipe[], savedIds: Set<string>, tasteProfile: TasteProfile) {
  return recipes
    .filter((recipe) => !savedIds.has(recipe.id))
    .map((recipe) => {
      const tasteBoost = getTasteBoost(recipe, tasteProfile);
      const explorationBoost = recipe.featured ? 1.5 : 0;
      const freshnessBoost = recipe.cookTime <= 25 ? 1 : 0;
      const score = tasteBoost + explorationBoost + freshnessBoost;

      const strongestTag = recipe.tags.find((tag) => (tasteProfile.tags[tag] ?? 0) > 0);
      const reason = strongestTag
        ? `Taste-profile match on ${strongestTag.toLowerCase()}`
        : (tasteProfile.cuisines[recipe.cuisine] ?? 0) > 0
          ? `You keep leaning toward ${recipe.cuisine}`
          : 'Exploration pick with a lighter relevance boost';

      return {
        recipe,
        score,
        reason,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 4);
}

function getTopKeys(map: Record<string, number>, limit: number) {
  return Object.entries(map)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([key]) => key);
}

export function buildSmartCollections(recipes: Recipe[], savedIds: Set<string>, tasteProfile: TasteProfile): SmartCollection[] {
  const topCuisine = getTopKeys(tasteProfile.cuisines, 1)[0];
  const topTag = getTopKeys(tasteProfile.tags, 1)[0];
  const source = recipes.filter((recipe) => savedIds.has(recipe.id));
  const activeRecipes = source.length > 0 ? source : recipes;

  const byTopCuisine = topCuisine ? activeRecipes.filter((recipe) => recipe.cuisine === topCuisine).map((recipe) => recipe.id) : [];
  const byTopTag = topTag ? activeRecipes.filter((recipe) => recipe.tags.includes(topTag)).map((recipe) => recipe.id) : [];
  const quickWins = activeRecipes.filter((recipe) => recipe.cookTime <= 20).map((recipe) => recipe.id);
  const balanced = activeRecipes
    .filter((recipe) =>
      tasteProfile.preferredCookTime === null ? true : Math.abs(recipe.cookTime - tasteProfile.preferredCookTime) <= 8
    )
    .map((recipe) => recipe.id);

  const collections = [
    topCuisine
      ? {
          id: 'taste-cuisine',
          title: `${topCuisine} Focus`,
          subtitle: 'Built from the cuisine your taste profile favors most.',
          recipeIds: byTopCuisine.slice(0, 4),
        }
      : null,
    topTag
      ? {
          id: 'taste-tag',
          title: `${topTag} Energy`,
          subtitle: 'Recipes clustered by your strongest taste-profile tag.',
          recipeIds: byTopTag.slice(0, 4),
        }
      : null,
    {
      id: 'weeknight-wins',
      title: 'Weeknight Wins',
      subtitle: 'Faster recipes chosen with your taste profile in mind.',
      recipeIds: quickWins.slice(0, 4),
    },
    {
      id: 'balanced-picks',
      title: 'Balanced Picks',
      subtitle: 'Recipes that match your usual cooking-time comfort zone.',
      recipeIds: balanced.slice(0, 4),
    },
  ];

  return collections.filter((collection): collection is SmartCollection => collection !== null && collection.recipeIds.length > 0);
}

function inferCuisine(title: string, cuisine: string) {
  const normalizedCuisine = normalize(cuisine);
  if (normalizedCuisine) {
    return cuisine.trim();
  }

  const normalizedTitle = normalize(title);
  if (normalizedTitle.includes('taco')) return 'Mexican-inspired';
  if (normalizedTitle.includes('pasta')) return 'Italian-inspired';
  if (normalizedTitle.includes('curry')) return 'South Asian-inspired';
  if (normalizedTitle.includes('salad')) return 'Fresh fusion';
  if (normalizedTitle.includes('bowl')) return 'Asian-inspired';
  return 'Modern home kitchen';
}

function inferCookTime(cookTime: string, title: string) {
  const parsed = Number.parseInt(cookTime, 10);
  if (Number.isFinite(parsed) && parsed > 0) {
    return parsed;
  }

  const normalizedTitle = normalize(title);
  if (normalizedTitle.includes('toast')) return 10;
  if (normalizedTitle.includes('salad')) return 15;
  if (normalizedTitle.includes('pasta')) return 30;
  if (normalizedTitle.includes('taco')) return 20;
  return 25;
}

function inferTags(title: string, description: string, cookTime: number) {
  const base = tokenize(`${title} ${description}`);
  const tags = [];

  if (cookTime <= 20) tags.push('Quick');
  if (base.includes('spicy')) tags.push('Spicy');
  if (base.includes('comfort') || base.includes('creamy')) tags.push('Comfort');
  if (base.includes('salad') || base.includes('citrus') || base.includes('fresh')) tags.push('Fresh');
  if (base.includes('breakfast') || base.includes('toast')) tags.push('Breakfast');
  if (base.includes('chicken') || base.includes('salmon') || base.includes('shrimp')) tags.push('Protein-packed');

  return unique(tags.length > 0 ? tags : ['Weeknight', cookTime <= 20 ? 'Quick' : 'Comfort']);
}

function inferIngredients(title: string, cuisine: string, description: string) {
  const text = normalize(`${title} ${cuisine} ${description}`);
  const ingredients = ['Olive oil', 'Salt', 'Black pepper'];

  if (text.includes('pasta')) ingredients.push('Pasta', 'Garlic', 'Parmesan');
  if (text.includes('chicken')) ingredients.push('Chicken breast');
  if (text.includes('salmon')) ingredients.push('Salmon fillet');
  if (text.includes('shrimp')) ingredients.push('Shrimp');
  if (text.includes('taco')) ingredients.push('Tortillas', 'Lime');
  if (text.includes('salad')) ingredients.push('Mixed greens', 'Lemon');
  if (text.includes('rice') || text.includes('bowl')) ingredients.push('Cooked rice');
  if (text.includes('spicy')) ingredients.push('Chili flakes');
  if (text.includes('creamy')) ingredients.push('Cream');
  if (text.includes('toast')) ingredients.push('Sourdough bread');

  return unique(ingredients).slice(0, 8);
}

function buildSteps(title: string, ingredients: string[]) {
  const core = ingredients.slice(0, 4).join(', ');
  return [
    `Prep the main ingredients for ${title.toLowerCase()}, starting with ${core.toLowerCase()}.`,
    'Cook the main components until fragrant, caramelized, and properly seasoned.',
    'Bring everything together with a quick finishing sauce or final seasoning pass.',
    'Plate, taste, and finish with any bright or crunchy toppings before serving.',
  ];
}

function getSmartImage(title: string, cuisine: string) {
  const text = normalize(`${title} ${cuisine}`);
  if (text.includes('salad')) return 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80';
  if (text.includes('taco')) return 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1200&q=80';
  if (text.includes('pasta')) return 'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=1200&q=80';
  if (text.includes('toast') || text.includes('breakfast')) return 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1200&q=80';
  return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80';
}

export function buildRecipeDraft({ cookTime, cuisine, description, title }: AddRecipeIdea): Recipe {
  const finalTitle = title.trim() || 'Smart Kitchen Creation';
  const finalCuisine = inferCuisine(finalTitle, cuisine);
  const finalCookTime = inferCookTime(cookTime, finalTitle);
  const finalDescription =
    description.trim() ||
    `A smartly generated ${finalCuisine.toLowerCase()} recipe built around ${finalTitle.toLowerCase()} for an easy home-cooking win.`;
  const ingredients = inferIngredients(finalTitle, finalCuisine, finalDescription);

  return {
    id: `${normalize(finalTitle).replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    title: finalTitle,
    description: finalDescription,
    image: getSmartImage(finalTitle, finalCuisine),
    cuisine: finalCuisine,
    cookTime: finalCookTime,
    servings: finalCookTime <= 15 ? 2 : 4,
    featured: false,
    saved: true,
    tags: inferTags(finalTitle, finalDescription, finalCookTime),
    ingredients,
    steps: buildSteps(finalTitle, ingredients),
  };
}
