import type { AppLanguage } from '@/components/settings-provider';

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
};

export function getUiCopy(language: AppLanguage) {
  return COPY[language] ?? COPY.en;
}

export function formatCookTime(cookTime: number, _language: AppLanguage) {
  return `${cookTime} min`;
}
