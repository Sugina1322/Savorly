import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { useAuth } from '@/components/auth-provider';
import { FavoriteButton } from '@/components/favorite-button';
import { useRecipes } from '@/components/recipes-provider';
import { useSettings } from '@/components/settings-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { formatCookTime, getUiCopy } from '@/utils/app-settings-display';
import { openProtectedRoute, PROTECTED_AUTH_ROUTES } from '@/utils/auth-gate';
import { matchRecipesByPantry } from '@/utils/recipe-intelligence';

const quickFilters = ['Restaurant-like', 'Everyday food', 'Easy recipes', 'High protein', 'Filipino favorites', 'Pantry-friendly'];

export default function SearchScreen() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { recipes, recordSearchQuery, searchRecipes, toggleFavorite } = useRecipes();
  const { settings, theme } = useSettings();
  const contentWidth = Math.min(width - 40, 460);
  const cardWidth = (contentWidth - 12) / 2;
  const isSignedIn = Boolean(user);
  const [query, setQuery] = useState('');
  const [pantryInput, setPantryInput] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const rankedResults = searchRecipes(query);
  const filteredRecipes = rankedResults.map((result) => result.recipe);
  const pantryMatches = matchRecipesByPantry(recipes, pantryInput).slice(0, 3);
  const copy = getUiCopy(settings.language);
  const incomingQuery =
    typeof params.q === 'string' ? params.q : Array.isArray(params.q) ? params.q[0] ?? '' : '';

  useEffect(() => {
    if (!incomingQuery.trim()) {
      return;
    }

    setQuery(incomingQuery);
  }, [incomingQuery]);

  useEffect(() => {
    if (normalizedQuery.length < 2) {
      return;
    }

    const timeout = setTimeout(() => {
      recordSearchQuery(normalizedQuery);
    }, 350);

    return () => clearTimeout(timeout);
  }, [normalizedQuery, recordSearchQuery]);

  return (
    <ResponsiveScrollScreen backgroundColor={theme.tabBarBackground} bottomInsetBehavior="tab-bar" contentStyle={styles.screenPadding}>
      <Text style={styles.title}>{copy.searchNextBite}</Text>
      <Text style={styles.subtitle}>
        Browse by category, search by dish, or type the ingredients already in your kitchen.
      </Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={copy.searchPlaceholder}
        placeholderTextColor="#9A8D84"
        style={[styles.input, { borderColor: theme.border }]}
      />

      <View style={styles.topRow}>
        <Text style={styles.sectionEyebrow}>Browse by vibe</Text>
        <View style={styles.filterRow}>
          {quickFilters.map((filter) => (
            <Pressable key={filter} style={[styles.filterChip, { backgroundColor: theme.accentSoft }]} onPress={() => setQuery(filter)}>
              <Text style={[styles.filterText, { color: theme.accent }]}>{filter}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable
          style={[styles.addButton, { backgroundColor: theme.heroBackground }]}
          onPress={() => openProtectedRoute(isSignedIn, PROTECTED_AUTH_ROUTES.addRecipe)}>
          <Text style={styles.addButtonText}>{copy.addRecipe}</Text>
        </Pressable>
      </View>

      <View style={[styles.pantryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={styles.pantryTitle}>Cook from your kitchen</Text>
        <Text style={styles.pantryCopy}>Try ingredients like `egg, tofu, onion, rice` or `chicken, garlic, soy sauce`.</Text>
        <TextInput
          value={pantryInput}
          onChangeText={setPantryInput}
          placeholder="What do you already have?"
          placeholderTextColor="#9A8D84"
          style={[styles.input, styles.pantryInput, { borderColor: theme.border }]}
        />

        {pantryMatches.length > 0 ? (
          <View style={styles.pantryMatches}>
            {pantryMatches.map((result) => (
              <Pressable
                key={result.recipe.id}
                style={[styles.pantryMatchCard, { borderColor: theme.border }]}
                onPress={() =>
                  router.push({
                    pathname: '/recipe/[id]',
                    params: { id: result.recipe.id },
                  })
                }>
                <View style={styles.pantryMatchHeader}>
                  <Text style={styles.pantryMatchTitle}>{result.recipe.title}</Text>
                  <Text style={[styles.pantryMatchTime, { color: theme.accent }]}>
                    {formatCookTime(result.recipe.cookTime, settings.language)}
                  </Text>
                </View>
                <Text style={styles.pantryMatchReason}>{result.reason}</Text>
                <Text style={styles.pantryMatchMeta}>
                  Have: {result.matchedIngredients.slice(0, 3).join(', ')}
                </Text>
                <Text style={styles.pantryMatchMeta}>
                  Still need: {result.missingIngredients.slice(0, 3).join(', ')}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : pantryInput.trim().length > 0 ? (
          <Text style={styles.emptyPantryCopy}>No strong pantry matches yet. Try shorter ingredients like `egg`, `rice`, `garlic`, or `tofu`.</Text>
        ) : null}
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>{filteredRecipes.length} {copy.recipes}</Text>
        <Text style={styles.resultsCopy}>
          {normalizedQuery ? 'Results are ranked by title, ingredients, categories, and taste-profile relevance.' : 'Tap a card to see ingredients, categories, and cooking steps.'}
        </Text>
      </View>

      <View style={styles.grid}>
        {rankedResults.map((result, index) => {
          const recipe = result.recipe;

          return (
          <Pressable
            key={recipe.id}
            style={[styles.resultCard, { width: cardWidth }, index % 4 === 1 && styles.resultCardLifted]}
            onPress={() =>
              router.push({
                pathname: '/recipe/[id]',
                params: { id: recipe.id },
              })
            }>
            <Image source={recipe.image} style={[styles.resultImage, index % 2 === 0 && styles.resultImageTall]} contentFit="cover" />
            <View style={styles.cardFavorite}>
              <FavoriteButton active={recipe.saved} onPress={() => toggleFavorite(recipe.id)} />
            </View>
            <View style={styles.resultBody}>
              <Text style={styles.resultTitle}>{recipe.title}</Text>
              <Text style={styles.resultMeta}>
                {recipe.cuisine} - {formatCookTime(recipe.cookTime, settings.language)}
              </Text>
              <Text style={[styles.matchReason, { color: theme.accent }]}>{result.reason}</Text>
              <View style={styles.categoryRow}>
                {recipe.categories.slice(0, 2).map((category) => (
                  <Text key={category} style={[styles.categoryChip, { backgroundColor: theme.accentSoft, color: theme.accent }]}>
                    {category}
                  </Text>
                ))}
              </View>
              <Text style={styles.resultDescription} numberOfLines={3}>
                {recipe.description}
              </Text>
            </View>
          </Pressable>
        )})}
      </View>
    </ResponsiveScrollScreen>
  );
}

const styles = StyleSheet.create({
  screenPadding: { paddingHorizontal: 20 },
  title: { color: '#23150F', fontSize: 30, fontWeight: '800' },
  subtitle: { marginTop: 8, color: '#6B5F58', fontSize: 15, lineHeight: 22 },
  sectionEyebrow: { color: '#7B6D65', fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  input: {
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#E8D6C8',
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#23150F',
    fontSize: 15,
  },
  topRow: { marginTop: 16, gap: 12 },
  filterRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  filterChip: {
    borderRadius: 999,
    backgroundColor: '#F8E6D8',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterText: { color: '#9E4E2C', fontSize: 13, fontWeight: '700' },
  addButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#23150F',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addButtonText: { color: '#FFF8F2', fontSize: 13, fontWeight: '800' },
  pantryCard: {
    marginTop: 22,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  pantryTitle: { color: '#23150F', fontSize: 19, fontWeight: '800' },
  pantryCopy: { marginTop: 6, color: '#6B5F58', fontSize: 13, lineHeight: 19 },
  pantryInput: { marginTop: 14, marginBottom: 0 },
  pantryMatches: { marginTop: 14, gap: 10 },
  pantryMatchCard: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#FFF9F5',
  },
  pantryMatchHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  pantryMatchTitle: { flex: 1, color: '#23150F', fontSize: 15, fontWeight: '800' },
  pantryMatchTime: { color: '#9E4E2C', fontSize: 12, fontWeight: '800' },
  pantryMatchReason: { marginTop: 6, color: '#5E4C43', fontSize: 13, fontWeight: '700' },
  pantryMatchMeta: { marginTop: 5, color: '#7B6D65', fontSize: 12, lineHeight: 17 },
  emptyPantryCopy: { marginTop: 12, color: '#7B6D65', fontSize: 12, lineHeight: 18 },
  resultsHeader: { marginTop: 24, marginBottom: 14 },
  resultsTitle: { color: '#23150F', fontSize: 18, fontWeight: '700' },
  resultsCopy: { marginTop: 4, color: '#7B6D65', fontSize: 13 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  resultCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EEDBCF',
  },
  resultCardLifted: {
    transform: [{ translateY: 14 }],
    marginBottom: 14,
  },
  resultImage: { width: '100%', height: 138 },
  resultImageTall: { height: 182 },
  cardFavorite: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  resultBody: { padding: 14 },
  resultTitle: { color: '#23150F', fontSize: 16, fontWeight: '700' },
  resultMeta: { marginTop: 6, color: '#A36B46', fontSize: 12, fontWeight: '600' },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 8 },
  categoryChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
  },
  resultDescription: { marginTop: 8, color: '#72655C', fontSize: 13, lineHeight: 18 },
  matchReason: { marginTop: 7, fontSize: 12, fontWeight: '700' },
});
