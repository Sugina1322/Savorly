import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import { useRecipes } from '@/components/recipes-provider';
import { useSettings } from '@/components/settings-provider';
import { getUiCopy } from '@/utils/app-settings-display';
import { PROTECTED_AUTH_ROUTES, useProtectedRouteGuard } from '@/utils/auth-gate';
import { parseCookTimeMinutes, parseServingsCount } from '@/utils/recipe-intelligence';

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
  const { addRecipeFromIdea } = useRecipes();
  const { settings, theme } = useSettings();
  const copy = getUiCopy(settings.language);
  const hasAccess = useProtectedRouteGuard(isAuthLoading, Boolean(user), PROTECTED_AUTH_ROUTES.addRecipe);
  const [title, setTitle] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [cookTime, setCookTime] = useState('');
  const [servings, setServings] = useState('');
  const [description, setDescription] = useState('');
  const [ingredientsInput, setIngredientsInput] = useState('');
  const [stepsInput, setStepsInput] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!hasAccess) {
    return null;
  }

  async function handleSaveRecipe() {
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('Give your recipe a title.');
      return;
    }

    const parsedCookTime = parseCookTimeMinutes(cookTime);
    if (!parsedCookTime) {
      setErrorMessage('Add an accurate cook time, like `30` or `1 hr 15 min`.');
      return;
    }

    const parsedServings = parseServingsCount(servings);
    if (!parsedServings) {
      setErrorMessage('Add how many servings this recipe makes.');
      return;
    }

    const ingredients = parseListInput(ingredientsInput);
    if (ingredients.length === 0) {
      setErrorMessage('List at least one ingredient so the recipe stays accurate.');
      return;
    }

    const steps = parseListInput(stepsInput);
    if (steps.length === 0) {
      setErrorMessage('Add at least one cooking step so the recipe is usable later.');
      return;
    }

    setIsSaving(true);

    try {
      const recipe = addRecipeFromIdea({
        title,
        cuisine,
        cookTime,
        servings,
        description,
        ingredients,
        steps,
      });

      router.replace({
        pathname: '/recipe/[id]',
        params: { id: recipe.id },
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to save your recipe right now.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.appBackground }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrap}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back-ios-new" size={18} color="#251712" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={[styles.eyebrow, { color: theme.accent }]}>{copy.yourRecipe}</Text>
            <Text style={styles.title}>Add something worth saving.</Text>
            <Text style={styles.subtitle}>
              Enter the real cook time, servings, ingredients, and steps so the recipe you save matches what you
              actually want to cook later.
            </Text>
          </View>

          <View style={[styles.card, { borderColor: theme.border }]}>
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Recipe title</Text>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="Creamy garlic shrimp pasta"
                placeholderTextColor="#9C8B82"
                style={[styles.input, { borderColor: theme.border }]}
              />
            </View>

            <View style={[styles.row, isCompact && styles.rowCompact]}>
              <View style={[styles.fieldGroup, styles.rowField]}>
                <Text style={styles.label}>Cuisine</Text>
                <Text style={styles.fieldHint}>Optional. Helpful for search and browsing.</Text>
                <TextInput
                  value={cuisine}
                  onChangeText={setCuisine}
                  placeholder="Italian"
                  placeholderTextColor="#9C8B82"
                  style={[styles.input, { borderColor: theme.border }]}
                />
              </View>

              <View style={[styles.fieldGroup, styles.rowField]}>
                <Text style={styles.label}>Cook time</Text>
                <Text style={styles.fieldHint}>Required. Use minutes or `1 hr 15 min`.</Text>
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
              <Text style={styles.label}>Servings</Text>
              <Text style={styles.fieldHint}>Required. How many people this recipe feeds.</Text>
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
              <Text style={styles.label}>Description</Text>
              <Text style={styles.fieldHint}>Optional. Add extra context if the title does not say enough.</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Tell people why this recipe deserves a spot in their kitchen."
                placeholderTextColor="#9C8B82"
                multiline
                textAlignVertical="top"
                style={[styles.textArea, { borderColor: theme.border }]}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Ingredients needed</Text>
              <Text style={styles.fieldHint}>Required. Add one ingredient per line.</Text>
              <TextInput
                value={ingredientsInput}
                onChangeText={setIngredientsInput}
                placeholder={`2 chicken breasts\n3 cloves garlic\n1 cup rice`}
                placeholderTextColor="#9C8B82"
                multiline
                textAlignVertical="top"
                style={[styles.listArea, { borderColor: theme.border }]}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Cooking steps</Text>
              <Text style={styles.fieldHint}>Required. Add one step per line in the order you actually cook them.</Text>
              <TextInput
                value={stepsInput}
                onChangeText={setStepsInput}
                placeholder={`Season the chicken.\nSear until golden.\nServe with rice and sauce.`}
                placeholderTextColor="#9C8B82"
                multiline
                textAlignVertical="top"
                style={[styles.listArea, styles.stepsArea, { borderColor: theme.border }]}
              />
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Pressable
              style={[styles.primaryButton, { backgroundColor: theme.accent }, isSaving && styles.buttonDisabled]}
              onPress={handleSaveRecipe}
              disabled={isSaving}>
              <Text style={styles.primaryButtonText}>{isSaving ? 'Saving recipe...' : copy.saveRecipe}</Text>
            </Pressable>

            <Text style={styles.helperText}>
              Savorly keeps the ingredients, steps, cook time, and servings exactly as you enter them so your saved
              recipe stays accurate later.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCF5EE',
  },
  content: {
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 40,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    paddingVertical: 6,
  },
  backText: {
    color: '#251712',
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    marginTop: 16,
    marginBottom: 20,
  },
  eyebrow: {
    color: '#A16244',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  title: {
    marginTop: 8,
    color: '#251712',
    fontSize: 30,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 8,
    color: '#6D5D55',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0DDD0',
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
    borderRadius: 18,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#251712',
    fontSize: 15,
  },
  textArea: {
    minHeight: 132,
    borderWidth: 1,
    borderColor: '#EEDBCF',
    borderRadius: 18,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#251712',
    fontSize: 15,
  },
  listArea: {
    minHeight: 124,
    borderWidth: 1,
    borderColor: '#EEDBCF',
    borderRadius: 18,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#251712',
    fontSize: 15,
  },
  stepsArea: {
    minHeight: 150,
  },
  primaryButton: {
    marginTop: 4,
    borderRadius: 18,
    backgroundColor: '#C7512D',
    alignItems: 'center',
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: '#FFF8F2',
    fontSize: 15,
    fontWeight: '800',
  },
  errorText: {
    marginTop: 4,
    marginBottom: 10,
    color: '#B1382F',
    fontSize: 13,
    fontWeight: '700',
  },
  helperText: {
    marginTop: 14,
    color: '#8A7B73',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  buttonDisabled: {
    opacity: 0.75,
  },
});
