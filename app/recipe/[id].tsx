import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useAuth } from '@/components/auth-provider';
import { FavoriteButton } from '@/components/favorite-button';
import { useRecipes } from '@/components/recipes-provider';
import type { AppLanguage } from '@/components/settings-provider';
import { useSettings } from '@/components/settings-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { formatCookTime, formatIngredientForDisplay, getUiCopy } from '@/utils/app-settings-display';
import { openProtectedRoute, PROTECTED_AUTH_ROUTES } from '@/utils/auth-gate';

type RecipeDetailCopy = {
  back: string;
  cookTime: string;
  servings: string;
  ingredientCount: string;
  mealPlanningLabel: string;
  mealPlanningTitle: string;
  plannerCopy: string;
  plannerActiveCopy: string;
  plannerGuestCopy: string;
  addToPlanner: string;
  plannedToday: string;
  saveTomorrow: string;
  tomorrowSaved: string;
  openPlanner: string;
  signInForPlanner: string;
  createAccountToPlan: string;
  yourRecipeLabel: string;
  manageDraftTitle: string;
  manageDraftCopy: string;
  deleteThisRecipe: string;
  deleteAlertTitle: string;
  deleteAlertBody: string;
  cancel: string;
  delete: string;
  categories: string;
  step: string;
};

type RecipeWorkspaceCopy = {
  editRecipe: string;
  cookingMode: string;
  cookingModeCopy: string;
  startCookingMode: string;
  planWeek: string;
  cookMode: string;
  manage: string;
  recipeBoard: string;
  recipeBoardCopy: string;
  method: string;
  cookingProgress: string;
  cookingModeFootnote: string;
};

const RECIPE_DETAIL_COPY: Record<AppLanguage, RecipeDetailCopy> = {
  en: {
    back: 'Back',
    cookTime: 'Cook time',
    servings: 'Servings',
    ingredientCount: 'Ingredients',
    mealPlanningLabel: 'Meal planning',
    mealPlanningTitle: 'Keep this in your week',
    plannerCopy: 'Add this recipe to your planner now or save it for tomorrow dinner.',
    plannerActiveCopy: 'This recipe is already sitting in today\'s plan, and you can still pin it for tomorrow dinner too.',
    plannerGuestCopy: 'Create an account to save this recipe into your planner and keep your week attached to your profile.',
    addToPlanner: 'Add to planner',
    plannedToday: 'Added for today',
    saveTomorrow: 'Save for tomorrow',
    tomorrowSaved: 'Tomorrow saved',
    openPlanner: 'Open full meal planner',
    signInForPlanner: 'Sign in to use meal planner',
    createAccountToPlan: 'Create account to plan meals',
    yourRecipeLabel: 'Your recipe',
    manageDraftTitle: 'Manage this recipe',
    manageDraftCopy: 'If you do not want to keep this recipe anymore, you can remove it here and Savorly will also clear any meal plan slots using it.',
    deleteThisRecipe: 'Delete this recipe',
    deleteAlertTitle: 'Delete recipe?',
    deleteAlertBody: 'This removes your recipe from Savorly, including saved lists and any meal-plan slots using it.',
    cancel: 'Cancel',
    delete: 'Delete',
    categories: 'Categories',
    step: 'Step',
  },
  es: {
    back: 'Volver',
    cookTime: 'Tiempo',
    servings: 'Porciones',
    ingredientCount: 'Ingredientes',
    mealPlanningLabel: 'Planificacion',
    mealPlanningTitle: 'Guardala en tu semana',
    plannerCopy: 'Agrega esta receta al plan ahora o guardala para la cena de manana.',
    plannerActiveCopy: 'Esta receta ya esta en el plan de hoy, y aun puedes guardarla para manana.',
    plannerGuestCopy: 'Crea una cuenta para guardar esta receta en tu plan semanal.',
    addToPlanner: 'Agregar al plan',
    plannedToday: 'Agregada hoy',
    saveTomorrow: 'Guardar para manana',
    tomorrowSaved: 'Guardada para manana',
    openPlanner: 'Abrir planificador',
    signInForPlanner: 'Inicia sesion para usar el planificador',
    createAccountToPlan: 'Crear cuenta para planificar',
    yourRecipeLabel: 'Tu receta',
    manageDraftTitle: 'Gestiona esta receta',
    manageDraftCopy: 'Si ya no quieres conservar esta receta, puedes eliminarla aqui y Savorly limpiara tambien los espacios del plan de comidas.',
    deleteThisRecipe: 'Eliminar esta receta',
    deleteAlertTitle: 'Eliminar receta?',
    deleteAlertBody: 'Esto elimina tu receta de Savorly, incluidas las listas guardadas y los espacios del plan que la usan.',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    categories: 'Categorias',
    step: 'Paso',
  },
  fr: {
    back: 'Retour',
    cookTime: 'Cuisson',
    servings: 'Portions',
    ingredientCount: 'Ingredients',
    mealPlanningLabel: 'Planification',
    mealPlanningTitle: 'Gardez-la dans votre semaine',
    plannerCopy: 'Ajoutez cette recette au planning maintenant ou gardez-la pour demain soir.',
    plannerActiveCopy: 'Cette recette est deja dans le planning du jour et peut aussi etre gardee pour demain soir.',
    plannerGuestCopy: 'Creez un compte pour enregistrer cette recette dans votre planning.',
    addToPlanner: 'Ajouter au planning',
    plannedToday: 'Ajoutee pour aujourd hui',
    saveTomorrow: 'Garder pour demain',
    tomorrowSaved: 'Gardee pour demain',
    openPlanner: 'Ouvrir le planning',
    signInForPlanner: 'Connectez-vous pour planifier',
    createAccountToPlan: 'Creer un compte pour planifier',
    yourRecipeLabel: 'Votre recette',
    manageDraftTitle: 'Gerer cette recette',
    manageDraftCopy: 'Si vous ne souhaitez plus garder cette recette, vous pouvez la supprimer ici et Savorly videra aussi les emplacements du planning.',
    deleteThisRecipe: 'Supprimer cette recette',
    deleteAlertTitle: 'Supprimer la recette ?',
    deleteAlertBody: 'Cela supprime votre recette de Savorly, y compris les listes sauvegardees et les repas planifies qui l utilisent.',
    cancel: 'Annuler',
    delete: 'Supprimer',
    categories: 'Categories',
    step: 'Etape',
  },
  fil: {
    back: 'Bumalik',
    cookTime: 'Oras',
    servings: 'Servings',
    ingredientCount: 'Sangkap',
    mealPlanningLabel: 'Meal planning',
    mealPlanningTitle: 'Isama ito sa linggo mo',
    plannerCopy: 'Idagdag ang recipe na ito sa planner ngayon o i-save para sa dinner bukas.',
    plannerActiveCopy: 'Nasa plan mo na ito para sa araw na ito, at puwede mo pa rin itong i-save para bukas.',
    plannerGuestCopy: 'Gumawa ng account para mai-save ang recipe na ito sa meal planner mo.',
    addToPlanner: 'Idagdag sa planner',
    plannedToday: 'Naidagdag na ngayon',
    saveTomorrow: 'I-save para bukas',
    tomorrowSaved: 'Naka-save para bukas',
    openPlanner: 'Buksan ang full meal planner',
    signInForPlanner: 'Mag-sign in para gamitin ang planner',
    createAccountToPlan: 'Gumawa ng account para magplano',
    yourRecipeLabel: 'Iyong recipe',
    manageDraftTitle: 'Pamahalaan ang recipe na ito',
    manageDraftCopy: 'Kung ayaw mo nang itago ang recipe na ito, puwede mo itong alisin dito at lilinisin din ng Savorly ang mga meal plan slot na gumagamit dito.',
    deleteThisRecipe: 'Burahin ang recipe na ito',
    deleteAlertTitle: 'Burahin ang recipe?',
    deleteAlertBody: 'Aalisin nito ang recipe mo sa Savorly, kasama ang saved lists at meal-plan slots na gumagamit dito.',
    cancel: 'Cancel',
    delete: 'Delete',
    categories: 'Categories',
    step: 'Hakbang',
  },
  ko: {
    back: '뒤로',
    cookTime: '조리 시간',
    servings: '인분',
    ingredientCount: '재료 수',
    mealPlanningLabel: '식단 계획',
    mealPlanningTitle: '이번 주 식단에 담아 두세요',
    plannerCopy: '이 레시피를 지금 플래너에 추가하거나 내일 저녁용으로 저장할 수 있어요.',
    plannerActiveCopy: '이 레시피는 이미 오늘 식단에 들어가 있어요. 원하면 내일 저녁에도 저장할 수 있어요.',
    plannerGuestCopy: '이 레시피를 식단 플래너에 저장하려면 계정을 만들어 주세요.',
    addToPlanner: '플래너에 추가',
    plannedToday: '오늘에 추가됨',
    saveTomorrow: '내일용 저장',
    tomorrowSaved: '내일용 저장됨',
    openPlanner: '전체 식단 플래너 열기',
    signInForPlanner: '플래너를 쓰려면 로그인하세요',
    createAccountToPlan: '계정을 만들어 식단 계획하기',
    yourRecipeLabel: '내 레시피',
    manageDraftTitle: '이 레시피 관리',
    manageDraftCopy: '더 이상 이 레시피를 보관하고 싶지 않다면 여기서 삭제할 수 있고, 연결된 식단 슬롯도 함께 정리돼요.',
    deleteThisRecipe: '이 레시피 삭제',
    deleteAlertTitle: '레시피를 삭제할까요?',
    deleteAlertBody: '삭제하면 Savorly 에서 이 레시피와 저장 목록, 그리고 연결된 식단 슬롯이 함께 제거돼요.',
    cancel: '취소',
    delete: '삭제',
    categories: '카테고리',
    step: '단계',
  },
  ja: {
    back: '戻る',
    cookTime: '調理時間',
    servings: '人数',
    ingredientCount: '材料数',
    mealPlanningLabel: '食事プラン',
    mealPlanningTitle: '今週の予定に入れておきましょう',
    plannerCopy: 'このレシピを今すぐプランに追加するか、明日の夕食用に保存できます。',
    plannerActiveCopy: 'このレシピはすでに今日のプランに入っています。必要なら明日の夕食にも保存できます。',
    plannerGuestCopy: 'このレシピを食事プランに保存するにはアカウントを作成してください。',
    addToPlanner: 'プランに追加',
    plannedToday: '今日に追加済み',
    saveTomorrow: '明日用に保存',
    tomorrowSaved: '明日用に保存済み',
    openPlanner: '食事プランを開く',
    signInForPlanner: 'プラン機能はサインイン後に使えます',
    createAccountToPlan: 'アカウントを作成して計画する',
    yourRecipeLabel: 'あなたのレシピ',
    manageDraftTitle: 'このレシピを管理',
    manageDraftCopy: 'このレシピを残したくない場合はここで削除できます。Savorly は関連する食事プラン枠も一緒に整理します。',
    deleteThisRecipe: 'このレシピを削除',
    deleteAlertTitle: 'レシピを削除しますか？',
    deleteAlertBody: '削除すると、保存リストや使用中の食事プラン枠も含めて Savorly から取り除かれます。',
    cancel: 'キャンセル',
    delete: '削除',
    categories: 'カテゴリ',
    step: '手順',
  },
};

const RECIPE_WORKSPACE_COPY: Record<AppLanguage, RecipeWorkspaceCopy> = {
  en: {
    editRecipe: 'Edit recipe',
    cookingMode: 'Cooking mode',
    cookingModeCopy: 'Focus on one step at a time with larger controls while you cook.',
    startCookingMode: 'Start cooking mode',
    planWeek: 'Plan week',
    cookMode: 'Cook mode',
    manage: 'Manage',
    recipeBoard: 'Recipe board',
    recipeBoardCopy: 'Switch between prep and method instead of scrolling through everything at once.',
    method: 'Method',
    cookingProgress: 'Cooking progress',
    cookingModeFootnote: 'Continue in cooking mode for the full guided step-by-step flow.',
  },
  es: {
    editRecipe: 'Editar receta',
    cookingMode: 'Modo de cocina',
    cookingModeCopy: 'Concentrate en un paso a la vez con controles mas grandes mientras cocinas.',
    startCookingMode: 'Abrir modo cocina',
    planWeek: 'Planear semana',
    cookMode: 'Modo cocina',
    manage: 'Gestionar',
    recipeBoard: 'Tablero de receta',
    recipeBoardCopy: 'Cambia entre preparacion y metodo sin recorrer todo de una vez.',
    method: 'Metodo',
    cookingProgress: 'Progreso de cocina',
    cookingModeFootnote: 'Continua en el modo de cocina para ver la guia completa paso a paso.',
  },
  fr: {
    editRecipe: 'Modifier la recette',
    cookingMode: 'Mode cuisine',
    cookingModeCopy: 'Concentrez-vous sur une etape a la fois avec des commandes plus grandes pendant la cuisson.',
    startCookingMode: 'Ouvrir le mode cuisine',
    planWeek: 'Planifier la semaine',
    cookMode: 'Mode cuisine',
    manage: 'Gerer',
    recipeBoard: 'Tableau recette',
    recipeBoardCopy: 'Passez de la preparation a la methode sans tout faire defiler.',
    method: 'Methode',
    cookingProgress: 'Progression',
    cookingModeFootnote: 'Continuez en mode cuisine pour le guide complet etape par etape.',
  },
  fil: {
    editRecipe: 'I-edit ang recipe',
    cookingMode: 'Cooking mode',
    cookingModeCopy: 'Mag-focus sa tig-isang step gamit ang mas malalaking controls habang nagluluto.',
    startCookingMode: 'Simulan ang cooking mode',
    planWeek: 'Planuhin ang week',
    cookMode: 'Cook mode',
    manage: 'Manage',
    recipeBoard: 'Recipe board',
    recipeBoardCopy: 'Magpalit sa prep at method nang hindi ini-scroll lahat.',
    method: 'Method',
    cookingProgress: 'Cooking progress',
    cookingModeFootnote: 'Magpatuloy sa cooking mode para sa buong guided step-by-step flow.',
  },
  ko: {
    editRecipe: '레시피 수정',
    cookingMode: '요리 모드',
    cookingModeCopy: '요리하는 동안 큰 조작 버튼으로 한 단계씩 집중할 수 있어요.',
    startCookingMode: '요리 모드 시작',
    planWeek: '주간 계획',
    cookMode: '요리 모드',
    manage: '관리',
    recipeBoard: '레시피 보드',
    recipeBoardCopy: '모든 내용을 길게 스크롤하지 않고 준비와 방법을 전환할 수 있어요.',
    method: '방법',
    cookingProgress: '조리 진행도',
    cookingModeFootnote: '전체 단계별 안내는 요리 모드에서 계속 볼 수 있어요.',
  },
  ja: {
    editRecipe: 'レシピを編集',
    cookingMode: '調理モード',
    cookingModeCopy: '調理中は大きめの操作で一度に一手順ずつ進められます。',
    startCookingMode: '調理モードを開始',
    planWeek: '週に入れる',
    cookMode: '調理モード',
    manage: '管理',
    recipeBoard: 'レシピボード',
    recipeBoardCopy: 'すべてを長くスクロールせず、材料と手順を切り替えられます。',
    method: '手順',
    cookingProgress: '調理の進行',
    cookingModeFootnote: '完全な手順ガイドは調理モードで続けて確認できます。',
  },
};

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

function getCurrentMealSlot(date: Date) {
  const hour = date.getHours();

  if (hour < 11) return 'breakfast';
  if (hour < 17) return 'lunch';
  return 'dinner';
}

function getIngredientsSectionNote(language: AppLanguage, servings: number, ingredientCount: number) {
  if (language === 'ko') {
    return `${servings}인분 기준으로 정리된 ${ingredientCount}개의 재료예요.`;
  }

  if (language === 'ja') {
    return `${servings}人分に合わせた ${ingredientCount} 個の材料です。`;
  }

  if (language === 'es') {
    return `${ingredientCount} ingredientes medidos para ${servings} porciones.`;
  }

  if (language === 'fr') {
    return `${ingredientCount} ingredients mesures pour ${servings} portions.`;
  }

  if (language === 'fil') {
    return `${ingredientCount} na sukat na sangkap para sa ${servings} servings.`;
  }

  return `${ingredientCount} measured ingredients for ${servings} servings.`;
}

function getMethodSectionNote(language: AppLanguage, stepCount: number) {
  if (language === 'ko') {
    return `${stepCount}개의 단계를 조리 순서대로 정리했어요. 시작하기 전에 한 번 끝까지 읽어 보세요.`;
  }

  if (language === 'ja') {
    return `${stepCount}つの手順を調理順に並べています。作り始める前に一度最後まで読んでください。`;
  }

  if (language === 'es') {
    return `${stepCount} pasos en orden de coccion. Leelos completos antes de empezar.`;
  }

  if (language === 'fr') {
    return `${stepCount} etapes dans l ordre de cuisson. Lisez-les une fois avant de commencer.`;
  }

  if (language === 'fil') {
    return `${stepCount} steps ito na nakaayos ayon sa totoong daloy ng pagluto. Basahin muna lahat bago magsimula.`;
  }

  return `${stepCount} detailed steps in cooking order. Read through them once before you start.`;
}

export default function RecipeDetailScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const { user } = useAuth();
  const { cookingProgress, deleteRecipe, mealPlans, recipes, setMealPlanSlot, toggleFavorite, trackRecipeView } = useRecipes();
  const { settings, theme } = useSettings();
  const effectiveLanguage: AppLanguage = settings.language;
  const uiCopy = getUiCopy(effectiveLanguage);
  const screenCopy = RECIPE_DETAIL_COPY[effectiveLanguage];
  const workspaceCopy = RECIPE_WORKSPACE_COPY[effectiveLanguage];
  const { id } = useLocalSearchParams<{ id: string }>();
  const isSignedIn = Boolean(user);
  const [activeContentSection, setActiveContentSection] = useState<'ingredients' | 'method'>('method');
  const [activeUtilityPanel, setActiveUtilityPanel] = useState<'planner' | 'manage' | null>(null);
  const recipe = recipes.find((item) => item.id === id);
  const now = new Date();
  const currentMealSlot = getCurrentMealSlot(now);
  const todayKey = getDateKey(now);
  const tomorrowKey = getDateKey(addDays(now, 1));
  const isPlannedForCurrentSlot = mealPlans[todayKey]?.[currentMealSlot] === recipe?.id;
  const isPlannedForTomorrowDinner = mealPlans[tomorrowKey]?.dinner === recipe?.id;

  useEffect(() => {
    if (!id) {
      return;
    }

    trackRecipeView(id);
  }, [id, trackRecipeView]);

  function handleDeleteRecipe() {
    if (!recipe?.isUserCreated) {
      return;
    }

    Alert.alert(screenCopy.deleteAlertTitle, screenCopy.deleteAlertBody, [
      {
        text: screenCopy.cancel,
        style: 'cancel',
      },
      {
        text: screenCopy.delete,
        style: 'destructive',
        onPress: () => {
          deleteRecipe(recipe.id);
          router.replace('/(tabs)/saved');
        },
      },
    ]);
  }

  if (!recipe) {
    return (
      <View style={[styles.missingSafeArea, { backgroundColor: theme.tabBarBackground }]}>
        <View style={styles.missingContainer}>
          <Text style={styles.missingTitle}>{uiCopy.recipeNotFound}</Text>
          <Pressable style={[styles.backButtonMissing, { backgroundColor: theme.accent }]} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{uiCopy.goBack}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const plannerCopy = isSignedIn
    ? isPlannedForCurrentSlot
      ? screenCopy.plannerActiveCopy
      : screenCopy.plannerCopy
    : screenCopy.plannerGuestCopy;
  const summaryItems = [
    {
      key: 'cook-time',
      icon: 'schedule' as const,
      value: formatCookTime(recipe.cookTime, settings.language),
      label: screenCopy.cookTime,
    },
    {
      key: 'servings',
      icon: 'groups' as const,
      value: `${recipe.servings}`,
      label: screenCopy.servings,
    },
    {
      key: 'ingredients',
      icon: 'format-list-bulleted' as const,
      value: `${recipe.ingredients.length}`,
      label: screenCopy.ingredientCount,
    },
  ];
  const editRecipeLabel = workspaceCopy.editRecipe;
  const cookModeLabel = workspaceCopy.cookingMode;
  const cookModeCopy = workspaceCopy.cookingModeCopy;
  const startCookingModeLabel = workspaceCopy.startCookingMode;
  const activeCookingStep = Math.min(cookingProgress[recipe.id] ?? 0, Math.max(recipe.steps.length - 1, 0));
  const utilityActions = [
    { key: 'planner' as const, label: workspaceCopy.planWeek, icon: 'calendar-month' as const },
    { key: 'cook' as const, label: workspaceCopy.cookMode, icon: 'soup-kitchen' as const },
    ...(recipe.isUserCreated ? [{ key: 'manage' as const, label: workspaceCopy.manage, icon: 'edit-note' as const }] : []),
  ];

  return (
    <ResponsiveScrollScreen
      backgroundColor={theme.tabBarBackground}
      contentStyle={styles.screenContent}
      contentWrapStyle={styles.contentWrap}>
      <View style={styles.heroShell}>
        <View style={[styles.hero, isCompact && styles.heroCompact]}>
          <Image source={recipe.image} style={styles.heroImage} contentFit="cover" />
          <Pressable style={[styles.floatingBackButton, isCompact && styles.floatingBackButtonCompact]} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={22} color="#23150F" />
          </Pressable>
          <View style={[styles.favoriteButtonWrap, isCompact && styles.favoriteButtonWrapCompact]}>
            <FavoriteButton active={recipe.saved} onPress={() => toggleFavorite(recipe.id)} />
          </View>
          <View style={styles.heroOverlay}>
            <Text style={styles.heroCuisine}>{recipe.cuisine}</Text>
            <Text style={[styles.heroTitle, isCompact && styles.heroTitleCompact]}>{recipe.title}</Text>
            <Text style={styles.heroDescription}>{recipe.description}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.overviewCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.summaryGrid}>
          {summaryItems.map((item) => (
            <View key={item.key} style={[styles.summaryCard, { backgroundColor: theme.appBackground, borderColor: theme.border }]}>
              <View style={[styles.summaryIconWrap, { backgroundColor: theme.accentSoft }]}>
                <MaterialIcons name={item.icon} size={18} color={theme.accent} />
              </View>
              <View style={styles.summaryBody}>
                <Text style={styles.summaryValue}>{item.value}</Text>
                <Text style={styles.summaryLabel}>{item.label}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.overviewDivider, { backgroundColor: theme.border }]} />

        <View style={styles.overviewGroup}>
          <Text style={[styles.overviewLabel, { color: theme.accent }]}>{screenCopy.categories}</Text>
          <View style={styles.tagRow}>
            {recipe.categories.map((category) => (
              <Text
                key={category}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: theme.appBackground,
                    color: theme.accent,
                    borderColor: theme.border,
                  },
                ]}>
                {category}
              </Text>
            ))}
          </View>
        </View>

        <View style={[styles.overviewGroup, styles.overviewGroupSpacing]}>
          <Text style={[styles.overviewLabel, { color: theme.accent }]}>{uiCopy.tags}</Text>
          <View style={styles.tagRow}>
            {recipe.tags.map((tag) => (
              <Text key={tag} style={[styles.tagChip, { backgroundColor: theme.accentSoft, color: theme.accent }]}>
                {tag}
              </Text>
            ))}
          </View>
        </View>
      </View>

      <View style={[styles.utilityDock, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.utilityRail}>
          {utilityActions.map((action) => (
            <Pressable
              key={action.key}
              style={[
                styles.utilityChip,
                {
                  backgroundColor:
                    activeUtilityPanel === action.key || (action.key === 'cook' && activeContentSection === 'method')
                      ? theme.accentSoft
                      : theme.appBackground,
                  borderColor:
                    activeUtilityPanel === action.key || (action.key === 'cook' && activeContentSection === 'method')
                      ? theme.accent
                      : theme.border,
                },
              ]}
              onPress={() => {
                if (action.key === 'cook') {
                  router.push({
                    pathname: '/recipe/[id]/cook',
                    params: { id: recipe.id },
                  });
                  return;
                }

                setActiveUtilityPanel((current) => (current === action.key ? null : action.key));
              }}>
              <MaterialIcons name={action.icon} size={18} color={theme.accent} />
              <Text style={[styles.utilityChipText, { color: theme.accent }]}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        {activeUtilityPanel === 'planner' ? (
          <View style={[styles.utilityPanel, { backgroundColor: theme.appBackground, borderColor: theme.border }]}>
            <Text style={[styles.utilityPanelEyebrow, { color: theme.accent }]}>{screenCopy.mealPlanningLabel}</Text>
            <Text style={styles.utilityPanelTitle}>{screenCopy.mealPlanningTitle}</Text>
            <Text style={styles.utilityPanelCopy}>{plannerCopy}</Text>
            {isSignedIn ? (
              <View style={[styles.utilityActionRow, isCompact && styles.utilityActionRowCompact]}>
                <Pressable
                  style={[styles.planPrimaryButton, { backgroundColor: theme.accent }]}
                  onPress={() => setMealPlanSlot(todayKey, currentMealSlot, recipe.id)}>
                  <Text style={styles.planPrimaryButtonText}>
                    {isPlannedForCurrentSlot ? screenCopy.plannedToday : screenCopy.addToPlanner}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.planSecondaryButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                  onPress={() => setMealPlanSlot(tomorrowKey, 'dinner', recipe.id)}>
                  <Text style={[styles.planSecondaryButtonText, { color: theme.accent }]}>
                    {isPlannedForTomorrowDinner ? screenCopy.tomorrowSaved : screenCopy.saveTomorrow}
                  </Text>
                </Pressable>
              </View>
            ) : (
              <Pressable
                style={[styles.planPrimaryButton, { backgroundColor: theme.accent }]}
                onPress={() => openProtectedRoute(false, PROTECTED_AUTH_ROUTES.mealPlanner)}>
                <Text style={styles.planPrimaryButtonText}>{screenCopy.createAccountToPlan}</Text>
              </Pressable>
            )}
          </View>
        ) : null}

        {activeUtilityPanel === 'manage' && recipe.isUserCreated ? (
          <View style={[styles.utilityPanel, { backgroundColor: theme.appBackground, borderColor: theme.border }]}>
            <Text style={[styles.utilityPanelEyebrow, { color: theme.accent }]}>{screenCopy.yourRecipeLabel}</Text>
            <Text style={styles.utilityPanelTitle}>{screenCopy.manageDraftTitle}</Text>
            <Text style={styles.utilityPanelCopy}>{screenCopy.manageDraftCopy}</Text>
            <View style={[styles.utilityActionRow, isCompact && styles.utilityActionRowCompact]}>
              <Pressable
                style={[styles.editButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                onPress={() =>
                  router.push({
                    pathname: '/add-recipe',
                    params: { recipeId: recipe.id },
                  })
                }>
                <MaterialIcons name="edit" size={18} color={theme.accent} />
                <Text style={[styles.editButtonText, { color: theme.accent }]}>{editRecipeLabel}</Text>
              </Pressable>
              <Pressable
                style={[styles.deleteButton, { backgroundColor: theme.accentSoft, borderColor: theme.border }]}
                onPress={handleDeleteRecipe}>
                <MaterialIcons name="delete-outline" size={18} color={theme.accent} />
                <Text style={[styles.deleteButtonText, { color: theme.accent }]}>{screenCopy.deleteThisRecipe}</Text>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>

      <View style={[styles.contentDeck, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.deckHeader}>
          <View>
            <Text style={styles.deckTitle}>{workspaceCopy.recipeBoard}</Text>
            <Text style={styles.deckCopy}>
              {workspaceCopy.recipeBoardCopy}
            </Text>
          </View>
          <View style={styles.deckTabs}>
            <Pressable
              style={[
                styles.deckTab,
                {
                  backgroundColor: activeContentSection === 'ingredients' ? theme.accentSoft : theme.appBackground,
                  borderColor: activeContentSection === 'ingredients' ? theme.accent : theme.border,
                },
              ]}
              onPress={() => setActiveContentSection('ingredients')}>
              <Text style={[styles.deckTabText, { color: activeContentSection === 'ingredients' ? theme.accent : '#5A4337' }]}>
                {uiCopy.ingredients}
              </Text>
            </Pressable>
            <Pressable
              style={[
                styles.deckTab,
                {
                  backgroundColor: activeContentSection === 'method' ? theme.accentSoft : theme.appBackground,
                  borderColor: activeContentSection === 'method' ? theme.accent : theme.border,
                },
              ]}
              onPress={() => setActiveContentSection('method')}>
              <Text style={[styles.deckTabText, { color: activeContentSection === 'method' ? theme.accent : '#5A4337' }]}>
                {workspaceCopy.method}
              </Text>
            </Pressable>
          </View>
        </View>

        {activeContentSection === 'ingredients' ? (
          <View style={styles.panelSection}>
            <Text style={styles.sectionTitle}>{uiCopy.ingredients}</Text>
            <Text style={styles.sectionCaption}>
              {getIngredientsSectionNote(effectiveLanguage, recipe.servings, recipe.ingredients.length)}
            </Text>
            <View style={styles.ingredientsCloud}>
              {recipe.ingredients.map((ingredient) => (
                <View
                  key={ingredient}
                  style={[styles.ingredientPill, { backgroundColor: theme.appBackground, borderColor: theme.border }]}>
                  <View style={[styles.listDot, { backgroundColor: theme.accent }]} />
                  <Text style={styles.ingredientPillText}>{formatIngredientForDisplay(ingredient, settings.measurementSystem)}</Text>
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.panelSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{uiCopy.howToMakeIt}</Text>
              <Text style={styles.sectionCaption}>{getMethodSectionNote(effectiveLanguage, recipe.steps.length)}</Text>
            </View>
            <View style={[styles.cookModeCard, { backgroundColor: theme.accentSoft, borderColor: theme.border }]}>
              <View style={styles.cookModeCopyBlock}>
                <Text style={[styles.cookModeTitle, { color: theme.accent }]}>{cookModeLabel}</Text>
                <Text style={styles.cookModeText}>{cookModeCopy}</Text>
              </View>
              <Pressable
                style={[styles.cookModeButton, { backgroundColor: theme.accent }]}
                onPress={() =>
                  router.push({
                    pathname: '/recipe/[id]/cook',
                    params: { id: recipe.id },
                  })
                }>
                <Text style={styles.cookModeButtonText}>{startCookingModeLabel}</Text>
              </Pressable>
            </View>
            <View style={[styles.progressCard, { backgroundColor: theme.appBackground, borderColor: theme.border }]}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressTitle}>{workspaceCopy.cookingProgress}</Text>
                <Text style={[styles.progressValue, { color: theme.accent }]}>
                  {activeCookingStep + 1}/{recipe.steps.length}
                </Text>
              </View>
              <View style={styles.progressTrack}>
                {recipe.steps.map((step, index) => {
                  const isCompleted = index < activeCookingStep;
                  const isActive = index === activeCookingStep;

                  return (
                    <View key={`${recipe.id}-bar-${index + 1}`} style={styles.progressNodeWrap}>
                      <View
                        style={[
                          styles.progressNode,
                          {
                            backgroundColor: isCompleted || isActive ? theme.accent : theme.cardBackground,
                            borderColor: isCompleted || isActive ? theme.accent : theme.border,
                          },
                        ]}>
                        <Text
                          style={[
                            styles.progressNodeText,
                            { color: isCompleted || isActive ? '#FFFFFF' : '#8A7A70' },
                          ]}>
                          {index + 1}
                        </Text>
                      </View>
                      {index < recipe.steps.length - 1 ? (
                        <View
                          style={[
                            styles.progressConnector,
                            { backgroundColor: index < activeCookingStep ? theme.accent : theme.border },
                          ]}
                        />
                      ) : null}
                    </View>
                  );
                })}
              </View>
            </View>
            <Text style={styles.methodFootnote}>{workspaceCopy.cookingModeFootnote}</Text>
          </View>
        )}
      </View>
    </ResponsiveScrollScreen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    paddingHorizontal: 0,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
  },
  heroShell: {
    marginHorizontal: 20,
    borderRadius: 30,
    shadowColor: '#190E09',
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  hero: {
    height: 360,
    backgroundColor: '#E5D2C3',
    overflow: 'hidden',
    borderRadius: 30,
  },
  heroCompact: {
    height: 316,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  floatingBackButton: {
    position: 'absolute',
    top: 18,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 248, 242, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBackButtonCompact: {
    left: 16,
  },
  favoriteButtonWrap: {
    position: 'absolute',
    top: 18,
    right: 20,
    zIndex: 1,
  },
  favoriteButtonWrapCompact: {
    right: 16,
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    backgroundColor: 'rgba(35, 21, 15, 0.52)',
  },
  heroCuisine: {
    color: '#FFE6D8',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '800',
  },
  heroTitleCompact: {
    fontSize: 26,
    lineHeight: 30,
  },
  heroDescription: {
    marginTop: 8,
    color: '#F7E7DD',
    fontSize: 15,
    lineHeight: 22,
  },
  overviewCard: {
    marginTop: 18,
    marginHorizontal: 20,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  overviewDivider: {
    height: 1,
    marginTop: 18,
    marginBottom: 16,
  },
  overviewGroup: {
    gap: 10,
  },
  overviewGroupSpacing: {
    marginTop: 16,
  },
  overviewLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  summaryCard: {
    flexGrow: 1,
    minWidth: 72,
    flexBasis: 72,
    borderRadius: 15,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 8,
    gap: 6,
  },
  summaryRow: {
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  summaryIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryBody: {
    marginTop: 1,
  },
  summaryValue: {
    color: '#23150F',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 16,
  },
  summaryLabel: {
    color: '#8A7A70',
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 12,
  },
  utilityDock: {
    marginTop: 18,
    marginHorizontal: 20,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  utilityRail: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  utilityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  utilityChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  utilityPanel: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
  },
  utilityPanelEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  utilityPanelTitle: {
    marginTop: 8,
    color: '#23150F',
    fontSize: 20,
    fontWeight: '800',
  },
  utilityPanelCopy: {
    marginTop: 8,
    color: '#6D5D55',
    fontSize: 14,
    lineHeight: 20,
  },
  utilityActionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  utilityActionRowCompact: {
    flexDirection: 'column',
  },
  planPrimaryButton: {
    flex: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planPrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  planSecondaryButton: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planSecondaryButtonText: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  planLinkButton: {
    marginTop: 12,
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  planLinkText: {
    fontSize: 13,
    fontWeight: '800',
  },
  contentDeck: {
    marginTop: 18,
    marginHorizontal: 20,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
  },
  deckHeader: {
    gap: 14,
  },
  deckTitle: {
    color: '#23150F',
    fontSize: 22,
    fontWeight: '800',
  },
  deckCopy: {
    marginTop: 6,
    color: '#6D5D55',
    fontSize: 14,
    lineHeight: 20,
  },
  deckTabs: {
    flexDirection: 'row',
    gap: 10,
  },
  deckTab: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  deckTabText: {
    fontSize: 13,
    fontWeight: '800',
  },
  editButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  editButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  deleteButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  panelSection: {
    marginTop: 18,
  },
  sectionHeader: {
    marginBottom: 14,
    gap: 6,
  },
  sectionTitle: {
    color: '#23150F',
    fontSize: 22,
    fontWeight: '800',
  },
  sectionCaption: {
    color: '#7B6D65',
    fontSize: 13,
    lineHeight: 19,
  },
  ingredientCard: {
  },
  ingredientsCloud: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  ingredientPill: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: '100%',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  ingredientPillText: {
    flexShrink: 1,
    color: '#52463F',
    fontSize: 14,
    lineHeight: 20,
  },
  listDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    backgroundColor: '#C7512D',
  },
  listText: {
    flex: 1,
    color: '#52463F',
    fontSize: 15,
    lineHeight: 22,
  },
  cookModeCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
    gap: 12,
  },
  cookModeCopyBlock: {
    gap: 6,
  },
  cookModeTitle: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  cookModeText: {
    color: '#5E4C43',
    fontSize: 13,
    lineHeight: 19,
  },
  cookModeButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cookModeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  progressCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  progressTitle: {
    color: '#23150F',
    fontSize: 15,
    fontWeight: '800',
  },
  progressValue: {
    fontSize: 13,
    fontWeight: '800',
  },
  progressTrack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
  },
  progressNodeWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressNode: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressNodeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressConnector: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    marginHorizontal: 8,
  },
  methodFootnote: {
    marginTop: 14,
    color: '#7B6D65',
    fontSize: 13,
    lineHeight: 19,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagChip: {
    borderRadius: 999,
    backgroundColor: '#F8E6D8',
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#9E4E2C',
    fontSize: 13,
    fontWeight: '700',
  },
  categoryChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
  },
  missingSafeArea: {
    flex: 1,
    backgroundColor: '#FFF8F2',
  },
  missingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  missingTitle: {
    color: '#23150F',
    fontSize: 24,
    fontWeight: '800',
  },
  backButtonMissing: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: '#C7512D',
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
