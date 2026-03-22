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
  recentlySavedRecipeIds: string[];
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
  image?: string;
  ingredients?: string[];
  steps?: string[];
};

const STOP_WORDS = new Set(['the', 'and', 'with', 'for', 'your', 'into', 'from', 'that', 'this', 'are']);
const K1 = 1.4;
const B = 0.75;
const GENERIC_CATEGORY_DAMPING: Record<string, number> = {
  'Everyday food': 0.72,
  'Easy recipes': 0.78,
  'Pantry-friendly': 0.82,
  Breakfast: 0.86,
  Drinks: 0.88,
};
const GENERIC_TAG_DAMPING: Record<string, number> = {
  Quick: 0.76,
  Comfort: 0.84,
  Fresh: 0.84,
  Breakfast: 0.88,
  Drink: 0.88,
  'Protein-packed': 0.82,
};

type CatalogSignals = {
  totalRecipes: number;
  cuisineFrequency: Record<string, number>;
  categoryFrequency: Record<string, number>;
  tagFrequency: Record<string, number>;
};

function normalize(text: string) {
  return text.trim().toLowerCase();
}

function hasCleanIngredientMeasurement(value: string) {
  return /(\d|\u00BD|\u00BC|\u00BE|\u2153|\u2155|\bhalf\b|\bquarter\b|\bcup\b|\bcups\b|\btsp\b|\bteaspoon\b|\bteaspoons\b|\btbsp\b|\btablespoon\b|\btablespoons\b|\bgram\b|\bgrams\b|\bg\b|\bkg\b|\bml\b|\bl\b|\bliter\b|\blitre\b|\boz\b|\bounces?\b|\bpound\b|\blb\b|\bclove\b|\bcloves\b|\bcan\b|\bcans\b|\bpacket\b|\bpackets\b|\bslice\b|\bslices\b|\bpiece\b|\bpieces\b|\bpinch\b|\bdash\b|\bhandful\b|\bto taste\b|\bfor serving\b|\bfor garnish\b|\bfor frying\b|\bas needed\b)/i.test(
    value.trim()
  );
}

const MEASURED_INGREDIENT_PATTERN =
  /(\d|½|¼|¾|⅓|⅔|\bhalf\b|\bquarter\b|\bcup\b|\bcups\b|\btsp\b|\bteaspoon\b|\bteaspoons\b|\btbsp\b|\btablespoon\b|\btablespoons\b|\bgram\b|\bgrams\b|\bg\b|\bkg\b|\bml\b|\bl\b|\bliter\b|\blitre\b|\boz\b|\bounces?\b|\bpound\b|\blb\b|\bclove\b|\bcloves\b|\bcan\b|\bcans\b|\bpacket\b|\bpackets\b|\bslice\b|\bslices\b|\bpiece\b|\bpieces\b|\bpinch\b|\bdash\b|\bhandful\b|\bto taste\b|\bfor serving\b|\bfor garnish\b|\bfor frying\b|\bas needed\b)/i;
const DETAILED_STEP_VERB_PATTERN =
  /\b(add|bake|beat|blend|boil|brown|cook|drain|fold|fry|grill|heat|marinate|mix|pour|rest|roast|saute|season|serve|simmer|slice|stir|toast|whisk)\b/i;
const DETAILED_STEP_CONTEXT_PATTERN =
  /\b(until|for|minutes?|minute|seconds?|second|golden|soft|smooth|combined|fragrant|through|warm|cool|chilled|covered|tender|crisp)\b/i;
const INGREDIENT_TOKEN_EXCLUSIONS = new Set([
  'about',
  'and',
  'black',
  'boneless',
  'breast',
  'clove',
  'cloves',
  'cooked',
  'cup',
  'cups',
  'diced',
  'divided',
  'drained',
  'fresh',
  'gram',
  'grams',
  'g',
  'kg',
  'handful',
  'large',
  'medium',
  'minced',
  'oil',
  'optional',
  'ounce',
  'ounces',
  'oz',
  'peeled',
  'pepper',
  'piece',
  'pieces',
  'plus',
  'pound',
  'pounds',
  'salt',
  'serving',
  'small',
  'sliced',
  'taste',
  'teaspoon',
  'teaspoons',
  'tablespoon',
  'tablespoons',
  'tbsp',
  'tsp',
  'water',
  'white',
]);

export function isLikelyRemoteImageUrl(value: string) {
  const trimmed = value.trim();
  return /^https?:\/\/.+/i.test(trimmed);
}

export function hasIngredientMeasurement(value: string) {
  return MEASURED_INGREDIENT_PATTERN.test(value.trim()) || hasCleanIngredientMeasurement(value);
}

export function hasDetailedInstructionStep(value: string) {
  const trimmed = value.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);

  return (
    words.length >= 6 &&
    DETAILED_STEP_VERB_PATTERN.test(trimmed) &&
    (DETAILED_STEP_CONTEXT_PATTERN.test(trimmed) || words.length >= 10 || /,/.test(trimmed))
  );
}

function normalizeRecipeLines(values: string[] | undefined) {
  return (values ?? []).map((value) => value.trim()).filter(Boolean);
}

function getMeaningfulIngredientTokens(ingredient: string) {
  return unique(
    tokenize(
      ingredient.replace(/\b(to taste|for serving|for garnish|for frying|as needed)\b/gi, '')
    ).filter((token) => token.length > 2 && !INGREDIENT_TOKEN_EXCLUSIONS.has(token))
  );
}

function hasSufficientIngredientCoverage(ingredients: string[], steps: string[]) {
  const combinedSteps = normalize(steps.join(' '));
  const ingredientTokenGroups = ingredients
    .map((ingredient) => getMeaningfulIngredientTokens(ingredient))
    .filter((tokens) => tokens.length > 0);

  if (ingredientTokenGroups.length === 0) {
    return false;
  }

  const matchedGroups = ingredientTokenGroups.filter((tokens) => tokens.some((token) => combinedSteps.includes(token)));
  const requiredMatches = Math.max(2, Math.ceil(ingredientTokenGroups.length * 0.6));

  return matchedGroups.length >= Math.min(requiredMatches, ingredientTokenGroups.length);
}

export function getRecipeReliabilityError(input: AddRecipeIdea) {
  const normalizedTitle = input.title.trim();
  const parsedCookTime = parseCookTimeMinutes(input.cookTime);
  const parsedServings = parseServingsCount(input.servings ?? '');
  const ingredients = normalizeRecipeLines(input.ingredients);
  const steps = normalizeRecipeLines(input.steps);

  if (!normalizedTitle) {
    return 'Reliable recipes need a clear title.';
  }

  if (!parsedCookTime) {
    return 'Reliable recipes need a valid cook time.';
  }

  if (!parsedServings) {
    return 'Reliable recipes need a valid servings count.';
  }

  if (ingredients.length === 0) {
    return 'Reliable recipes need a complete ingredient list.';
  }

  if (ingredients.some((ingredient) => !hasIngredientMeasurement(ingredient))) {
    return 'Each ingredient needs an actual amount or preparation note before it can be saved as reliable.';
  }

  if (steps.length < 3) {
    return 'Reliable recipes need at least three cooking steps.';
  }

  if (steps.some((step) => !hasDetailedInstructionStep(step))) {
    return 'Each cooking step needs enough action, timing, or texture detail to be dependable.';
  }

  if (!hasSufficientIngredientCoverage(ingredients, steps)) {
    return 'Your method should mention the key ingredients so the instructions match the ingredient list.';
  }

  return null;
}

export function isRecipeReliable(recipe: Recipe) {
  return (
    getRecipeReliabilityError({
      title: recipe.title,
      cuisine: recipe.cuisine,
      cookTime: `${recipe.cookTime}`,
      servings: `${recipe.servings}`,
      description: recipe.description,
      image: recipe.image,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
    }) === null
  );
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

function containsAny(text: string, needles: string[]) {
  return needles.some((needle) => text.includes(needle));
}

function isLikelyDrinkText(text: string) {
  if (containsAny(text, ['drink', 'latte', 'smoothie', 'cooler', 'refresher', 'shake', 'sparkler', 'juice', 'milk tea'])) {
    return true;
  }

  return (
    containsAny(text, ['matcha', 'coffee', 'tea']) &&
    containsAny(text, ['milk', 'iced', 'latte', 'drink', 'cooler', 'shake', 'smoothie', 'refresher'])
  );
}

function incrementWeight(map: Record<string, number>, key: string, amount: number) {
  map[key] = (map[key] ?? 0) + amount;
}

function buildFrequencyMap(items: string[]) {
  return items.reduce<Record<string, number>>((map, item) => {
    map[item] = (map[item] ?? 0) + 1;
    return map;
  }, {});
}

function getCatalogSignals(recipes: Recipe[]): CatalogSignals {
  return {
    totalRecipes: Math.max(recipes.length, 1),
    cuisineFrequency: buildFrequencyMap(recipes.map((recipe) => recipe.cuisine)),
    categoryFrequency: buildFrequencyMap(recipes.flatMap((recipe) => recipe.categories)),
    tagFrequency: buildFrequencyMap(recipes.flatMap((recipe) => recipe.tags)),
  };
}

function getSpecificityBoost(frequencyMap: Record<string, number>, key: string, totalRecipes: number) {
  const frequency = frequencyMap[key] ?? 1;
  return Math.log(1 + totalRecipes / frequency);
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

function getTasteBoost(recipe: Recipe, tasteProfile: TasteProfile, catalogSignals: CatalogSignals) {
  const cuisineBoost =
    (tasteProfile.cuisines[recipe.cuisine] ?? 0) *
    getSpecificityBoost(catalogSignals.cuisineFrequency, recipe.cuisine, catalogSignals.totalRecipes);
  const categoryBoost = recipe.categories.reduce((total, category) => {
    const baseScore = tasteProfile.categories[category] ?? 0;
    const specificityBoost = getSpecificityBoost(
      catalogSignals.categoryFrequency,
      category,
      catalogSignals.totalRecipes
    );
    const damping = GENERIC_CATEGORY_DAMPING[category] ?? 1;
    return total + baseScore * specificityBoost * damping;
  }, 0);
  const tagBoost = recipe.tags.reduce((total, tag) => {
    const baseScore = tasteProfile.tags[tag] ?? 0;
    const specificityBoost = getSpecificityBoost(catalogSignals.tagFrequency, tag, catalogSignals.totalRecipes);
    const damping = GENERIC_TAG_DAMPING[tag] ?? 1;
    return total + baseScore * specificityBoost * damping;
  }, 0);
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

function getExplorationBoost(recipe: Recipe, tasteProfile: TasteProfile, catalogSignals: CatalogSignals) {
  const categoryBoost = recipe.categories.reduce((total, category) => {
    if ((tasteProfile.categories[category] ?? 0) > 0) {
      return total;
    }

    return (
      total +
      Math.min(1.8, getSpecificityBoost(catalogSignals.categoryFrequency, category, catalogSignals.totalRecipes) * 0.75)
    );
  }, 0);
  const tagBoost = recipe.tags.reduce((total, tag) => {
    if ((tasteProfile.tags[tag] ?? 0) > 0) {
      return total;
    }

    return total + Math.min(0.8, getSpecificityBoost(catalogSignals.tagFrequency, tag, catalogSignals.totalRecipes) * 0.35);
  }, 0);
  const cuisineBoost =
    (tasteProfile.cuisines[recipe.cuisine] ?? 0) > 0
      ? 0
      : Math.min(1.2, getSpecificityBoost(catalogSignals.cuisineFrequency, recipe.cuisine, catalogSignals.totalRecipes) * 0.45);

  return cuisineBoost + categoryBoost * 0.35 + tagBoost * 0.25;
}

function diversifyRankedResults<T extends { recipe: Recipe; score: number }>(items: T[], limit = items.length) {
  const remaining = [...items];
  const selected: T[] = [];
  const categoryCounts: Record<string, number> = {};
  const cuisineCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};
  const targetLength = Math.min(limit, items.length);

  while (remaining.length > 0 && selected.length < targetLength) {
    let bestIndex = 0;
    let bestScore = -Infinity;

    remaining.forEach((item, index) => {
      const repeatedCategoryPenalty = item.recipe.categories.reduce(
        (total, category) => total + (categoryCounts[category] ?? 0) * 1.15,
        0
      );
      const repeatedTagPenalty = item.recipe.tags.reduce((total, tag) => total + (tagCounts[tag] ?? 0) * 0.45, 0);
      const repeatedCuisinePenalty = (cuisineCounts[item.recipe.cuisine] ?? 0) * 1.35;
      const adjustedScore = item.score - repeatedCategoryPenalty - repeatedTagPenalty - repeatedCuisinePenalty;

      if (adjustedScore > bestScore) {
        bestScore = adjustedScore;
        bestIndex = index;
      }
    });

    const [winner] = remaining.splice(bestIndex, 1);
    selected.push(winner);
    incrementWeight(cuisineCounts, winner.recipe.cuisine, 1);
    winner.recipe.categories.forEach((category) => incrementWeight(categoryCounts, category, 1));
    winner.recipe.tags.forEach((tag) => incrementWeight(tagCounts, tag, 1));
  }

  return selected;
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
  const catalogSignals = getCatalogSignals(recipes);

  const ranked = recipes
    .map((recipe) => {
      const tasteBoost = getTasteBoost(recipe, tasteProfile, catalogSignals);
      const explorationBoost = getExplorationBoost(recipe, tasteProfile, catalogSignals);
      const editorialBoost = recipe.featured ? 2.5 : 0;
      const savedPenalty = savedIds.has(recipe.id) ? 1.25 : 0;
      const timingBoost = getDayPartBoost(recipe, now);
      const rotationBoost = getDailyRotationBoost(recipe.id, now);
      const score = tasteBoost + explorationBoost + editorialBoost + timingBoost + rotationBoost - savedPenalty;

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
  const catalogSignals = getCatalogSignals(recipes);

  if (queryTokens.length === 0) {
    return diversifyRankedResults(
      recipes
      .map((recipe) => ({
        recipe,
        score:
          getTasteBoost(recipe, tasteProfile, catalogSignals) +
          getExplorationBoost(recipe, tasteProfile, catalogSignals) +
          (recipe.saved ? 5 : 0) +
          (recipe.featured ? 2 : 0),
        reason: recipe.saved
          ? 'Saved and reinforced by your taste profile'
          : recipe.featured
            ? 'Featured and aligned with your taste profile'
            : 'Recommended from your taste profile',
      }))
      .sort((left, right) => right.score - left.score)
    );
  }

  return diversifyRankedResults(
    recipes
    .map<SearchResult | null>((recipe) => {
      const bm25 = getBm25Score(recipe, recipes, queryTokens);
      const tasteBoost = getTasteBoost(recipe, tasteProfile, catalogSignals);
      const explorationBoost = getExplorationBoost(recipe, tasteProfile, catalogSignals) * 0.35;
      const titleMatch = queryTokens.some((token) => recipe.title.toLowerCase().includes(token));
      const ingredientMatch = queryTokens.some((token) =>
        recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(token))
      );
      const score = bm25 * 10 + tasteBoost + explorationBoost + (titleMatch ? 3 : 0) + (ingredientMatch ? 2 : 0);

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
    .sort((left, right) => right.score - left.score)
  );
}

export function buildSmartSuggestions(recipes: Recipe[], savedIds: Set<string>, tasteProfile: TasteProfile) {
  const catalogSignals = getCatalogSignals(recipes);

  return diversifyRankedResults(
    recipes
    .filter((recipe) => !savedIds.has(recipe.id))
    .map((recipe) => {
      const tasteBoost = getTasteBoost(recipe, tasteProfile, catalogSignals);
      const explorationBoost = getExplorationBoost(recipe, tasteProfile, catalogSignals);
      const editorialBoost = recipe.featured ? 1.5 : 0;
      const freshnessBoost = recipe.cookTime <= 25 ? 1 : 0;
      const score = tasteBoost + explorationBoost + editorialBoost + freshnessBoost;

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
    .sort((left, right) => right.score - left.score),
    4
  );
}

export function buildKitchenPulse(
  recipes: Recipe[],
  tasteProfile: TasteProfile,
  interactions: UserInteractions,
  mealPlans: Record<string, Partial<Record<'breakfast' | 'lunch' | 'dinner', string>>>,
  now = new Date()
): KitchenPulse {
  const scores: Record<string, number> = {};
  const savedRecipes = recipes.filter((recipe) => recipe.saved);
  const savedRecipeScores: Record<string, number> = {};
  const recentFavoriteScores: Record<string, number> = {};
  const recentFavoriteIds = interactions.recentlySavedRecipeIds.slice(-5);
  const recentFavoriteRecipes = recentFavoriteIds
    .map((recipeId) => recipes.find((recipe) => recipe.id === recipeId))
    .filter((recipe): recipe is Recipe => Boolean(recipe?.saved));
  const categoryFrequency = recipes.reduce<Record<string, number>>((map, recipe) => {
    recipe.categories.forEach((category) => {
      map[category] = (map[category] ?? 0) + 1;
    });

    return map;
  }, {});
  const totalRecipes = Math.max(recipes.length, 1);
  const applyCategoryWeight = (category: string, amount: number) => {
    const frequency = categoryFrequency[category] ?? 1;
    const specificityBoost = Math.log(1 + totalRecipes / frequency);
    incrementWeight(scores, category, amount * specificityBoost);
  };
  const applyRecentFavoriteWeight = (category: string, amount: number) => {
    const frequency = categoryFrequency[category] ?? 1;
    const specificityBoost = Math.log(1 + totalRecipes / frequency);
    incrementWeight(recentFavoriteScores, category, amount * specificityBoost);
    incrementWeight(scores, category, amount * specificityBoost);
  };
  const applySavedRecipeWeight = (category: string, amount: number) => {
    const frequency = categoryFrequency[category] ?? 1;
    const specificityBoost = Math.log(1 + totalRecipes / frequency);
    incrementWeight(savedRecipeScores, category, amount * specificityBoost);
    incrementWeight(scores, category, amount * specificityBoost);
  };

  Object.entries(tasteProfile.categories).forEach(([category, score]) => {
    applyCategoryWeight(category, score);
  });

  recentFavoriteRecipes.forEach((recipe, index, array) => {
    const recencyWeight = array.length - index + 8;
    recipe.categories.forEach((category) => applyRecentFavoriteWeight(category, recencyWeight));
  });

  savedRecipes.forEach((recipe) => {
    recipe.categories.forEach((category) => applySavedRecipeWeight(category, 4));
  });

  Object.entries(interactions.viewsByRecipeId).forEach(([recipeId, viewCount]) => {
    const recipe = recipes.find((item) => item.id === recipeId);

    if (!recipe || viewCount <= 0) {
      return;
    }

    recipe.categories.forEach((category) => applyCategoryWeight(category, Math.min(viewCount, 6)));
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

      recipe.categories.forEach((category) => applyCategoryWeight(category, recencyWeight));
    });
  });

  const todayKey = getDateKey(now);
  const tomorrowKey = getDateKey(addDays(now, 1));
  const currentSlot = getCurrentMealSlot(now);
  const currentPlannedRecipeId = mealPlans[todayKey]?.[currentSlot];
  const currentPlannedRecipe = recipes.find((recipe) => recipe.id === currentPlannedRecipeId);

  if (currentPlannedRecipe) {
    currentPlannedRecipe.categories.forEach((category) => applyCategoryWeight(category, 12));
  }

  Object.values(mealPlans[todayKey] ?? {}).forEach((recipeId) => {
    const recipe = recipes.find((item) => item.id === recipeId);
    if (!recipe) return;
    recipe.categories.forEach((category) => applyCategoryWeight(category, 5));
  });

  Object.values(mealPlans[tomorrowKey] ?? {}).forEach((recipeId) => {
    const recipe = recipes.find((item) => item.id === recipeId);
    if (!recipe) return;
    recipe.categories.forEach((category) => applyCategoryWeight(category, 2));
  });

  const recentFavoriteWinner =
    Object.entries(recentFavoriteScores).sort((left, right) => right[1] - left[1])[0]?.[0];
  const savedRecipeWinner =
    Object.entries(savedRecipeScores).sort((left, right) => right[1] - left[1])[0]?.[0];
  const winner =
    (recentFavoriteRecipes.length >= 5 ? recentFavoriteWinner : undefined) ??
    (savedRecipes.length >= 5 ? savedRecipeWinner : undefined) ??
    Object.entries(scores).sort((left, right) => right[1] - left[1])[0]?.[0] ??
    'Still learning';

  let reason = 'Still learning from your recipe habits.';

  if (recentFavoriteRecipes.length >= 5 && recentFavoriteWinner === winner) {
    reason = `Your latest ${recentFavoriteRecipes.length} favorites are clustering around ${winner.toLowerCase()}.`;
  } else if (savedRecipes.length >= 5 && savedRecipeWinner === winner) {
    reason = `Your saved recipes are clustering around ${winner.toLowerCase()} right now.`;
  } else if (currentPlannedRecipe && currentPlannedRecipe.categories.includes(winner)) {
    reason = `Leaning into ${winner.toLowerCase()} because it matches your current planned ${currentSlot}.`;
  } else if (interactions.searches.length > 0) {
    reason = `Leaning into ${winner.toLowerCase()} from your recent searches, saves, and recipe views.`;
  } else if (savedRecipes.some((recipe) => recipe.categories.includes(winner))) {
    reason = `Leaning into ${winner.toLowerCase()} from the recipes you keep saving lately.`;
  } else if (
    Object.entries(interactions.viewsByRecipeId).some(([recipeId, viewCount]) => {
      const recipe = recipes.find((item) => item.id === recipeId);
      return Boolean(recipe && viewCount > 0 && recipe.categories.includes(winner));
    })
  ) {
    reason = `Leaning into ${winner.toLowerCase()} from the recipes you keep opening lately.`;
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
  const catalogSignals = getCatalogSignals(recipes);

  return diversifyRankedResults(
    recipes
    .map<MealPlannerResult | null>((recipe) => {
      if (filter === 'saved' && !recipe.saved) {
        return null;
      }

      const tasteBoost = getTasteBoost(recipe, tasteProfile, catalogSignals);
      const explorationBoost = getExplorationBoost(recipe, tasteProfile, catalogSignals) * (filter === 'smart' ? 0.45 : 0.15);
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

      const score = tasteBoost + explorationBoost + bm25 + slotBoost + filterBoost + (recipe.featured ? 1 : 0);

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
    .sort((left, right) => right.score - left.score)
  );
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
  const baseText = base.join(' ');

  if (isLikelyDrinkText(baseText)) {
    tags.push('Drink');
  }
  if (base.includes('spicy')) tags.push('Spicy');
  if (base.includes('comfort') || base.includes('creamy')) tags.push('Comfort');
  if (base.includes('salad') || base.includes('citrus') || base.includes('fresh')) tags.push('Fresh');
  if (
    containsAny(baseText, ['breakfast', 'toast', 'congee', 'lugaw', 'porridge', 'onigiri', 'omelet', 'omelette', 'silog', 'arroz caldo'])
  ) {
    tags.push('Breakfast');
  }
  if (containsAny(baseText, ['chicken', 'salmon', 'shrimp', 'tuna', 'egg'])) tags.push('Protein-packed');

  return unique(tags.length > 0 ? tags : ['Weeknight', cookTime <= 20 ? 'Quick' : 'Comfort']);
}

function inferCategories(title: string, cuisine: string, description: string, tags: string[], cookTime: number, ingredients: string[]) {
  const text = normalize(`${title} ${cuisine} ${description} ${tags.join(' ')}`);
  const categories = [];

  if (text.includes('filipino') || text.includes('sisig') || text.includes('adobo')) categories.push('Filipino favorites');
  if (
    cookTime <= 20 ||
    text.includes('easy') ||
    text.includes('quick') ||
    text.includes('fried rice') ||
    text.includes('omelet') ||
    text.includes('omelette') ||
    text.includes('onigiri')
  ) categories.push('Easy recipes');
  if (
    text.includes('comfort') ||
    text.includes('weeknight') ||
    text.includes('home') ||
    text.includes('noodles') ||
    text.includes('oyakodon') ||
    text.includes('congee') ||
    text.includes('caldo')
  ) categories.push('Everyday food');
  if (text.includes('protein') || text.includes('chicken') || text.includes('beef') || text.includes('salmon')) categories.push('High protein');
  if (text.includes('truffle') || text.includes('shareable') || text.includes('flatbread')) categories.push('Restaurant-like');
  if (ingredients.length <= 6 || text.includes('pantry') || text.includes('sardines') || text.includes('canned tuna') || text.includes('kimchi')) {
    categories.push('Pantry-friendly');
  }
  if (
    text.includes('breakfast') ||
    text.includes('toast') ||
    text.includes('egg') ||
    text.includes('congee') ||
    text.includes('lugaw') ||
    text.includes('porridge') ||
    text.includes('onigiri') ||
    text.includes('omelet') ||
    text.includes('omelette') ||
    text.includes('silog') ||
    text.includes('arroz caldo')
  ) categories.push('Breakfast');
  if (isLikelyDrinkText(text)) categories.push('Drinks');

  return unique(categories.length > 0 ? categories : ['Everyday food']);
}

function inferIngredients(title: string, cuisine: string, description: string) {
  const text = normalize(`${title} ${cuisine} ${description}`);
  const ingredients = ['1 tablespoon olive oil', '1/2 teaspoon salt, plus more to taste', '1/4 teaspoon black pepper'];

  if (text.includes('pasta')) ingredients.push('250g pasta', '3 cloves garlic, minced', '1/2 cup grated parmesan');
  if (text.includes('chicken')) ingredients.push('450g chicken thigh or breast, sliced');
  if (text.includes('salmon')) ingredients.push('2 salmon fillets (about 150g each)');
  if (text.includes('shrimp')) ingredients.push('400g shrimp, peeled and deveined');
  if (text.includes('taco')) ingredients.push('8 small tortillas', '1 lime, cut into wedges');
  if (text.includes('salad')) ingredients.push('4 cups mixed greens', '1 lemon');
  if (text.includes('rice') || text.includes('bowl')) ingredients.push('2 cups cooked rice');
  if (text.includes('spicy')) ingredients.push('1 teaspoon chili flakes');
  if (text.includes('creamy')) ingredients.push('3/4 cup cream');
  if (text.includes('toast')) ingredients.push('4 slices sourdough bread');

  return unique(ingredients).slice(0, 8);
}

function buildSteps(title: string, ingredients: string[], cookTime: number, cuisine: string, description: string) {
  const text = normalize(`${title} ${cuisine} ${description}`);
  const leadIngredients = ingredients.slice(0, 4).join(', ').toLowerCase();

  if (isLikelyDrinkText(text)) {
    return [
      `Measure the ingredients for ${title.toLowerCase()} and chill the serving glass so the drink stays cold longer.`,
      'Mix or shake the flavor base until the sugar and any powders are fully dissolved with no dry pockets left.',
      'Fill the glass with ice, pour in the drink base, then top with milk or sparkling ingredients if the recipe uses them.',
      'Taste once before serving and adjust sweetness, acidity, or dilution so the final drink feels balanced.',
    ];
  }

  if (text.includes('toast') || text.includes('breakfast')) {
    return [
      `Prepare all toppings for ${title.toLowerCase()} first so you can build the dish while the base is still warm.`,
      'Toast or cook the bread or breakfast base until the outside is golden and the center is still tender.',
      'Mix any spreads, sauces, or seasonings in a small bowl so they are smooth and ready to layer.',
      'Assemble the dish in order, adding the most delicate toppings last so they stay fresh and bright.',
      'Serve right away and finish with a final pinch of salt, pepper, or sweetness if needed.',
    ];
  }

  if (text.includes('pasta')) {
    return [
      `Bring a large pot of salted water to a boil and prep ${leadIngredients} while the water heats.`,
      'Cook the pasta until just al dente, then reserve a little pasta water before draining.',
      'Cook the aromatics, vegetables, or protein in a wide pan until browned and fragrant, usually 3 to 5 minutes.',
      'Add the sauce ingredients and simmer briefly until glossy, loosening with a splash of pasta water if needed.',
      'Toss the pasta through the sauce, taste for seasoning, and finish with cheese or herbs before serving.',
    ];
  }

  if (text.includes('taco')) {
    return [
      `Prep the fillings for ${title.toLowerCase()} first so the tacos can be assembled while everything is hot.`,
      'Season and cook the main protein or vegetables until browned and fully cooked through.',
      'Mix any salsa, slaw, or sauce in a separate bowl and taste for salt, acid, and heat.',
      'Warm the tortillas in a dry pan until flexible and lightly blistered so they do not crack when folded.',
      'Assemble the tacos, add the cold toppings last, and serve immediately with extra citrus on the side.',
    ];
  }

  if (text.includes('salad')) {
    return [
      `Wash, dry, and prep the salad ingredients for ${title.toLowerCase()} so the dressing clings properly later.`,
      'Cook the main protein, tofu, or grains first, then let them cool slightly so the greens do not wilt too fast.',
      'Whisk the dressing until fully combined and balanced between salt, acid, and richness.',
      'Combine the sturdier vegetables and base ingredients first, then add delicate greens or herbs last.',
      'Toss right before serving and finish with crunchy toppings so the salad stays fresh and textured.',
    ];
  }

  if (text.includes('rice') || text.includes('bowl')) {
    return [
      `Measure and prep ${leadIngredients} before cooking so the bowl comes together without rushing.`,
      'Cook the protein or main topping first until deeply browned and cooked through, then set it aside if needed.',
      'Cook the vegetables, aromatics, and sauce base in the same pan so the flavors build on each other.',
      'Warm the rice or grain base separately, then spoon it into bowls before adding the hot toppings.',
      'Finish with fresh garnish, a final seasoning check, and any crunchy toppings right before serving.',
    ];
  }

  return [
    `Gather and measure the ingredients for ${title.toLowerCase()}, especially ${leadIngredients}, before turning on the heat.`,
    `Cook the main ingredients in batches if needed so they brown properly instead of steaming during the ${cookTime}-minute cook.`,
    'Add the aromatics and sauce components once the base is nearly cooked, then stir until the flavors smell rich and combined.',
    'Lower the heat if anything starts catching, and cook just until the center is done and the sauce or seasoning coats evenly.',
    'Taste before serving and adjust salt, acid, heat, or texture so the finished dish feels balanced and complete.',
  ];
}

function getSmartImage(title: string, cuisine: string) {
  const text = normalize(`${title} ${cuisine}`);
  if (isLikelyDrinkText(text)) return 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=1200&q=80';
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
  image,
  ingredients: customIngredients,
  servings,
  steps: customSteps,
  title,
}: AddRecipeIdea): Recipe {
  const reliabilityError = getRecipeReliabilityError({
    title,
    cuisine,
    cookTime,
    servings,
    description,
    image,
    ingredients: customIngredients,
    steps: customSteps,
  });

  if (reliabilityError) {
    throw new Error(reliabilityError);
  }

  const normalizedIngredients = normalizeRecipeLines(customIngredients);
  const normalizedSteps = normalizeRecipeLines(customSteps);
  const finalTitle = title.trim();
  const finalCuisine = inferCuisine(finalTitle, cuisine);
  const finalCookTime = parseCookTimeMinutes(cookTime)!;
  const parsedServings = parseServingsCount(servings ?? '')!;
  const finalDescription =
    description.trim() ||
    `A home-cooked ${finalCuisine.toLowerCase()} recipe built around ${finalTitle.toLowerCase()}.`;
  const ingredients = normalizedIngredients;
  const tags = inferTags(finalTitle, finalDescription, finalCookTime);
  const steps = normalizedSteps;
  const customImage = image?.trim() ?? '';

  return {
    id: `${normalize(finalTitle).replace(/[^a-z0-9]+/g, '-')}-${Date.now()}`,
    title: finalTitle,
    description: finalDescription,
    image: isLikelyRemoteImageUrl(customImage) ? customImage : getSmartImage(finalTitle, finalCuisine),
    cuisine: finalCuisine,
    cookTime: finalCookTime,
    servings: parsedServings,
    featured: false,
    saved: true,
    categories: inferCategories(finalTitle, finalCuisine, finalDescription, tags, finalCookTime, ingredients),
    tags,
    ingredients,
    steps,
    isUserCreated: true,
  };
}

function isLegacyGeneratedSteps(steps: string[]) {
  const normalizedSteps = steps.map((step) => normalize(step));

  return (
    normalizedSteps.length === 4 &&
    normalizedSteps[0].startsWith('prep the main ingredients for ') &&
    normalizedSteps[1] === 'cook the main components until fragrant, caramelized, and properly seasoned.' &&
    normalizedSteps[2] === 'bring everything together with a quick finishing sauce or final seasoning pass.' &&
    normalizedSteps[3] === 'plate, taste, and finish with any bright or crunchy toppings before serving.'
  );
}

export function upgradeLegacyUserRecipe(recipe: Recipe): Recipe {
  return recipe;
}
