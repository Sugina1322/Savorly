import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useAuth } from '@/components/auth-provider';
import { FavoriteButton } from '@/components/favorite-button';
import { useRecipes } from '@/components/recipes-provider';
import { useSettings } from '@/components/settings-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { formatCookTime, getUiCopy } from '@/utils/app-settings-display';
import { openProtectedRoute, PROTECTED_AUTH_ROUTES } from '@/utils/auth-gate';

export default function SavedScreen() {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { clearSavedRecipes, recipes, savedCount, smartCollections, tasteProfile, toggleFavorite } = useRecipes();
  const { settings, theme } = useSettings();
  const contentWidth = Math.min(width - 40, 460);
  const cardWidth = (contentWidth - 12) / 2;
  const collectionCardWidth = Math.min(Math.max(contentWidth * 0.76, 250), 320);
  const isSignedIn = Boolean(user);
  const savedRecipes = recipes.filter((recipe) => recipe.saved);
  const copy = getUiCopy(settings.language);
  const topCuisine =
    Object.entries(tasteProfile.cuisines).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'Still learning';
  const topTag = Object.entries(tasteProfile.tags).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'Exploration';
  const topCategory =
    Object.entries(tasteProfile.categories).sort((left, right) => right[1] - left[1])[0]?.[0] ?? 'Finding your groove';

  return (
    <ResponsiveScrollScreen backgroundColor={theme.tabBarBackground} bottomInsetBehavior="tab-bar" contentStyle={styles.screenPadding}>
      <Text style={styles.title}>{copy.savedRecipes}</Text>
      <Text style={styles.subtitle}>Your personal board of dishes worth coming back to.</Text>

      <View style={styles.topActions}>
        <View style={styles.topActionRow}>
          <View style={[styles.statsCard, { backgroundColor: theme.accent }]}>
            <Text style={styles.statsNumber}>{savedCount}</Text>
            <Text style={styles.statsLabel}>{copy.savedForLater}</Text>
          </View>
          {savedRecipes.length > 0 ? (
            <Pressable
              style={[styles.clearButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() =>
                Alert.alert('Clear saved recipes?', 'This will remove every recipe from your saved board.', [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Clear all',
                    style: 'destructive',
                    onPress: () => clearSavedRecipes(),
                  },
                ])
              }>
              <Text style={[styles.clearButtonEyebrow, { color: theme.accent }]}>Manage</Text>
              <Text style={styles.clearButtonTitle}>Clear saved</Text>
            </Pressable>
          ) : null}
        </View>
        <View style={styles.miniButtonsRow}>
          <Pressable style={[styles.miniButton, { backgroundColor: theme.heroBackground }]} onPress={() => router.push('/(tabs)/discover')}>
            <Text style={styles.miniButtonText}>{copy.browseAll}</Text>
          </Pressable>
          <Pressable
            style={[styles.miniButton, styles.miniButtonLight, { backgroundColor: theme.accentSoft }]}
            onPress={() => openProtectedRoute(isSignedIn, PROTECTED_AUTH_ROUTES.addRecipe)}>
            <Text style={[styles.miniButtonTextDark, { color: theme.accent }]}>{copy.addRecipe}</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.profileCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={[styles.profileTitle, { color: theme.accent }]}>Taste Profile</Text>
        <Text style={styles.profileCopy}>Top cuisine: {topCuisine}</Text>
        <Text style={styles.profileCopy}>Top mood: {topTag}</Text>
        <Text style={styles.profileCopy}>Top category: {topCategory}</Text>
        <Text style={styles.profileHint}>This profile updates from saves, searches, and recipe views.</Text>
      </View>

      {smartCollections.length > 0 ? (
        <View style={styles.collectionsSection}>
          <View style={styles.collectionsHeader}>
            <Text style={styles.collectionsTitle}>Smart collections</Text>
            <Text style={styles.collectionsCount}>{smartCollections.length} ready</Text>
          </View>
          <Text style={styles.collectionsSubtitle}>Auto-grouped from your saved habits and recipe patterns.</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.collectionsRail}>
            {smartCollections.map((collection) => (
              <Pressable
                key={collection.id}
                style={[
                  styles.collectionCard,
                  {
                    width: collectionCardWidth,
                    backgroundColor: theme.cardBackground,
                    borderColor: theme.border,
                  },
                ]}
                onPress={() =>
                  router.push({
                    pathname: '/collection/[id]',
                    params: { id: collection.id },
                  })
                }>
                <Text style={[styles.collectionName, { color: theme.accent }]}>{collection.title}</Text>
                <Text style={styles.collectionCopy} numberOfLines={2}>{collection.subtitle}</Text>
                <View style={styles.collectionFooter}>
                  <Text style={styles.collectionMeta}>{collection.recipeIds.length} recipes</Text>
                  <Text style={[styles.collectionAction, { color: theme.accent }]}>Open</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {savedRecipes.length > 0 ? (
        <View style={styles.grid}>
          {savedRecipes.map((recipe, index) => {
            const isWide = index === 0;
            return (
              <Pressable
                key={recipe.id}
                style={[styles.card, isWide ? { width: contentWidth } : { width: cardWidth }]}
                onPress={() =>
                  router.push({
                    pathname: '/recipe/[id]',
                    params: { id: recipe.id },
                  })
                }>
                <Image
                  source={recipe.image}
                  style={[styles.image, isWide ? styles.imageWide : styles.imageHalf]}
                  contentFit="cover"
                />
                <View style={styles.cardFavorite}>
                  <FavoriteButton active={recipe.saved} onPress={() => toggleFavorite(recipe.id)} />
                </View>
                <View style={styles.overlay}>
                  <Text style={styles.cardTitle}>{recipe.title}</Text>
                  <Text style={styles.cardMeta}>
                    {recipe.cuisine} - {formatCookTime(recipe.cookTime, settings.language)}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      ) : (
        <View style={[styles.emptyState, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={styles.emptyTitle}>No saved recipes yet</Text>
          <Text style={styles.emptyCopy}>
            Save a few dishes from Discover or Search and they&apos;ll show up here with smarter collections.
          </Text>
          <Pressable style={[styles.emptyButton, { backgroundColor: theme.accent }]} onPress={() => router.push('/(tabs)/discover')}>
            <Text style={styles.emptyButtonText}>Browse recipes</Text>
          </Pressable>
        </View>
      )}
    </ResponsiveScrollScreen>
  );
}

const styles = StyleSheet.create({
  screenPadding: { paddingHorizontal: 20 },
  title: { color: '#23150F', fontSize: 30, fontWeight: '800' },
  subtitle: { marginTop: 8, color: '#6B5F58', fontSize: 15, lineHeight: 22 },
  topActions: { marginTop: 20, gap: 10 },
  topActionRow: { flexDirection: 'row', gap: 10 },
  miniButtonsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  profileCard: { marginTop: 18, borderRadius: 22, borderWidth: 1, padding: 16 },
  profileTitle: { fontSize: 16, fontWeight: '800' },
  profileCopy: { marginTop: 6, color: '#23150F', fontSize: 14, fontWeight: '700' },
  profileHint: { marginTop: 8, color: '#6B5F58', fontSize: 12, lineHeight: 18 },
  collectionsSection: { marginTop: 24 },
  collectionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  collectionsTitle: { color: '#23150F', fontSize: 22, fontWeight: '800' },
  collectionsCount: {
    color: '#7B6C63',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  collectionsSubtitle: { marginTop: 6, color: '#6B5F58', fontSize: 13, lineHeight: 19 },
  collectionsRail: { gap: 10, marginTop: 14, paddingRight: 8 },
  collectionCard: { borderRadius: 22, borderWidth: 1, padding: 16 },
  collectionName: { fontSize: 16, fontWeight: '800' },
  collectionCopy: { marginTop: 6, color: '#6B5F58', fontSize: 13, lineHeight: 18 },
  collectionFooter: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  collectionMeta: { color: '#23150F', fontSize: 12, fontWeight: '700' },
  collectionAction: { fontSize: 12, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.7 },
  statsCard: {
    flex: 1,
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#C7512D',
  },
  clearButton: {
    minWidth: 132,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    justifyContent: 'center',
  },
  clearButtonEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  clearButtonTitle: {
    marginTop: 6,
    color: '#23150F',
    fontSize: 16,
    fontWeight: '800',
  },
  statsNumber: { color: '#FFFFFF', fontSize: 34, fontWeight: '800' },
  statsLabel: { marginTop: 4, color: '#FFE2D4', fontSize: 14, fontWeight: '500' },
  miniButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#23150F',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  miniButtonLight: {
    backgroundColor: '#F8E6D8',
  },
  miniButtonText: { color: '#FFF8F2', fontSize: 13, fontWeight: '800' },
  miniButtonTextDark: { color: '#9E4E2C', fontSize: 13, fontWeight: '800' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14 },
  emptyState: {
    marginTop: 16,
    borderRadius: 26,
    borderWidth: 1,
    padding: 22,
    alignItems: 'flex-start',
  },
  emptyTitle: {
    color: '#23150F',
    fontSize: 22,
    fontWeight: '800',
  },
  emptyCopy: {
    marginTop: 8,
    color: '#6B5F58',
    fontSize: 14,
    lineHeight: 21,
  },
  emptyButton: {
    marginTop: 16,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  card: {
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#E5D2C3',
  },
  image: { width: '100%' },
  imageWide: { height: 210 },
  imageHalf: { height: 176 },
  cardFavorite: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    backgroundColor: 'rgba(35, 21, 15, 0.42)',
  },
  cardTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  cardMeta: { marginTop: 6, color: '#FFE7DB', fontSize: 14, fontWeight: '500' },
});
