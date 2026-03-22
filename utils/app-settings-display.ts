import type { AppLanguage, MeasurementSystem } from '@/components/settings-provider';

type UiCopy = {
  appName: string;
  addRecipe: string;
  browseAll: string;
  explore: string;
  addYours: string;
  about: string;
  featured: string;
  featuredPick: string;
  savedRecipes: string;
  recipes: string;
  recipesReady: string;
  fastestDinner: string;
  cookbookBuilder: string;
  startAdding: string;
  preview: string;
  editorialBoard: string;
  searchNextBite: string;
  searchPlaceholder: string;
  savedForLater: string;
  ingredients: string;
  howToMakeIt: string;
  tags: string;
  minutes: string;
  servings: string;
  recipeNotFound: string;
  goBack: string;
  yourRecipe: string;
  saveRecipe: string;
};

const COPY: Record<AppLanguage, UiCopy> = {
  en: {
    appName: 'Savorly',
    addRecipe: 'Add recipe',
    browseAll: 'Browse all',
    explore: 'Explore',
    addYours: 'Add yours',
    about: 'About',
    featured: 'Featured',
    featuredPick: 'Featured pick',
    savedRecipes: 'Saved recipes',
    recipes: 'recipes',
    recipesReady: 'Recipes ready',
    fastestDinner: 'Fastest dinner',
    cookbookBuilder: 'Cookbook builder',
    startAdding: 'Start adding',
    preview: 'Preview',
    editorialBoard: 'A more editorial board',
    searchNextBite: 'Search your next bite',
    searchPlaceholder: 'Search by dish, ingredient, or cuisine',
    savedForLater: 'Recipes saved for later',
    ingredients: 'Ingredients',
    howToMakeIt: 'How to make it',
    tags: 'Tags',
    minutes: 'Minutes',
    servings: 'Servings',
    recipeNotFound: 'Recipe not found',
    goBack: 'Go back',
    yourRecipe: 'Your recipe',
    saveRecipe: 'Save recipe',
  },
  es: {
    appName: 'Savorly',
    addRecipe: 'Agregar receta',
    browseAll: 'Ver todo',
    explore: 'Explorar',
    addYours: 'Agrega la tuya',
    about: 'Acerca de',
    featured: 'Destacado',
    featuredPick: 'Eleccion destacada',
    savedRecipes: 'Recetas guardadas',
    recipes: 'recetas',
    recipesReady: 'Recetas listas',
    fastestDinner: 'Cena mas rapida',
    cookbookBuilder: 'Libro de recetas',
    startAdding: 'Comenzar',
    preview: 'Vista previa',
    editorialBoard: 'Un tablero mas editorial',
    searchNextBite: 'Busca tu proximo antojo',
    searchPlaceholder: 'Busca por plato, ingrediente o cocina',
    savedForLater: 'Recetas guardadas para despues',
    ingredients: 'Ingredientes',
    howToMakeIt: 'Como prepararlo',
    tags: 'Etiquetas',
    minutes: 'Minutos',
    servings: 'Porciones',
    recipeNotFound: 'Receta no encontrada',
    goBack: 'Volver',
    yourRecipe: 'Tu receta',
    saveRecipe: 'Guardar receta',
  },
  fr: {
    appName: 'Savorly',
    addRecipe: 'Ajouter une recette',
    browseAll: 'Tout voir',
    explore: 'Explorer',
    addYours: 'Ajouter la votre',
    about: 'A propos',
    featured: 'Vedette',
    featuredPick: 'Choix vedette',
    savedRecipes: 'Recettes enregistrees',
    recipes: 'recettes',
    recipesReady: 'Recettes pretes',
    fastestDinner: 'Diner le plus rapide',
    cookbookBuilder: 'Carnet de recettes',
    startAdding: 'Commencer',
    preview: 'Apercu',
    editorialBoard: 'Un tableau plus editorial',
    searchNextBite: 'Cherchez votre prochaine envie',
    searchPlaceholder: 'Chercher par plat, ingredient ou cuisine',
    savedForLater: 'Recettes gardees pour plus tard',
    ingredients: 'Ingredients',
    howToMakeIt: 'Preparation',
    tags: 'Tags',
    minutes: 'Minutes',
    servings: 'Portions',
    recipeNotFound: 'Recette introuvable',
    goBack: 'Retour',
    yourRecipe: 'Votre recette',
    saveRecipe: 'Enregistrer',
  },
  fil: {
    appName: 'Savorly',
    addRecipe: 'Magdagdag ng recipe',
    browseAll: 'Tingnan lahat',
    explore: 'Tuklasin',
    addYours: 'Idagdag ang iyo',
    about: 'Tungkol dito',
    featured: 'Tampok',
    featuredPick: 'Tampok na pili',
    savedRecipes: 'Naka-save na recipes',
    recipes: 'recipes',
    recipesReady: 'Handang recipes',
    fastestDinner: 'Pinakamabilis na dinner',
    cookbookBuilder: 'Cookbook builder',
    startAdding: 'Simulan',
    preview: 'Preview',
    editorialBoard: 'Mas editorial na board',
    searchNextBite: 'Hanapin ang susunod mong craving',
    searchPlaceholder: 'Maghanap ayon sa dish, ingredient, o cuisine',
    savedForLater: 'Mga recipe para balikan',
    ingredients: 'Mga sangkap',
    howToMakeIt: 'Paraan ng pagluto',
    tags: 'Tags',
    minutes: 'Minuto',
    servings: 'Servings',
    recipeNotFound: 'Walang nahanap na recipe',
    goBack: 'Bumalik',
    yourRecipe: 'Iyong recipe',
    saveRecipe: 'I-save ang recipe',
  },
  ko: {
    appName: 'Savorly',
    addRecipe: '레시피 추가',
    browseAll: '모두 보기',
    explore: '탐색',
    addYours: '내 레시피 추가',
    about: '앱 정보',
    featured: '추천',
    featuredPick: '오늘의 추천',
    savedRecipes: '저장한 레시피',
    recipes: '레시피',
    recipesReady: '준비된 레시피',
    fastestDinner: '가장 빠른 저녁',
    cookbookBuilder: '나만의 레시피북',
    startAdding: '추가 시작',
    preview: '미리보기',
    editorialBoard: '큐레이션 보드',
    searchNextBite: '다음 요리 찾기',
    searchPlaceholder: '요리, 재료 또는 cuisine으로 검색',
    savedForLater: '나중을 위해 저장한 레시피',
    ingredients: '재료',
    howToMakeIt: '만드는 방법',
    tags: '태그',
    minutes: '분',
    servings: '인분',
    recipeNotFound: '레시피를 찾을 수 없어요',
    goBack: '뒤로 가기',
    yourRecipe: '내 레시피',
    saveRecipe: '레시피 저장',
  },
  ja: {
    appName: 'Savorly',
    addRecipe: 'レシピ追加',
    browseAll: 'すべて見る',
    explore: '探す',
    addYours: '自分のレシピを追加',
    about: 'アプリ情報',
    featured: '特集',
    featuredPick: 'おすすめ',
    savedRecipes: '保存したレシピ',
    recipes: 'レシピ',
    recipesReady: '準備できるレシピ',
    fastestDinner: '最短ディナー',
    cookbookBuilder: 'マイレシピ帳',
    startAdding: '追加を始める',
    preview: 'プレビュー',
    editorialBoard: 'キュレーションボード',
    searchNextBite: '次の一皿を探す',
    searchPlaceholder: '料理名、材料、料理ジャンルで検索',
    savedForLater: 'あとで作るために保存',
    ingredients: '材料',
    howToMakeIt: '作り方',
    tags: 'タグ',
    minutes: '分',
    servings: '人分',
    recipeNotFound: 'レシピが見つかりません',
    goBack: '戻る',
    yourRecipe: 'あなたのレシピ',
    saveRecipe: 'レシピを保存',
  },
};

export function getUiCopy(language: AppLanguage) {
  return COPY[language] ?? COPY.en;
}

export function formatCookTime(cookTime: number, language: AppLanguage) {
  const hours = Math.floor(cookTime / 60);
  const minutes = cookTime % 60;

  if (hours === 0) {
    if (language === 'ko' || language === 'ja') {
      return `${minutes}${COPY[language].minutes}`;
    }

    return `${minutes} min`;
  }

  if (language === 'ko') {
    return minutes > 0 ? `${hours}시간 ${minutes}분` : `${hours}시간`;
  }

  if (language === 'ja') {
    return minutes > 0 ? `${hours}時間 ${minutes}分` : `${hours}時間`;
  }

  if (language === 'fil') {
    return minutes > 0 ? `${hours} oras ${minutes} min` : `${hours} oras`;
  }

  if (language === 'fr') {
    return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  }

  if (language === 'es') {
    return minutes > 0 ? `${hours} h ${minutes} min` : `${hours} h`;
  }

  return minutes > 0 ? `${hours} hr ${minutes} min` : `${hours} hr`;
}

function roundTo(value: number, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? `${value}` : `${roundTo(value, 1)}`;
}

function appendConvertedTemperature(text: string, measurementSystem: MeasurementSystem) {
  return text.replace(/(\d{2,3})\s*°?\s*([CF])\b/gi, (_, rawValue: string, rawUnit: string) => {
    const value = Number(rawValue);
    const unit = rawUnit.toUpperCase();

    if (measurementSystem === 'imperial' && unit === 'C') {
      const converted = Math.round((value * 9) / 5 + 32);
      return `${value}°C (${converted}°F)`;
    }

    if (measurementSystem === 'metric' && unit === 'F') {
      const converted = Math.round(((value - 32) * 5) / 9);
      return `${value}°F (${converted}°C)`;
    }

    return `${value}°${unit}`;
  });
}

function appendConvertedAmount(text: string, measurementSystem: MeasurementSystem) {
  const conversions: Array<{
    pattern: RegExp;
    convert: (value: number) => string;
  }> = measurementSystem === 'imperial'
    ? [
        {
          pattern: /\b(\d+(?:\.\d+)?)\s?(g|gram|grams)\b/i,
          convert: (value) => `${formatNumber(value / 28.3495)} oz`,
        },
        {
          pattern: /\b(\d+(?:\.\d+)?)\s?(kg|kilogram|kilograms)\b/i,
          convert: (value) => `${formatNumber(value * 2.20462)} lb`,
        },
        {
          pattern: /\b(\d+(?:\.\d+)?)\s?(ml|milliliter|milliliters)\b/i,
          convert: (value) => `${formatNumber(value / 240)} cup`,
        },
        {
          pattern: /\b(\d+(?:\.\d+)?)\s?(l|liter|liters)\b/i,
          convert: (value) => `${formatNumber((value * 1000) / 240)} cup`,
        },
        {
          pattern: /\b(\d+(?:\.\d+)?)\s?(c|cup|cups)\b/i,
          convert: (value) => `${formatNumber(value * 8)} oz`,
        },
      ]
    : [
        {
          pattern: /\b(\d+(?:\.\d+)?)\s?(oz|ounce|ounces)\b/i,
          convert: (value) => `${formatNumber(value * 28.3495)} g`,
        },
        {
          pattern: /\b(\d+(?:\.\d+)?)\s?(lb|lbs|pound|pounds)\b/i,
          convert: (value) => `${formatNumber(value * 0.453592)} kg`,
        },
        {
          pattern: /\b(\d+(?:\.\d+)?)\s?(cup|cups)\b/i,
          convert: (value) => `${formatNumber(value * 240)} ml`,
        },
        {
          pattern: /\b(\d+(?:\.\d+)?)\s?(tbsp|tablespoon|tablespoons)\b/i,
          convert: (value) => `${formatNumber(value * 15)} ml`,
        },
        {
          pattern: /\b(\d+(?:\.\d+)?)\s?(tsp|teaspoon|teaspoons)\b/i,
          convert: (value) => `${formatNumber(value * 5)} ml`,
        },
      ];

  for (const conversion of conversions) {
    const match = text.match(conversion.pattern);

    if (!match) {
      continue;
    }

    const converted = conversion.convert(Number(match[1]));
    return `${text} (${converted})`;
  }

  return text;
}

export function formatIngredientForDisplay(ingredient: string, measurementSystem: MeasurementSystem) {
  return appendConvertedAmount(ingredient, measurementSystem);
}

export function formatInstructionForDisplay(step: string, measurementSystem: MeasurementSystem) {
  return appendConvertedTemperature(step, measurementSystem);
}
