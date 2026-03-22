import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useRecipes } from '@/components/recipes-provider';
import { type AppLanguage, useSettings } from '@/components/settings-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { formatCookTime, formatIngredientForDisplay, formatInstructionForDisplay } from '@/utils/app-settings-display';

type CookingModeCopy = {
  recipeNotFound: string;
  goBack: string;
  hideIngredients: string;
  showIngredients: string;
  cookingMode: string;
  ingredients: string;
  stepOf: (step: number, total: number) => string;
  previous: string;
  nextStep: string;
  finishCooking: string;
  servings: string;
};

const COOK_COPY: Record<AppLanguage, CookingModeCopy> = {
  en: {
    recipeNotFound: 'Recipe not found',
    goBack: 'Go back',
    hideIngredients: 'Hide ingredients',
    showIngredients: 'Show ingredients',
    cookingMode: 'Cooking mode',
    ingredients: 'Ingredients',
    stepOf: (step, total) => `Step ${step} of ${total}`,
    previous: 'Previous',
    nextStep: 'Next step',
    finishCooking: 'Finish cooking',
    servings: 'servings',
  },
  es: {
    recipeNotFound: 'Receta no encontrada',
    goBack: 'Volver',
    hideIngredients: 'Ocultar ingredientes',
    showIngredients: 'Mostrar ingredientes',
    cookingMode: 'Modo de cocina',
    ingredients: 'Ingredientes',
    stepOf: (step, total) => `Paso ${step} de ${total}`,
    previous: 'Anterior',
    nextStep: 'Siguiente paso',
    finishCooking: 'Terminar',
    servings: 'porciones',
  },
  fr: {
    recipeNotFound: 'Recette introuvable',
    goBack: 'Retour',
    hideIngredients: 'Masquer les ingredients',
    showIngredients: 'Afficher les ingredients',
    cookingMode: 'Mode cuisine',
    ingredients: 'Ingredients',
    stepOf: (step, total) => `Etape ${step} sur ${total}`,
    previous: 'Precedent',
    nextStep: 'Etape suivante',
    finishCooking: 'Terminer',
    servings: 'portions',
  },
  fil: {
    recipeNotFound: 'Walang recipe na nahanap',
    goBack: 'Bumalik',
    hideIngredients: 'Itago ang ingredients',
    showIngredients: 'Ipakita ang ingredients',
    cookingMode: 'Cooking mode',
    ingredients: 'Ingredients',
    stepOf: (step, total) => `Step ${step} sa ${total}`,
    previous: 'Nakaraan',
    nextStep: 'Susunod na step',
    finishCooking: 'Tapusin ang pagluluto',
    servings: 'servings',
  },
  ko: {
    recipeNotFound: '레시피를 찾을 수 없어요',
    goBack: '뒤로 가기',
    hideIngredients: '재료 숨기기',
    showIngredients: '재료 보기',
    cookingMode: '요리 모드',
    ingredients: '재료',
    stepOf: (step, total) => `${step}/${total} 단계`,
    previous: '이전',
    nextStep: '다음 단계',
    finishCooking: '요리 끝내기',
    servings: '인분',
  },
  ja: {
    recipeNotFound: 'レシピが見つかりません',
    goBack: '戻る',
    hideIngredients: '材料を隠す',
    showIngredients: '材料を表示',
    cookingMode: '調理モード',
    ingredients: '材料',
    stepOf: (step, total) => `手順 ${step} / ${total}`,
    previous: '前へ',
    nextStep: '次の手順',
    finishCooking: '調理完了',
    servings: '人分',
  },
};

export default function CookingModeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { cookingProgress, recipes, setCookingProgress } = useRecipes();
  const { settings, theme } = useSettings();
  const copy = COOK_COPY[settings.language];
  const recipe = recipes.find((item) => item.id === id);
  const [stepIndex, setStepIndex] = useState(() => {
    if (!recipe) {
      return 0;
    }

    return Math.min(cookingProgress[recipe.id] ?? 0, Math.max(recipe.steps.length - 1, 0));
  });
  const [showIngredients, setShowIngredients] = useState(true);

  if (!recipe) {
    return (
      <ResponsiveScrollScreen backgroundColor={theme.heroBackground} contentStyle={styles.screen}>
        <Text style={styles.missingTitle}>{copy.recipeNotFound}</Text>
        <Pressable style={[styles.primaryButton, { backgroundColor: theme.accent }]} onPress={() => router.back()}>
          <Text style={styles.primaryButtonText}>{copy.goBack}</Text>
        </Pressable>
      </ResponsiveScrollScreen>
    );
  }

  const activeRecipe = recipe;
  const currentStep = activeRecipe.steps[stepIndex];
  const isFirstStep = stepIndex === 0;
  const isLastStep = stepIndex === activeRecipe.steps.length - 1;

  function handlePreviousStep() {
    const next = Math.max(0, stepIndex - 1);
    setStepIndex(next);
    setCookingProgress(activeRecipe.id, next);
  }

  function handleNextStep() {
    if (isLastStep) {
      setCookingProgress(activeRecipe.id, 0);
      setStepIndex(0);
      router.back();
      return;
    }

    const next = Math.min(activeRecipe.steps.length - 1, stepIndex + 1);
    setStepIndex(next);
    setCookingProgress(activeRecipe.id, next);
  }

  return (
    <ResponsiveScrollScreen backgroundColor={theme.heroBackground} contentStyle={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} color="#FFF8F2" />
        </Pressable>
        <Pressable
          style={[styles.ingredientsToggle, { borderColor: theme.heroAccent }]}
          onPress={() => setShowIngredients((current) => !current)}>
          <Text style={[styles.ingredientsToggleText, { color: theme.heroAccent }]}>
            {showIngredients ? copy.hideIngredients : copy.showIngredients}
          </Text>
        </Pressable>
      </View>

      <Text style={[styles.eyebrow, { color: theme.heroAccent }]}>{copy.cookingMode}</Text>
      <Text style={styles.recipeTitle}>{activeRecipe.title}</Text>
      <Text style={styles.recipeMeta}>
        {formatCookTime(activeRecipe.cookTime, settings.language)} - {activeRecipe.servings} {copy.servings}
      </Text>

      {showIngredients ? (
        <View style={styles.ingredientsSection}>
          <Text style={styles.sectionLabel}>{copy.ingredients}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.ingredientsRow}>
            {activeRecipe.ingredients.map((ingredient) => (
              <View key={ingredient} style={[styles.ingredientChip, { borderColor: theme.heroAccent }]}>
                <Text style={styles.ingredientText}>{formatIngredientForDisplay(ingredient, settings.measurementSystem)}</Text>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={[styles.stepCard, { borderColor: theme.heroAccent }]}>
        <Text style={[styles.stepEyebrow, { color: theme.heroAccent }]}>
          {copy.stepOf(stepIndex + 1, activeRecipe.steps.length)}
        </Text>
        <Text style={styles.stepText}>{formatInstructionForDisplay(currentStep, settings.measurementSystem)}</Text>
      </View>

      <View style={styles.progressRow}>
        {activeRecipe.steps.map((step, index) => (
          <View
            key={`${activeRecipe.id}-progress-${index + 1}`}
            style={[
              styles.progressDot,
              {
                backgroundColor: index <= stepIndex ? theme.heroAccent : 'rgba(255, 255, 255, 0.18)',
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.actionsRow}>
        <Pressable
          style={[styles.secondaryButton, { borderColor: theme.heroAccent }, isFirstStep && styles.buttonDisabled]}
          onPress={handlePreviousStep}
          disabled={isFirstStep}>
          <Text style={[styles.secondaryButtonText, { color: theme.heroAccent }]}>{copy.previous}</Text>
        </Pressable>
        <Pressable
          style={[styles.primaryButton, { backgroundColor: theme.accent }, isLastStep && styles.buttonDone]}
          onPress={handleNextStep}>
          <Text style={styles.primaryButtonText}>{isLastStep ? copy.finishCooking : copy.nextStep}</Text>
        </Pressable>
      </View>
    </ResponsiveScrollScreen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 20,
    paddingBottom: 44,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 248, 242, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientsToggle: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  ingredientsToggleText: {
    fontSize: 12,
    fontWeight: '800',
  },
  eyebrow: {
    marginTop: 20,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  recipeTitle: {
    marginTop: 10,
    color: '#FFF8F2',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
  },
  recipeMeta: {
    marginTop: 8,
    color: '#E7D3C7',
    fontSize: 14,
    fontWeight: '600',
  },
  ingredientsSection: {
    marginTop: 22,
  },
  sectionLabel: {
    color: '#FFF8F2',
    fontSize: 14,
    fontWeight: '800',
  },
  ingredientsRow: {
    gap: 10,
    marginTop: 12,
    paddingRight: 8,
  },
  ingredientChip: {
    maxWidth: 240,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 248, 242, 0.08)',
  },
  ingredientText: {
    color: '#FFF8F2',
    fontSize: 13,
    lineHeight: 19,
  },
  stepCard: {
    marginTop: 28,
    borderWidth: 1,
    borderRadius: 30,
    padding: 22,
    backgroundColor: 'rgba(255, 248, 242, 0.08)',
  },
  stepEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  stepText: {
    marginTop: 14,
    color: '#FFF8F2',
    fontSize: 25,
    lineHeight: 36,
    fontWeight: '700',
  },
  progressRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 22,
    flexWrap: 'wrap',
  },
  progressDot: {
    width: 22,
    height: 6,
    borderRadius: 999,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 26,
  },
  secondaryButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '800',
  },
  primaryButton: {
    flex: 1.25,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonDone: {
    flex: 1.4,
  },
  missingTitle: {
    color: '#FFF8F2',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 16,
  },
});
