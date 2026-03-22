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

export type PantryMatchResult = {
  recipe: Recipe;
  score: number;
  matchedIngredients: string[];
  missingIngredients: string[];
  reason: string;
};

export type FeaturedRecipePick = {
  recipe: Recipe;
  reason: string;
};

export type MealPlannerFilterKey = 'smart' | 'saved' | 'budget' | 'quick' | 'high-protein';

export type UserInteractions = {
  searches: string[];
  viewsByRecipeId: Record<string, number>;
};

export type TasteProfile = {
  cuisines: Record<string, number>;
  categories: Record<string, number>;
  tags: Record<string, number>;
  ingredients: Record<string, number>;
  preferredCookTime: number | null;
};

export type MealPlannerResult = {
  recipe: Recipe;
  score: number;
  reason: string;
};

export type KitchenPulse = {
  category: string;
  reason: string;
};

type AddRecipeIdea = {
  title: string;
  cuisine: string;
  cookTime: string;
  servings?: string;
  description: string;
  ingredients?: string[];
  steps?: string[];
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
    ...recipe.categories.flatMap((category) => tokenize(category)),
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
    recipe.categories.join(' '),
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
  const categories: Record<string, number> = {};
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
    recipe.categories.forEach((category) => incrementWeight(categories, category, weight));
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
    categories,
    tags,
    ingredients,
    preferredCookTime,
  };
}

function getTasteBoost(recipe: Recipe, tasteProfile: TasteProfile) {
  const cuisineBoost = tasteProfile.cuisines[recipe.cuisine] ?? 0;
  const categoryBoost = recipe.categories.reduce((total, category) => total + (tasteProfile.categories[category] ?? 0), 0);
  const tagBoost = recipe.tags.reduce((total, tag) => total + (tasteProfile.tags[tag] ?? 0), 0);
  const ingredientBoost = recipe.ingredients.reduce(
    (total, ingredient) => total + (tasteProfile.ingredients[normalize(ingredient)] ?? 0),
    0
  );
  const timeBoost =
    tasteProfile.preferredCookTime === null
      ? 0
      : Math.max(0, 6 - Math.abs(recipe.cookTime - tasteProfile.preferredCookTime) / 5);

  return cuisineBoost * 0.8 + categoryBoost * 0.4 + tagBoost * 0.45 + ingredientBoost * 0.18 + timeBoost;
}

function getDayPart(date: Date) {
  const hour = date.getHours();

  if (hour < 11) return 'morning';
  if (hour < 16) return 'midday';
  return 'evening';
}

function getDailyRotationBoost(recipeId: string, date: Date) {
  const dateKey = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  const source = `${recipeId}-${dateKey}`;
  let hash = 0;

  for (const character of source) {
    hash = (hash * 31 + character.charCodeAt(0)) % 997;
  }

  return (hash % 23) / 10;
}

function getDayPartBoost(recipe: Recipe, date: Date) {
  const dayPart = getDayPart(date);
  const categories = new Set(recipe.categories);
  const tags = new Set(recipe.tags);

  if (dayPart === 'morning') {
    if (categories.has('Breakfast') || tags.has('Breakfast')) return 5;
    if (categories.has('Easy recipes')) return 2;
  }

  if (dayPart === 'midday') {
    if (categories.has('Easy recipes') || tags.has('Quick')) return 4;
    if (categories.has('Pantry-friendly')) return 2;
  }

  if (dayPart === 'evening') {
    if (categories.has('Everyday food')) return 4;
    if (categories.has('Restaurant-like')) return 3;
    if (tags.has('Comfort')) return 2;
  }

  return 0;
}

function getCurrentMealSlot(date: Date): 'breakfast' | 'lunch' | 'dinner' {
  const hour = date.getHours();

  if (hour < 11) return 'breakfast';
  if (hour < 17) return 'lunch';
  return 'dinner';
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export function pickFeaturedRecipe(recipes: Recipe[], savedIds: Set<string>, tasteProfile: TasteProfile, now = new Date()): FeaturedRecipePick | null {
  if (recipes.length === 0) {
    return null;
  }

  const ranked = recipes
    .map((recipe) => {
      const tasteBoost = getTasteBoost(recipe, tasteProfile);
      const editorialBoost = recipe.featured ? 2.5 : 0;
      const savedPenalty = savedIds.has(recipe.id) ? 1.25 : 0;
      const timingBoost = getDayPartBoost(recipe, now);
      const rotationBoost = getDailyRotationBoost(recipe.id, now);
      const score = tasteBoost + editorialBoost + timingBoost + rotationBoost - savedPenalty;

      return {
        recipe,
        score,
        tasteBoost,
        timingBoost,
      };
    })
    .sort((left, right) => right.score - left.score);

  const winner = ranked[0];
  const dayPart = getDayPart(now);
  const reason =
    winner.timingBoost >= 4
      ? dayPart === 'morning'
        ? 'Picked for the morning with a breakfast-friendly lean'
        : dayPart === 'midday'
          ? 'Picked for a faster midday cook'
          : 'Picked for tonight based on comfort and dinner fit'
      : winner.tasteBoost > 0
        ? 'Picked from your taste profile and recent cooking habits'
        : winner.recipe.featured
          ? 'Picked from the editor-curated featured recipes for today'
          : 'Picked as a fresh daily rotation from the recipe board';

  return {
    recipe: winner.recipe,
    reason,
  };
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

export function buildKitchenPulse(
  recipes: Recipe[],
  tasteProfile: TasteProfile,
  interactions: UserInteractions,
  mealPlans: Record<string, Partial<Record<'breakfast' | 'lunch' | 'dinner', string>>>,
  now = new Date()
): KitchenPulse {
  const scores: Record<string, number> = {};

  Object.entries(tasteProfile.categories).forEach(([category, score]) => {
    incrementWeight(scores, category, score);
  });

  interactions.searches.slice(-5).forEach((search, index, array) => {
    const recencyWeight = array.length - index + 2;
    const tokens = tokenize(search);

    recipes.forEach((recipe) => {
      const recipeTokens = getRecipeTokens(recipe);
      const hasMatch = tokens.some((token) => recipeTokens.includes(token));

      if (!hasMatch) {
        return;
      }

      recipe.categories.forEach((category) => incrementWeight(scores, category, recencyWeight));
    });
  });

  const todayKey = getDateKey(now);
  const tomorrowKey = getDateKey(addDays(now, 1));
  const currentSlot = getCurrentMealSlot(now);
  const currentPlannedRecipeId = mealPlans[todayKey]?.[currentSlot];
  const currentPlannedRecipe = recipes.find((recipe) => recipe.id === currentPlannedRecipeId);

  if (currentPlannedRecipe) {
    currentPlannedRecipe.categories.forEach((category) => incrementWeight(scores, category, 12));
  }

  Object.values(mealPlans[todayKey] ?? {}).forEach((recipeId) => {
    const recipe = recipes.find((item) => item.id === recipeId);
    if (!recipe) return;
    recipe.categories.forEach((category) => incrementWeight(scores, category, 5));
  });

  Object.values(mealPlans[tomorrowKey] ?? {}).forEach((recipeId) => {
    const recipe = recipes.find((item) => item.id === recipeId);
    if (!recipe) return;
    recipe.categories.forEach((category) => incrementWeight(scores, category, 2));
  });

  const winner = Object.entries(scores).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'Still learning';

  let reason = 'Still learning from your recipe habits.';

  if (currentPlannedRecipe && currentPlannedRecipe.categories.includes(winner)) {
    reason = `Leaning into ${winner.toLowerCase()} because it matches your current planned ${currentSlot}.`;
  } else if (interactions.searches.length > 0) {
    reason = `Leaning into ${winner.toLowerCase()} from your recent searches, saves, and recipe views.`;
  } else if ((tasteProfile.categories[winner] ?? 0) > 0) {
    reason = `Leaning into ${winner.toLowerCase()} from what you keep saving and opening lately.`;
  }

  return {
    category: winner,
    reason,
  };
}

export function recommendMealRecipes(
  recipes: Recipe[],
  tasteProfile: TasteProfile,
  slot: 'breakfast' | 'lunch' | 'dinner',
  filter: MealPlannerFilterKey,
  query = ''
) {
  const queryTokens = unique(tokenize(query));

  return recipes
    .map<MealPlannerResult | null>((recipe) => {
      if (filter === 'saved' && !recipe.saved) {
        return null;
      }

      const tasteBoost = getTasteBoost(recipe, tasteProfile);
      const bm25 = queryTokens.length > 0 ? getBm25Score(recipe, recipes, queryTokens) * 8 : 0;
      const categories = new Set(recipe.categories);
      const tags = new Set(recipe.tags);

      let slotBoost = 0;
      let slotReason = '';

      if (slot === 'breakfast') {
        if (categories.has('Breakfast') || tags.has('Breakfast')) {
          slotBoost += 6;
          slotReason = 'Breakfast-friendly pick';
        }
        if (categories.has('Easy recipes') || tags.has('Quick')) slotBoost += 2.5;
        if (recipe.cookTime <= 15) slotBoost += 1.5;
      }

      if (slot === 'lunch') {
        if (categories.has('Everyday food')) {
          slotBoost += 4;
          slotReason = 'Balanced lunch fit';
        }
        if (categories.has('Pantry-friendly') || tags.has('Fresh')) slotBoost += 2;
        if (recipe.cookTime <= 20) slotBoost += 1.5;
      }

      if (slot === 'dinner') {
        if (categories.has('Everyday food') || tags.has('Comfort')) {
          slotBoost += 5;
          slotReason = 'Strong dinner match';
        }
        if (categories.has('Restaurant-like')) slotBoost += 2.5;
        if (tags.has('Weeknight')) slotBoost += 1.5;
      }

      let filterBoost = 0;
      let filterReason = '';

      if (filter === 'smart') {
        filterBoost += recipe.saved ? 1 : 0;
      }

      if (filter === 'budget') {
        if (tags.has('Budget') || categories.has('Pantry-friendly')) {
          filterBoost += 5;
          filterReason = 'Budget-friendly option';
        }
      }

      if (filter === 'quick') {
        if (tags.has('Quick') || categories.has('Easy recipes') || recipe.cookTime <= 20) {
          filterBoost += 5;
          filterReason = 'Fast to make';
        }
      }

      if (filter === 'high-protein') {
        if (tags.has('High-protein') || tags.has('Protein-packed') || categories.has('High protein')) {
          filterBoost += 5;
          filterReason = 'Higher-protein choice';
        }
      }

      if (filter === 'saved' && recipe.saved) {
        filterBoost += 4;
        filterReason = 'Already saved by you';
      }

      const score = tasteBoost + bm25 + slotBoost + filterBoost + (recipe.featured ? 1 : 0);

      if (score <= 0) {
        return null;
      }

      return {
        recipe,
        score,
        reason: filterReason || slotReason || (bm25 > 0 ? 'Matches your planner search' : 'Recommended for this meal'),
      };
    })
    .filter((result): result is MealPlannerResult => Boolean(result))
    .sort((left, right) => right.score - left.score);
}

function getTopKeys(map: Record<string, number>, limit: number) {
  return Object.entries(map)
    .sort((left, right) => right[1] - left[1])
    .slice(0, limit)
    .map(([key]) => key);
}

function buildPantryTokenSet(input: string) {
  return new Set(tokenize(input));
}

function getIngredientTokens(ingredient: string) {
  return unique(tokenize(ingredient));
}

export function matchRecipesByPantry(recipes: Recipe[], pantryInput: string): PantryMatchResult[] {
  const pantryTokens = buildPantryTokenSet(pantryInput);

  if (pantryTokens.size === 0) {
    return [];
  }

  return recipes
    .map<PantryMatchResult | null>((recipe) => {
      const matchedIngredients = recipe.ingredients.filter((ingredient) =>
        getIngredientTokens(ingredient).some((token) => pantryTokens.has(token))
      );
      const missingIngredients = recipe.ingredients.filter((ingredient) => !matchedIngredients.includes(ingredient));

      if (matchedIngredients.length === 0) {
        return null;
      }

      const matchRatio = matchedIngredients.length / Math.max(recipe.ingredients.length, 1);
      const quickBoost = recipe.cookTime <= 20 ? 1.25 : 0;
      const pantryBoost = recipe.categories.includes('Pantry-friendly') ? 1.75 : 0;
      const score = matchRatio * 10 + quickBoost + pantryBoost;

      return {
        recipe,
        score,
        matchedIngredients,
        missingIngredients,
        reason:
          matchedIngredients.length >= 3
            ? `You already have ${matchedIngredients.length} core ingredients`
            : `Starts from ${matchedIngredients.join(', ').toLowerCase()}`,
      };
    })
    .filter((result): result is PantryMatchResult => Boolean(result))
    .sort((left, right) => right.score - left.score);
}

export function buildSmartCollections(recipes: Recipe[], savedIds: Set<string>, tasteProfile: TasteProfile): SmartCollection[] {
  const topCuisine = getTopKeys(tasteProfile.cuisines, 1)[0];
  const topCategory = getTopKeys(tasteProfile.categories, 1)[0];
  const topTag = getTopKeys(tasteProfile.tags, 1)[0];
  const source = recipes.filter((recipe) => savedIds.has(recipe.id));
  const activeRecipes = source.length > 0 ? source : recipes;

  const byTopCuisine = topCuisine ? activeRecipes.filter((recipe) => recipe.cuisine === topCuisine).map((recipe) => recipe.id) : [];
  const byTopCategory = topCategory ? activeRecipes.filter((recipe) => recipe.categories.includes(topCategory)).map((recipe) => recipe.id) : [];
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
    topCategory
      ? {
          id: 'taste-category',
          title: `${topCategory} Picks`,
          subtitle: 'Grouped from the category style you return to most.',
          recipeIds: byTopCategory.slice(0, 4),
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

function inferCookTime(cookTime: string, title: string): number {
  const parsed = parseCookTimeMinutes(cookTime);
  if (parsed !== null && parsed > 0) {
    return parsed;
  }

  const normalizedTitle = normalize(title);
  if (normalizedTitle.includes('toast')) return 10;
  if (normalizedTitle.includes('salad')) return 15;
  if (normalizedTitle.includes('pasta')) return 30;
  if (normalizedTitle.includes('taco')) return 20;
  return 25;
}

export function parseCookTimeMinutes(input: string): number | null {
  const normalizedInput = normalize(input);

  if (!normalizedInput) {
    return null;
  }

  const colonMatch = normalizedInput.match(/^(\d{1,2}):(\d{1,2})$/);
  if (colonMatch) {
    const hours = Number.parseInt(colonMatch[1], 10);
    const minutes = Number.parseInt(colonMatch[2], 10);
    return hours * 60 + minutes;
  }

  const hoursMatch = normalizedInput.match(/(\d+)\s*(?:h|hr|hrs|hour|hours)\b/);
  const minutesMatch = normalizedInput.match(/(\d+)\s*(?:m|min|mins|minute|minutes)\b/);

  if (hoursMatch || minutesMatch) {
    const hours = hoursMatch ? Number.parseInt(hoursMatch[1], 10) : 0;
    const minutes = minutesMatch ? Number.parseInt(minutesMatch[1], 10) : 0;
    const total = hours * 60 + minutes;
    return total > 0 ? total : null;
  }

  const parsed = Number.parseInt(normalizedInput, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export function parseServingsCount(input: string): number | null {
  const parsed = Number.parseInt(normalize(input), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function inferTags(title: string, description: string, cookTime: number) {
  const base = tokenize(`${title} ${description}`);
  const tags = [];

  if (cookTime <= 20) tags.push('Quick');
  if (
    base.includes('drink') ||
    base.includes('latte') ||
    base.includes('coffee') ||
    base.includes('matcha') ||
    base.includes('tea') ||
    base.includes('smoothie') ||
    base.includes('cooler') ||
    base.includes('shake')
  ) {
    tags.push('Drink');
  }
  if (base.includes('spicy')) tags.push('Spicy');
  if (base.includes('comfort') || base.includes('creamy')) tags.push('Comfort');
  if (base.includes('salad') || base.includes('citrus') || base.includes('fresh')) tags.push('Fresh');
  if (base.includes('breakfast') || base.includes('toast')) tags.push('Breakfast');
  if (base.includes('chicken') || base.includes('salmon') || base.includes('shrimp')) tags.push('Protein-packed');

  return unique(tags.length > 0 ? tags : ['Weeknight', cookTime <= 20 ? 'Quick' : 'Comfort']);
}

function inferCategories(title: string, cuisine: string, description: string, tags: string[], cookTime: number, ingredients: string[]) {
  const text = normalize(`${title} ${cuisine} ${description} ${tags.join(' ')}`);
  const categories = [];

  if (text.includes('filipino') || text.includes('sisig') || text.includes('adobo')) categories.push('Filipino favorites');
  if (cookTime <= 20 || text.includes('easy') || text.includes('quick')) categories.push('Easy recipes');
  if (text.includes('comfort') || text.includes('weeknight') || text.includes('home')) categories.push('Everyday food');
  if (text.includes('protein') || text.includes('chicken') || text.includes('beef') || text.includes('salmon')) categories.push('High protein');
  if (text.includes('truffle') || text.includes('shareable') || text.includes('flatbread')) categories.push('Restaurant-like');
  if (ingredients.length <= 6 || text.includes('pantry') || text.includes('sardines')) categories.push('Pantry-friendly');
  if (text.includes('breakfast') || text.includes('toast') || text.includes('egg')) categories.push('Breakfast');
  if (
    text.includes('drink') ||
    text.includes('latte') ||
    text.includes('coffee') ||
    text.includes('matcha') ||
    text.includes('tea') ||
    text.includes('smoothie') ||
    text.includes('cooler') ||
    text.includes('shake') ||
    text.includes('refresher')
  ) categories.push('Drinks');

  return unique(categories.length > 0 ? categories : ['Everyday food']);
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
  if (
    text.includes('drink') ||
    text.includes('latte') ||
    text.includes('coffee') ||
    text.includes('matcha') ||
    text.includes('tea') ||
    text.includes('smoothie') ||
    text.includes('cooler') ||
    text.includes('shake')
  ) return 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80';
  if (text.includes('salad')) return 'https://images.unsplash.com/photo-1546793665-c74683f339c1?auto=format&fit=crop&w=1200&q=80';
  if (text.includes('taco')) return 'https://images.unsplash.com/photo-1552332386-f8dd00dc2f85?auto=format&fit=crop&w=1200&q=80';
  if (text.includes('pasta')) return 'https://images.unsplash.com/photo-1516100882582-96c3a05fe590?auto=format&fit=crop&w=1200&q=80';
  if (text.includes('toast') || text.includes('breakfast')) return 'https://images.unsplash.com/photo-1484723091739-30a097e8f929?auto=format&fit=crop&w=1200&q=80';
  return 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80';
}

export function buildRecipeDraft({
  cookTime,
  cuisine,
  description,
  ingredients: customIngredients,
  servings,
  steps: customSteps,
  title,
}: AddRecipeIdea): Recipe {
  const finalTitle = title.trim() || 'Smart Kitchen Creation';
  const finalCuisine = inferCuisine(finalTitle, cuisine);
  const finalCookTime = inferCookTime(cookTime, finalTitle);
  const parsedServings = servings ? parseServingsCount(servings) : null;
  const finalDescription =
    description.trim() ||
    `A home-cooked ${finalCuisine.toLowerCase()} recipe built around ${finalTitle.toLowerCase()}.`;
  const ingredients =
    customIngredients && customIngredients.length > 0
      ? unique(customIngredients.map((ingredient) => ingredient.trim()).filter(Boolean))
      : inferIngredients(finalTitle, finalCuisine, finalDescription);
  const tags = inferTags(finalTitle, finalDescription, finalCookTime);
  const steps =
    customSteps && customSteps.length > 0
      ? customSteps.map((step) => step.trim()).filter(Boolean)
      : buildSteps(finalTitle, ingredients);

  return {
    id: `${normalize(finalTitle).replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    title: finalTitle,
    description: finalDescription,
    image: getSmartImage(finalTitle, finalCuisine),
    cuisine: finalCuisine,
    cookTime: finalCookTime,
    servings: parsedServings ?? (finalCookTime <= 15 ? 2 : 4),
    featured: false,
    saved: true,
    categories: inferCategories(finalTitle, finalCuisine, finalDescription, tags, finalCookTime, ingredients),
    tags,
    ingredients,
    steps,
    isUserCreated: true,
  };
}
