import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { FavoriteButton } from '@/components/favorite-button';
import { useRecipes } from '@/components/recipes-provider';
import { useSettings } from '@/components/settings-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { formatCookTime, getUiCopy } from '@/utils/app-settings-display';

const quickFilters = ['Comfort', 'Spicy', 'Seafood', 'Quick', 'Vegetarian'];

export default function SearchScreen() {
  const { width } = useWindowDimensions();
  const { recordSearchQuery, searchRecipes, toggleFavorite } = useRecipes();
  const { settings, theme } = useSettings();
  const contentWidth = Math.min(width - 40, 460);
  const cardWidth = (contentWidth - 12) / 2;
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLowerCase();
  const rankedResults = searchRecipes(query);
  const filteredRecipes = rankedResults.map((result) => result.recipe);
  const copy = getUiCopy(settings.language);

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
    <ResponsiveScrollScreen backgroundColor={theme.tabBarBackground} contentStyle={styles.screenPadding}>
      <Text style={styles.title}>{copy.searchNextBite}</Text>
      <Text style={styles.subtitle}>
        Look up dishes, ingredients, or moods like &quot;comfort&quot; or &quot;high protein&quot;.
      </Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={copy.searchPlaceholder}
        placeholderTextColor="#9A8D84"
        style={[styles.input, { borderColor: theme.border }]}
      />

      <View style={styles.topRow}>
        <View style={styles.filterRow}>
          {quickFilters.map((filter) => (
            <Pressable key={filter} style={[styles.filterChip, { backgroundColor: theme.accentSoft }]} onPress={() => setQuery(filter)}>
              <Text style={[styles.filterText, { color: theme.accent }]}>{filter}</Text>
            </Pressable>
          ))}
        </View>
        <Pressable style={[styles.addButton, { backgroundColor: theme.heroBackground }]} onPress={() => router.push('/add-recipe')}>
          <Text style={styles.addButtonText}>{copy.addRecipe}</Text>
        </Pressable>
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>{filteredRecipes.length} {copy.recipes}</Text>
        <Text style={styles.resultsCopy}>
          {normalizedQuery ? 'Results are ranked by ingredient, title, and taste-profile relevance.' : 'Tap a card to see ingredients and cooking steps.'}
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
  resultDescription: { marginTop: 8, color: '#72655C', fontSize: 13, lineHeight: 18 },
  matchReason: { marginTop: 7, fontSize: 12, fontWeight: '700' },
});
