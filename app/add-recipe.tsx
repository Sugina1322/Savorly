import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { useAuth } from '@/components/auth-provider';
import { BrandMark } from '@/components/brand-mark';
import { useRecipes } from '@/components/recipes-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import type { AppLanguage } from '@/components/settings-provider';
import { useSettings } from '@/components/settings-provider';
import { PROTECTED_AUTH_ROUTES, useProtectedRouteGuard } from '@/utils/auth-gate';
import {
  hasDetailedInstructionStep,
  hasIngredientMeasurement,
  isLikelyRemoteImageUrl,
  parseCookTimeMinutes,
  parseServingsCount,
} from '@/utils/recipe-intelligence';

type AddRecipeCopy = {
  back: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  titleLabel: string;
  titlePlaceholder: string;
  cuisineLabel: string;
  cuisineHint: string;
  cookTimeLabel: string;
  cookTimeHint: string;
  servingsLabel: string;
  servingsHint: string;
  descriptionLabel: string;
  descriptionHint: string;
  descriptionPlaceholder: string;
  imageLabel: string;
  imageHint: string;
  imagePlaceholder: string;
  imagePreview: string;
  invalidImagePreview: string;
  ingredientsLabel: string;
  ingredientsHint: string;
  ingredientsPlaceholder: string;
  stepsLabel: string;
  stepsHint: string;
  stepsPlaceholder: string;
  save: string;
  saving: string;
  helper: string;
  autosaveDraft: string;
  autosaving: string;
  autosaved: string;
  restoredDraft: string;
  clearedDraft: string;
  titleError: string;
  cookTimeError: string;
  servingsError: string;
  ingredientsError: string;
  measuredIngredientsError: string;
  stepsError: string;
  minimumStepsError: string;
  detailedStepsError: string;
  invalidImageError: string;
};

const ADD_RECIPE_COPY: Record<AppLanguage, AddRecipeCopy> = {
  en: {
    back: 'Back',
    eyebrow: 'Your recipe',
    title: 'Add something worth saving.',
    subtitle: 'Use exact measurements, clear steps, and an image so this recipe stays useful later.',
    titleLabel: 'Recipe title',
    titlePlaceholder: 'Creamy garlic shrimp pasta',
    cuisineLabel: 'Cuisine',
    cuisineHint: 'Optional, but helpful for search and browsing.',
    cookTimeLabel: 'Cook time',
    cookTimeHint: 'Required. Use minutes or a format like `1 hr 15 min`.',
    servingsLabel: 'Servings',
    servingsHint: 'Required. How many people this recipe feeds.',
    descriptionLabel: 'Description',
    descriptionHint: 'Optional. Add a short summary if the title needs more context.',
    descriptionPlaceholder: 'Tell people why this recipe deserves a spot in their kitchen.',
    imageLabel: 'Recipe image URL',
    imageHint: 'Optional. Paste an image link if you want your own cover photo.',
    imagePlaceholder: 'https://images.unsplash.com/...',
    imagePreview: 'Image preview',
    invalidImagePreview: 'Paste a full image URL to preview your custom cover.',
    ingredientsLabel: 'Ingredients with measurements',
    ingredientsHint: 'Required. Add one measured ingredient per line, like `250g pasta` or `Salt, to taste`.',
    ingredientsPlaceholder: '250g spaghetti\n300g shrimp, peeled and deveined\n3 cloves garlic, minced',
    stepsLabel: 'Detailed cooking steps',
    stepsHint: 'Required. Add one complete step per line with cues, timing, or texture so nobody has to guess.',
    stepsPlaceholder:
      'Boil the pasta until just al dente, then reserve 1/2 cup pasta water.\nSaute the shrimp in oil for 2 to 3 minutes per side until pink.\nAdd garlic and cream, simmer briefly, then toss with pasta and parmesan.',
    save: 'Save recipe',
    saving: 'Saving recipe...',
    helper: 'Savorly now keeps your exact image, ingredients, servings, and detailed steps instead of turning them into a vague draft.',
    autosaveDraft: 'Draft autosave is on for this recipe.',
    autosaving: 'Saving draft...',
    autosaved: 'Draft saved',
    restoredDraft: 'Draft restored',
    clearedDraft: 'Draft cleared after save',
    titleError: 'Give your recipe a title.',
    cookTimeError: 'Add an accurate cook time, like `30` or `1 hr 15 min`.',
    servingsError: 'Add how many servings this recipe makes.',
    ingredientsError: 'List at least one ingredient so the recipe stays accurate.',
    measuredIngredientsError: 'Each ingredient should include a measurement or note like `2 cups rice`, `1 clove garlic`, or `salt to taste`.',
    stepsError: 'Add at least one cooking step so the recipe is usable later.',
    minimumStepsError: 'Add at least three steps so the method feels complete from start to finish.',
    detailedStepsError: 'Make each step more specific with action, timing, or texture cues so the cook does not have to guess.',
    invalidImageError: 'Use a valid image URL starting with `http://` or `https://`, or leave the field blank.',
  },
  es: {
    back: 'Volver',
    eyebrow: 'Tu receta',
    title: 'Agrega algo que valga la pena guardar.',
    subtitle: 'Usa medidas exactas, pasos claros e imagen para que la receta siga siendo util despues.',
    titleLabel: 'Titulo de la receta',
    titlePlaceholder: 'Pasta cremosa de ajo con camarones',
    cuisineLabel: 'Cocina',
    cuisineHint: 'Opcional, pero util para buscar y explorar.',
    cookTimeLabel: 'Tiempo de coccion',
    cookTimeHint: 'Obligatorio. Usa minutos o un formato como `1 hr 15 min`.',
    servingsLabel: 'Porciones',
    servingsHint: 'Obligatorio. Cuantas personas alimenta esta receta.',
    descriptionLabel: 'Descripcion',
    descriptionHint: 'Opcional. Agrega un resumen corto si el titulo necesita mas contexto.',
    descriptionPlaceholder: 'Cuenta por que esta receta merece un lugar en la cocina.',
    imageLabel: 'URL de imagen',
    imageHint: 'Opcional. Pega un enlace si quieres tu propia foto de portada.',
    imagePlaceholder: 'https://images.unsplash.com/...',
    imagePreview: 'Vista previa de imagen',
    invalidImagePreview: 'Pega una URL completa para ver tu portada personalizada.',
    ingredientsLabel: 'Ingredientes con medidas',
    ingredientsHint: 'Obligatorio. Agrega un ingrediente medido por linea.',
    ingredientsPlaceholder: '250g espagueti\n300g camarones limpios\n3 dientes de ajo picados',
    stepsLabel: 'Pasos detallados',
    stepsHint: 'Obligatorio. Agrega un paso completo por linea con tiempo o textura.',
    stepsPlaceholder:
      'Hierve la pasta hasta que quede al dente y reserva 1/2 taza del agua.\nSaltea los camarones 2 a 3 minutos por lado hasta que se pongan rosados.\nAgrega ajo y crema, cocina un poco y mezcla con la pasta y el queso.',
    save: 'Guardar receta',
    saving: 'Guardando receta...',
    helper: 'Savorly ahora guarda tu imagen, ingredientes, porciones y pasos exactos en lugar de un borrador vago.',
    autosaveDraft: 'El autoguardado del borrador esta activado.',
    autosaving: 'Guardando borrador...',
    autosaved: 'Borrador guardado',
    restoredDraft: 'Borrador recuperado',
    clearedDraft: 'Borrador eliminado despues de guardar',
    titleError: 'Ponle un titulo a tu receta.',
    cookTimeError: 'Agrega un tiempo de coccion correcto, como `30` o `1 hr 15 min`.',
    servingsError: 'Agrega cuantas porciones rinde la receta.',
    ingredientsError: 'Agrega al menos un ingrediente para mantener la receta precisa.',
    measuredIngredientsError: 'Cada ingrediente debe incluir una medida o nota como `2 tazas de arroz` o `sal al gusto`.',
    stepsError: 'Agrega al menos un paso de coccion.',
    minimumStepsError: 'Agrega al menos tres pasos para que el metodo quede completo.',
    detailedStepsError: 'Haz cada paso mas especifico con accion, tiempo o textura.',
    invalidImageError: 'Usa una URL valida que empiece con `http://` o `https://`, o deja el campo vacio.',
  },
  fr: {
    back: 'Retour',
    eyebrow: 'Votre recette',
    title: 'Ajoutez une recette qui vaut la peine d etre gardee.',
    subtitle: 'Utilisez des mesures precises, des etapes claires et une image pour garder la recette utile.',
    titleLabel: 'Titre de la recette',
    titlePlaceholder: 'Pates cremoses a l ail et aux crevettes',
    cuisineLabel: 'Cuisine',
    cuisineHint: 'Optionnel, mais utile pour la recherche et la navigation.',
    cookTimeLabel: 'Temps de cuisson',
    cookTimeHint: 'Obligatoire. Utilisez les minutes ou `1 hr 15 min`.',
    servingsLabel: 'Portions',
    servingsHint: 'Obligatoire. Nombre de personnes servies.',
    descriptionLabel: 'Description',
    descriptionHint: 'Optionnel. Ajoutez un court resume si le titre ne suffit pas.',
    descriptionPlaceholder: 'Expliquez pourquoi cette recette merite une place dans la cuisine.',
    imageLabel: 'URL de l image',
    imageHint: 'Optionnel. Collez un lien si vous voulez votre propre photo.',
    imagePlaceholder: 'https://images.unsplash.com/...',
    imagePreview: 'Apercu de l image',
    invalidImagePreview: 'Collez une URL complete pour voir votre couverture personnalisee.',
    ingredientsLabel: 'Ingredients avec mesures',
    ingredientsHint: 'Obligatoire. Un ingredient mesure par ligne.',
    ingredientsPlaceholder: '250g de spaghetti\n300g de crevettes decortiquees\n3 gousses d ail hachees',
    stepsLabel: 'Etapes detaillees',
    stepsHint: 'Obligatoire. Une etape complete par ligne avec temps ou texture.',
    stepsPlaceholder:
      'Faites cuire les pates jusqu a ce qu elles soient al dente et gardez 1/2 tasse d eau de cuisson.\nFaites sauter les crevettes 2 a 3 minutes par face jusqu a ce qu elles deviennent roses.\nAjoutez l ail et la creme, laissez mijoter un peu puis melangez avec les pates et le fromage.',
    save: 'Enregistrer',
    saving: 'Enregistrement...',
    helper: 'Savorly conserve maintenant votre image, vos ingredients, vos portions et vos etapes exactes.',
    autosaveDraft: 'La sauvegarde auto du brouillon est activee.',
    autosaving: 'Sauvegarde du brouillon...',
    autosaved: 'Brouillon enregistre',
    restoredDraft: 'Brouillon restaure',
    clearedDraft: 'Brouillon efface apres enregistrement',
    titleError: 'Donnez un titre a votre recette.',
    cookTimeError: 'Ajoutez un temps de cuisson correct, comme `30` ou `1 hr 15 min`.',
    servingsError: 'Ajoutez le nombre de portions.',
    ingredientsError: 'Ajoutez au moins un ingredient.',
    measuredIngredientsError: 'Chaque ingredient doit contenir une mesure ou une note comme `sel, selon le gout`.',
    stepsError: 'Ajoutez au moins une etape.',
    minimumStepsError: 'Ajoutez au moins trois etapes pour un resultat complet.',
    detailedStepsError: 'Rendez chaque etape plus precise avec action, temps ou texture.',
    invalidImageError: 'Utilisez une URL valide commencant par `http://` ou `https://`, ou laissez vide.',
  },
  fil: {
    back: 'Bumalik',
    eyebrow: 'Iyong recipe',
    title: 'Magdagdag ng recipe na talagang sulit i-save.',
    subtitle: 'Gumamit ng eksaktong sukat, malinaw na hakbang, at image para kapaki-pakinabang pa rin ito later.',
    titleLabel: 'Pangalan ng recipe',
    titlePlaceholder: 'Creamy garlic shrimp pasta',
    cuisineLabel: 'Cuisine',
    cuisineHint: 'Opsyonal pero helpful sa search at browse.',
    cookTimeLabel: 'Oras ng pagluto',
    cookTimeHint: 'Required. Gumamit ng minutes o format na `1 hr 15 min`.',
    servingsLabel: 'Servings',
    servingsHint: 'Required. Ilang tao ang mapapakain ng recipe na ito.',
    descriptionLabel: 'Description',
    descriptionHint: 'Opsyonal. Magdagdag ng maikling paliwanag kung kulang ang title.',
    descriptionPlaceholder: 'Sabihin kung bakit sulit lutuin ulit ang recipe na ito.',
    imageLabel: 'Recipe image URL',
    imageHint: 'Opsyonal. I-paste ang image link kung gusto mo ng sariling cover photo.',
    imagePlaceholder: 'https://images.unsplash.com/...',
    imagePreview: 'Image preview',
    invalidImagePreview: 'Mag-paste ng buong image URL para makita ang custom cover.',
    ingredientsLabel: 'Mga sangkap na may sukat',
    ingredientsHint: 'Required. Isang sangkap bawat line, dapat may sukat o note.',
    ingredientsPlaceholder: '250g spaghetti\n300g hipon, binalatan\n3 cloves garlic, minced',
    stepsLabel: 'Detalyadong cooking steps',
    stepsHint: 'Required. Isang kumpletong hakbang bawat line na may timing o texture cue.',
    stepsPlaceholder:
      'Pakuluan ang pasta hanggang al dente at magtabi ng 1/2 cup pasta water.\nI-saute ang hipon nang 2 hanggang 3 minuto bawat side hanggang mag-pink.\nIdagdag ang bawang at cream, pakuluan sandali, saka ihalo sa pasta at keso.',
    save: 'I-save ang recipe',
    saving: 'Sine-save ang recipe...',
    helper: 'Iniingatan na ngayon ng Savorly ang eksaktong image, sangkap, servings, at detalyadong steps mo.',
    autosaveDraft: 'Naka-on ang autosave ng draft para sa recipe na ito.',
    autosaving: 'Sine-save ang draft...',
    autosaved: 'Na-save ang draft',
    restoredDraft: 'Naibalik ang draft',
    clearedDraft: 'Na-clear ang draft matapos mag-save',
    titleError: 'Lagyan ng title ang recipe mo.',
    cookTimeError: 'Maglagay ng tamang cook time gaya ng `30` o `1 hr 15 min`.',
    servingsError: 'Ilagay kung ilang servings ang recipe na ito.',
    ingredientsError: 'Maglista ng kahit isang ingredient para manatiling accurate ang recipe.',
    measuredIngredientsError: 'Bawat ingredient dapat may sukat o note gaya ng `2 cups rice` o `salt to taste`.',
    stepsError: 'Magdagdag ng kahit isang cooking step.',
    minimumStepsError: 'Magdagdag ng hindi bababa sa tatlong steps para kumpleto ang proseso.',
    detailedStepsError: 'Gawing mas malinaw ang bawat step gamit ang action, timing, o texture cue.',
    invalidImageError: 'Gumamit ng valid image URL na nagsisimula sa `http://` o `https://`, o iwan itong blank.',
  },
  ko: {
    back: '뒤로',
    eyebrow: '내 레시피',
    title: '나중에도 다시 쓰고 싶은 레시피를 추가하세요.',
    subtitle: '정확한 계량, 자세한 순서, 이미지까지 넣어 두면 나중에 봐도 헷갈리지 않아요.',
    titleLabel: '레시피 이름',
    titlePlaceholder: '크리미 갈릭 새우 파스타',
    cuisineLabel: '요리 종류',
    cuisineHint: '선택 사항이지만 검색과 탐색에 도움이 돼요.',
    cookTimeLabel: '조리 시간',
    cookTimeHint: '필수예요. 분 단위나 `1 hr 15 min` 같은 형식으로 적어 주세요.',
    servingsLabel: '인분',
    servingsHint: '필수예요. 몇 명이 먹는지 적어 주세요.',
    descriptionLabel: '설명',
    descriptionHint: '선택 사항이에요. 제목만으로 부족하면 짧게 설명해 주세요.',
    descriptionPlaceholder: '이 레시피가 왜 좋은지 짧게 설명해 주세요.',
    imageLabel: '레시피 이미지 URL',
    imageHint: '선택 사항이에요. 직접 고른 커버 이미지를 쓰고 싶다면 링크를 붙여 넣어 주세요.',
    imagePlaceholder: 'https://images.unsplash.com/...',
    imagePreview: '이미지 미리보기',
    invalidImagePreview: '커스텀 커버를 보려면 전체 이미지 URL을 붙여 넣어 주세요.',
    ingredientsLabel: '계량이 포함된 재료',
    ingredientsHint: '필수예요. 한 줄에 하나씩, `250g 파스타`처럼 정확하게 적어 주세요.',
    ingredientsPlaceholder: '250g 스파게티\n300g 손질한 새우\n다진 마늘 3쪽',
    stepsLabel: '자세한 조리 단계',
    stepsHint: '필수예요. 한 줄에 한 단계씩, 시간이나 상태가 보이도록 자세히 적어 주세요.',
    stepsPlaceholder:
      '파스타를 알단테가 될 때까지 삶고 면수 1/2컵을 남겨 둡니다.\n새우를 기름에 올려 한 면당 2~3분씩 익혀 분홍색이 나도록 굽습니다.\n마늘과 크림을 넣고 잠깐 끓인 뒤 파스타와 치즈를 넣어 고루 버무립니다.',
    save: '레시피 저장',
    saving: '레시피 저장 중...',
    helper: '이제 Savorly는 입력한 이미지, 재료, 인분, 조리 단계를 그대로 저장해 두기 때문에 예전처럼 흐릿한 초안이 되지 않아요.',
    autosaveDraft: '이 레시피는 초안 자동 저장이 켜져 있어요.',
    autosaving: '초안 저장 중...',
    autosaved: '초안 저장됨',
    restoredDraft: '초안 복원됨',
    clearedDraft: '저장 후 초안을 정리했어요',
    titleError: '레시피 이름을 입력해 주세요.',
    cookTimeError: '`30` 또는 `1 hr 15 min`처럼 정확한 조리 시간을 입력해 주세요.',
    servingsError: '몇 인분인지 입력해 주세요.',
    ingredientsError: '정확한 레시피를 위해 재료를 한 가지 이상 입력해 주세요.',
    measuredIngredientsError: '`2 cups rice`, `1 clove garlic`, `salt to taste`처럼 각 재료에 계량이나 메모를 넣어 주세요.',
    stepsError: '나중에 다시 볼 수 있도록 조리 단계를 한 줄 이상 적어 주세요.',
    minimumStepsError: '처음부터 끝까지 이해되도록 최소 3단계 이상 적어 주세요.',
    detailedStepsError: '요리하는 사람이 추측하지 않도록 행동, 시간, 상태가 보이게 더 구체적으로 적어 주세요.',
    invalidImageError: '`http://` 또는 `https://`로 시작하는 올바른 이미지 URL을 입력하거나 비워 두세요.',
  },
  ja: {
    back: '戻る',
    eyebrow: 'あなたのレシピ',
    title: 'あとで見返しても迷わないレシピを追加しましょう。',
    subtitle: '正確な分量、詳しい手順、画像まで入れておくと、後からでも使いやすいです。',
    titleLabel: 'レシピ名',
    titlePlaceholder: 'ガーリックシュリンプクリームパスタ',
    cuisineLabel: '料理ジャンル',
    cuisineHint: '任意ですが、検索や閲覧に役立ちます。',
    cookTimeLabel: '調理時間',
    cookTimeHint: '必須です。分単位、または `1 hr 15 min` のように入力してください。',
    servingsLabel: '人数',
    servingsHint: '必須です。何人分かを入力してください。',
    descriptionLabel: '説明',
    descriptionHint: '任意です。タイトルだけでは足りないときに短く補足してください。',
    descriptionPlaceholder: 'このレシピの良さをひとこと添えてください。',
    imageLabel: 'レシピ画像 URL',
    imageHint: '任意です。自分で選んだカバー画像を使いたい場合はリンクを貼ってください。',
    imagePlaceholder: 'https://images.unsplash.com/...',
    imagePreview: '画像プレビュー',
    invalidImagePreview: 'カスタム画像を表示するには完全な画像 URL を貼り付けてください。',
    ingredientsLabel: '分量つきの材料',
    ingredientsHint: '必須です。`250g パスタ` のように、1行に1材料ずつ正確に入力してください。',
    ingredientsPlaceholder: '250g スパゲッティ\n300g 下処理したえび\nにんにく 3片 みじん切り',
    stepsLabel: '詳しい作り方',
    stepsHint: '必須です。1行に1工程ずつ、時間や状態が分かるように詳しく書いてください。',
    stepsPlaceholder:
      'パスタをアルデンテになるまでゆで、ゆで汁を1/2カップ取っておきます。\nえびを油で片面2〜3分ずつ焼き、きれいなピンク色になるまで火を通します。\nにんにくとクリームを加えて軽く煮てから、パスタとチーズを加えて全体を合わせます。',
    save: 'レシピを保存',
    saving: '保存中...',
    helper: 'Savorly は入力した画像、材料、人数、手順をそのまま保存するので、あいまいな下書きになりません。',
    autosaveDraft: 'このレシピでは下書きの自動保存が有効です。',
    autosaving: '下書きを保存中...',
    autosaved: '下書きを保存しました',
    restoredDraft: '下書きを復元しました',
    clearedDraft: '保存後に下書きを削除しました',
    titleError: 'レシピ名を入力してください。',
    cookTimeError: '`30` や `1 hr 15 min` のように正しい調理時間を入力してください。',
    servingsError: '何人分かを入力してください。',
    ingredientsError: '正確なレシピにするため、材料を1つ以上入力してください。',
    measuredIngredientsError: '`2 cups rice`、`1 clove garlic`、`salt to taste` のように、各材料に分量や注記を入れてください。',
    stepsError: 'あとで使えるように、作り方を1行以上入力してください。',
    minimumStepsError: '最初から最後まで分かるように、少なくとも3工程は入力してください。',
    detailedStepsError: '作る人が迷わないように、動作・時間・状態が分かる内容にしてください。',
    invalidImageError: '`http://` または `https://` で始まる有効な画像 URL を入力するか、空欄のままにしてください。',
  },
};

function parseListInput(value: string) {
  return value
    .split(/\r?\n+/)
    .map((line) => line.replace(/^\s*(?:[-*]|\u2022|\d+[.)])\s*/, '').trim())
    .filter(Boolean);
}

export default function AddRecipeScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 420;
  const { isLoading: isAuthLoading, user } = useAuth();
  const params = useLocalSearchParams<{ recipeId?: string }>();
  const { addRecipeFromIdea, recipes, updateRecipeFromIdea } = useRecipes();
  const { settings, theme } = useSettings();
  const effectiveLanguage: AppLanguage = settings.language;
  const screenCopy = ADD_RECIPE_COPY[effectiveLanguage];
  const hasAccess = useProtectedRouteGuard(isAuthLoading, Boolean(user), PROTECTED_AUTH_ROUTES.addRecipe);
  const incomingRecipeId =
    typeof params.recipeId === 'string' ? params.recipeId : Array.isArray(params.recipeId) ? params.recipeId[0] ?? '' : '';
  const editableRecipe = recipes.find((recipe) => recipe.id === incomingRecipeId && recipe.isUserCreated);
  const isEditing = Boolean(editableRecipe);
  const [title, setTitle] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [stepsInput, setStepsInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [draftState, setDraftState] = useState<'idle' | 'saving' | 'saved' | 'restored' | 'cleared'>('idle');
  const [isDraftReady, setIsDraftReady] = useState(false);
  const draftPulse = useMemo(() => new Animated.Value(0), []);
  const trimmedImageUrl = imageUrl.trim();
  const hasCustomPreview = trimmedImageUrl.length > 0 && isLikelyRemoteImageUrl(trimmedImageUrl);
  const ingredientLines = useMemo(() => parseListInput(ingredientsInput), [ingredientsInput]);
  const stepLines = useMemo(() => parseListInput(stepsInput), [stepsInput]);
  const recipeReadinessCount = [
    Boolean(title.trim()),
    Boolean(parseCookTimeMinutes(cookTime)),
    Boolean(parseServingsCount(servings)),
    ingredientLines.length > 0,
    stepLines.length >= 3,
  ].filter(Boolean).length;
  const recipeReadinessLabel =
    recipeReadinessCount === 5
      ? 'Ready to save'
      : `${5 - recipeReadinessCount} thing${5 - recipeReadinessCount === 1 ? '' : 's'} left`;
  const draftStorageKey = `savorly.recipe-draft.v1.${user?.id ?? 'guest'}.${incomingRecipeId || 'new'}`;

  useEffect(() => {
    Animated.timing(draftPulse, {
      toValue: draftState === 'idle' ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [draftPulse, draftState]);

  useEffect(() => {
    let isActive = true;

    async function hydrateDraft() {
      setIsDraftReady(false);

      const baseState = editableRecipe
        ? {
            title: editableRecipe.title,
            cuisine: editableRecipe.cuisine,
            cookTime: `${editableRecipe.cookTime}`,
            servings: `${editableRecipe.servings}`,
            description: editableRecipe.description,
            imageUrl: editableRecipe.image,
            ingredientsInput: editableRecipe.ingredients.join('\n'),
            stepsInput: editableRecipe.steps.join('\n'),
          }
        : {
            title: '',
            cuisine: '',
            cookTime: '',
            servings: '',
            description: '',
            imageUrl: '',
            ingredientsInput: '',
            stepsInput: '',
          };

      setTitle(baseState.title);
      setCuisine(baseState.cuisine);
      setCookTime(baseState.cookTime);
      setServings(baseState.servings);
      setDescription(baseState.description);
      setImageUrl(baseState.imageUrl);
      setIngredientsInput(baseState.ingredientsInput);
      setStepsInput(baseState.stepsInput);
      setErrorMessage(null);
      setDraftState('idle');

      try {
        const storedDraft = await AsyncStorage.getItem(draftStorageKey);

        if (!storedDraft || !isActive) {
          return;
        }

        const parsedDraft = JSON.parse(storedDraft) as Partial<Record<string, string>>;
        setTitle(parsedDraft.title ?? baseState.title);
        setCuisine(parsedDraft.cuisine ?? baseState.cuisine);
        setCookTime(parsedDraft.cookTime ?? baseState.cookTime);
        setServings(parsedDraft.servings ?? baseState.servings);
        setDescription(parsedDraft.description ?? baseState.description);
        setImageUrl(parsedDraft.imageUrl ?? baseState.imageUrl);
        setIngredientsInput(parsedDraft.ingredientsInput ?? baseState.ingredientsInput);
        setStepsInput(parsedDraft.stepsInput ?? baseState.stepsInput);
        setDraftState('restored');
      } catch (error) {
        console.warn('Failed to load recipe draft', error);
      } finally {
        if (isActive) {
          setIsDraftReady(true);
        }
      }
    }

    void hydrateDraft();

    return () => {
      isActive = false;
    };
  }, [draftStorageKey, editableRecipe, incomingRecipeId]);

  useEffect(() => {
    if (!isDraftReady) {
      return;
    }

    const timeout = setTimeout(() => {
      setDraftState('saving');
      void AsyncStorage.setItem(
        draftStorageKey,
        JSON.stringify({
          title,
          cuisine,
          cookTime,
          servings,
          description,
          imageUrl,
          ingredientsInput,
          stepsInput,
        })
      )
        .then(() => {
          setDraftState('saved');
        })
        .catch((error) => {
          console.warn('Failed to save recipe draft', error);
          setDraftState('idle');
        });
    }, 700);

    return () => clearTimeout(timeout);
  }, [cookTime, cuisine, description, draftStorageKey, imageUrl, ingredientsInput, isDraftReady, servings, stepsInput, title]);

  if (!hasAccess) {
    return null;
  }

  async function handleSaveRecipe() {
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage(screenCopy.titleError);
      return;
    }

    const parsedCookTime = parseCookTimeMinutes(cookTime);
    if (!parsedCookTime) {
      setErrorMessage(screenCopy.cookTimeError);
      return;
    }

    const parsedServings = parseServingsCount(servings);
    if (!parsedServings) {
      setErrorMessage(screenCopy.servingsError);
      return;
    }

    if (trimmedImageUrl && !isLikelyRemoteImageUrl(trimmedImageUrl)) {
      setErrorMessage(screenCopy.invalidImageError);
      return;
    }

    const ingredients = parseListInput(ingredientsInput);
    if (ingredients.length === 0) {
      setErrorMessage(screenCopy.ingredientsError);
      return;
    }

    if (ingredients.some((ingredient) => !hasIngredientMeasurement(ingredient))) {
      setErrorMessage(screenCopy.measuredIngredientsError);
      return;
    }

    const steps = parseListInput(stepsInput);
    if (steps.length === 0) {
      setErrorMessage(screenCopy.stepsError);
      return;
    }

    if (steps.length < 3) {
      setErrorMessage(screenCopy.minimumStepsError);
      return;
    }

    if (steps.some((step) => !hasDetailedInstructionStep(step))) {
      setErrorMessage(screenCopy.detailedStepsError);
      return;
    }

    setIsSaving(true);

    try {
      const input = {
        title,
        cuisine,
        cookTime,
        servings,
        description,
        image: trimmedImageUrl,
        ingredients,
        steps,
      };
      const recipe = isEditing && editableRecipe ? updateRecipeFromIdea(editableRecipe.id, input) : addRecipeFromIdea(input);

      if (!recipe) {
        setErrorMessage('This recipe can no longer be edited.');
        return;
      }

      await AsyncStorage.removeItem(draftStorageKey);
      setDraftState('cleared');

      router.replace({
        pathname: '/recipe/[id]',
        params: { id: recipe.id },
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : screenCopy.save);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ResponsiveScrollScreen backgroundColor={theme.appBackground} contentStyle={styles.content} contentWrapStyle={styles.contentWrap}>
      <View style={[styles.backgroundGlowLarge, { backgroundColor: theme.accentSoft }]} />
      <View style={[styles.backgroundGlowSmall, { backgroundColor: theme.cardBackground }]} />

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <MaterialIcons name="arrow-back-ios-new" size={18} color="#251712" />
        <Text style={styles.backText}>{screenCopy.back}</Text>
      </Pressable>

      <View style={[styles.heroCard, { backgroundColor: theme.heroBackground }]}>
        <View style={styles.heroTopRow}>
          <BrandMark size={58} />
          <View style={styles.heroStatusStack}>
            <Animated.View
              style={[
                styles.draftStatusPill,
                {
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  opacity: draftPulse,
                  transform: [
                    {
                      translateY: draftPulse.interpolate({
                        inputRange: [0, 1],
                        outputRange: [6, 0],
                      }),
                    },
                  ],
                },
              ]}>
              <MaterialIcons name={draftState === 'saving' ? 'sync' : 'drafts'} size={14} color={theme.heroAccent} />
              <Text style={[styles.draftStatusText, { color: '#FFF6F0' }]}>
                {draftState === 'saving'
                  ? screenCopy.autosaving
                  : draftState === 'saved'
                    ? screenCopy.autosaved
                    : draftState === 'restored'
                      ? screenCopy.restoredDraft
                      : draftState === 'cleared'
                        ? screenCopy.clearedDraft
                        : screenCopy.autosaveDraft}
              </Text>
            </Animated.View>
            <View style={[styles.readinessPill, { backgroundColor: '#FFF8F2' }]}>
              <View style={[styles.readinessDot, { backgroundColor: recipeReadinessCount === 5 ? '#2F8F66' : theme.accent }]} />
              <Text style={[styles.readinessText, { color: recipeReadinessCount === 5 ? '#2F6C54' : '#8F4526' }]}>
                {recipeReadinessLabel}
              </Text>
            </View>
          </View>
        </View>

        <Text style={[styles.eyebrow, { color: theme.heroAccent }]}>{isEditing ? 'Edit your recipe' : screenCopy.eyebrow}</Text>
        <Text style={styles.heroTitle}>{isEditing ? 'Make your recipe even better.' : screenCopy.title}</Text>
        <Text style={styles.heroSubtitle}>
          {isEditing
            ? 'Update your image, ingredients, and cooking steps without losing the saved recipe you already have.'
            : screenCopy.subtitle}
        </Text>

        <View style={styles.heroMetricsRow}>
          <View style={[styles.heroMetricCard, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
            <Text style={styles.heroMetricValue}>{ingredientLines.length}</Text>
            <Text style={styles.heroMetricLabel}>Ingredients</Text>
          </View>
          <View style={[styles.heroMetricCard, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
            <Text style={styles.heroMetricValue}>{stepLines.length}</Text>
            <Text style={styles.heroMetricLabel}>Steps</Text>
          </View>
          <View style={[styles.heroMetricCard, { backgroundColor: 'rgba(255,255,255,0.08)' }]}>
            <Text style={styles.heroMetricValue}>{servings.trim() || '--'}</Text>
            <Text style={styles.heroMetricLabel}>Servings</Text>
          </View>
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={styles.sectionEyebrow}>Basics</Text>
        <Text style={styles.sectionTitle}>Name the dish and anchor the details.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{screenCopy.titleLabel}</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={screenCopy.titlePlaceholder}
            placeholderTextColor="#9C8B82"
            style={[styles.input, styles.titleInput, { borderColor: theme.border }]}
          />
        </View>

        <View style={[styles.row, isCompact && styles.rowCompact]}>
          <View style={[styles.fieldGroup, styles.rowField]}>
            <Text style={styles.label}>{screenCopy.cuisineLabel}</Text>
            <Text style={styles.fieldHint}>{screenCopy.cuisineHint}</Text>
            <TextInput
              value={cuisine}
              onChangeText={setCuisine}
              placeholder="Italian"
              placeholderTextColor="#9C8B82"
              style={[styles.input, { borderColor: theme.border }]}
            />
          </View>

          <View style={[styles.fieldGroup, styles.rowField]}>
            <Text style={styles.label}>{screenCopy.cookTimeLabel}</Text>
            <Text style={styles.fieldHint}>{screenCopy.cookTimeHint}</Text>
            <TextInput
              value={cookTime}
              onChangeText={setCookTime}
              placeholder="30 min"
              placeholderTextColor="#9C8B82"
              autoCapitalize="none"
              style={[styles.input, { borderColor: theme.border }]}
            />
          </View>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{screenCopy.servingsLabel}</Text>
          <Text style={styles.fieldHint}>{screenCopy.servingsHint}</Text>
          <TextInput
            value={servings}
            onChangeText={setServings}
            placeholder="4"
            placeholderTextColor="#9C8B82"
            keyboardType="number-pad"
            style={[styles.input, { borderColor: theme.border }]}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{screenCopy.descriptionLabel}</Text>
          <Text style={styles.fieldHint}>{screenCopy.descriptionHint}</Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder={screenCopy.descriptionPlaceholder}
            placeholderTextColor="#9C8B82"
            multiline
            textAlignVertical="top"
            style={[styles.textArea, { borderColor: theme.border }]}
          />
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={styles.sectionEyebrow}>Cover</Text>
        <Text style={styles.sectionTitle}>Give the recipe a photo if you have one.</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>{screenCopy.imageLabel}</Text>
          <Text style={styles.fieldHint}>{screenCopy.imageHint}</Text>
          <TextInput
            value={imageUrl}
            onChangeText={setImageUrl}
            placeholder={screenCopy.imagePlaceholder}
            placeholderTextColor="#9C8B82"
            autoCapitalize="none"
            style={[styles.input, { borderColor: theme.border }]}
          />
        </View>

        <View style={[styles.previewCard, { backgroundColor: theme.appBackground, borderColor: theme.border }]}>
          <Text style={styles.previewLabel}>{screenCopy.imagePreview}</Text>
          {hasCustomPreview ? (
            <Image source={trimmedImageUrl} style={styles.previewImage} contentFit="cover" />
          ) : (
            <View style={styles.previewEmptyState}>
              <MaterialIcons name="photo-camera-back" size={22} color={theme.accent} />
              <Text style={styles.previewHint}>{trimmedImageUrl ? screenCopy.invalidImagePreview : 'Your custom cover will show up here.'}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionEyebrow}>Ingredients</Text>
            <Text style={styles.sectionTitle}>List each ingredient on its own line.</Text>
          </View>
          <View style={[styles.sectionCountPill, { backgroundColor: theme.accentSoft }]}>
            <Text style={[styles.sectionCountText, { color: theme.accent }]}>{ingredientLines.length} lines</Text>
          </View>
        </View>

        <Text style={styles.fieldHint}>{screenCopy.ingredientsHint}</Text>
        <TextInput
          value={ingredientsInput}
          onChangeText={setIngredientsInput}
          placeholder={screenCopy.ingredientsPlaceholder}
          placeholderTextColor="#9C8B82"
          multiline
          textAlignVertical="top"
          style={[styles.listArea, styles.ingredientsArea, { borderColor: theme.border }]}
        />
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.sectionHeaderRow}>
          <View>
            <Text style={styles.sectionEyebrow}>Method</Text>
            <Text style={styles.sectionTitle}>Write steps a real cook can follow.</Text>
          </View>
          <View style={[styles.sectionCountPill, { backgroundColor: theme.accentSoft }]}>
            <Text style={[styles.sectionCountText, { color: theme.accent }]}>{stepLines.length} steps</Text>
          </View>
        </View>

        <Text style={styles.fieldHint}>{screenCopy.stepsHint}</Text>
        <TextInput
          value={stepsInput}
          onChangeText={setStepsInput}
          placeholder={screenCopy.stepsPlaceholder}
          placeholderTextColor="#9C8B82"
          multiline
          textAlignVertical="top"
          style={[styles.listArea, styles.stepsArea, { borderColor: theme.border }]}
        />
      </View>

      <View style={[styles.saveCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={styles.helperText}>
          {isEditing
            ? 'Editing keeps the same saved recipe in your collection while refreshing the details you changed.'
            : screenCopy.helper}
        </Text>

        {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

        <Pressable
          style={[styles.primaryButton, { backgroundColor: theme.accent }, isSaving && styles.buttonDisabled]}
          onPress={handleSaveRecipe}
          disabled={isSaving}>
          <Text style={styles.primaryButtonText}>
            {isSaving ? (isEditing ? 'Updating recipe...' : screenCopy.saving) : isEditing ? 'Save changes' : screenCopy.save}
          </Text>
        </Pressable>
      </View>
    </ResponsiveScrollScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
  },
  backgroundGlowLarge: {
    position: 'absolute',
    top: 22,
    right: -48,
    width: 190,
    height: 190,
    borderRadius: 95,
    opacity: 0.52,
  },
  backgroundGlowSmall: {
    position: 'absolute',
    top: 240,
    left: -28,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.8,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    marginBottom: 14,
    paddingVertical: 6,
  },
  backText: {
    color: '#251712',
    fontSize: 14,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 34,
    padding: 20,
    overflow: 'hidden',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroStatusStack: {
    flexShrink: 1,
    alignItems: 'flex-end',
    gap: 10,
  },
  draftStatusPill: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  draftStatusText: {
    fontSize: 12,
    fontWeight: '800',
  },
  readinessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  readinessDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  readinessText: {
    fontSize: 12,
    fontWeight: '800',
  },
  eyebrow: {
    marginTop: 18,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  heroTitle: {
    marginTop: 8,
    color: '#FFF8F2',
    fontSize: 31,
    lineHeight: 35,
    fontWeight: '900',
  },
  heroSubtitle: {
    marginTop: 8,
    color: '#ECDAD2',
    fontSize: 14,
    lineHeight: 21,
  },
  heroMetricsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  heroMetricCard: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  heroMetricValue: {
    color: '#FFF8F2',
    fontSize: 22,
    fontWeight: '900',
  },
  heroMetricLabel: {
    marginTop: 4,
    color: '#D9C2B6',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  sectionCard: {
    marginTop: 16,
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
  },
  saveCard: {
    marginTop: 16,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowCompact: {
    flexDirection: 'column',
    gap: 0,
  },
  rowField: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  sectionEyebrow: {
    color: '#A16244',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    marginTop: 6,
    color: '#251712',
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '900',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 12,
  },
  sectionCountPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  sectionCountText: {
    fontSize: 12,
    fontWeight: '800',
  },
  label: {
    color: '#37241D',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  fieldHint: {
    marginTop: -2,
    marginBottom: 8,
    color: '#8A7B73',
    fontSize: 12,
    lineHeight: 17,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EEDBCF',
    borderRadius: 20,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 16,
    paddingVertical: 15,
    color: '#251712',
    fontSize: 15,
  },
  titleInput: {
    fontSize: 18,
    fontWeight: '800',
  },
  textArea: {
    minHeight: 132,
    borderWidth: 1,
    borderColor: '#EEDBCF',
    borderRadius: 20,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#251712',
    fontSize: 15,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 14,
    overflow: 'hidden',
  },
  previewLabel: {
    color: '#37241D',
    fontSize: 13,
    fontWeight: '800',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 16,
    marginTop: 12,
    backgroundColor: '#E9DDD4',
  },
  previewEmptyState: {
    marginTop: 12,
    minHeight: 142,
    borderRadius: 18,
    backgroundColor: '#FFF8F2',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 8,
  },
  previewHint: {
    color: '#8A7B73',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  listArea: {
    minHeight: 124,
    borderWidth: 1,
    borderColor: '#EEDBCF',
    borderRadius: 20,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#251712',
    fontSize: 15,
    lineHeight: 22,
  },
  ingredientsArea: {
    minHeight: 164,
  },
  stepsArea: {
    minHeight: 220,
  },
  primaryButton: {
    marginTop: 2,
    borderRadius: 20,
    backgroundColor: '#C7512D',
    alignItems: 'center',
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#FFF8F2',
    fontSize: 16,
    fontWeight: '800',
  },
  errorText: {
    marginTop: 2,
    marginBottom: 10,
    color: '#B1382F',
    fontSize: 13,
    fontWeight: '700',
  },
  helperText: {
    marginBottom: 14,
    color: '#8A7B73',
    fontSize: 13,
    lineHeight: 19,
  },
  buttonDisabled: {
    opacity: 0.75,
  },
});
