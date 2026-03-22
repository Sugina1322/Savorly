import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { FavoriteButton } from '@/components/favorite-button';
import { useRecipes } from '@/components/recipes-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { useSettings } from '@/components/settings-provider';
import { formatCookTime } from '@/utils/app-settings-display';

export default function CollectionDetailScreen() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { recipes, smartCollections, toggleFavorite } = useRecipes();
  const { settings, theme } = useSettings();
  const contentWidth = Math.min(width - 40, 460);
  const cardWidth = (contentWidth - 12) / 2;
  const collectionId =
    typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] ?? '' : '';
  const collection = smartCollections.find((item) => item.id === collectionId);
  const collectionRecipes =
    collection?.recipeIds
      .map((recipeId) => recipes.find((recipe) => recipe.id === recipeId))
      .filter((recipe): recipe is (typeof recipes)[number] => Boolean(recipe)) ?? [];
  const heroRecipe = collectionRecipes[0];

  if (!collection || !heroRecipe) {
    return (
      <ResponsiveScrollScreen backgroundColor={theme.appBackground} contentStyle={styles.content}>
        <Pressable
          style={[styles.backButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={20} color="#251712" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={[styles.emptyCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={styles.emptyTitle}>Collection not available</Text>
          <Text style={styles.emptyCopy}>
            Smart collections update as your saves and searches change, so this one may have refreshed away.
          </Text>
          <Pressable
            style={[styles.emptyButton, { backgroundColor: theme.accent }]}
            onPress={() => router.replace('/(tabs)/saved')}>
            <Text style={styles.emptyButtonText}>Back to saved recipes</Text>
          </Pressable>
        </View>
      </ResponsiveScrollScreen>
    );
  }

  return (
    <ResponsiveScrollScreen backgroundColor={theme.appBackground} contentStyle={styles.content}>
      <Pressable
        style={[styles.backButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={20} color="#251712" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <Pressable
        style={styles.heroCard}
        onPress={() =>
          router.push({
            pathname: '/recipe/[id]',
            params: { id: heroRecipe.id },
          })
        }>
        <Image source={heroRecipe.image} style={styles.heroImage} contentFit="cover" />
        <View style={styles.heroOverlay}>
          <Text style={[styles.heroEyebrow, { color: theme.heroAccent }]}>Smart collection</Text>
          <Text style={styles.heroTitle}>{collection.title}</Text>
          <Text style={styles.heroCopy}>{collection.subtitle}</Text>
        </View>
      </Pressable>

      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={styles.statNumber}>{collectionRecipes.length}</Text>
          <Text style={styles.statLabel}>Recipes inside</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={styles.statNumber}>{heroRecipe.cuisine}</Text>
          <Text style={styles.statLabel}>Leading vibe</Text>
        </View>
      </View>

      <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={[styles.infoEyebrow, { color: theme.accent }]}>Why this exists</Text>
        <Text style={styles.infoCopy}>
          Collections refresh automatically from what you save, search for, and keep opening, so the board keeps
          adapting as your habits change.
        </Text>
      </View>

      <View style={styles.grid}>
        {collectionRecipes.map((recipe, index) => {
          const isWide = index === 0;

          return (
            <Pressable
              key={recipe.id}
              style={[styles.recipeCard, isWide ? { width: contentWidth } : { width: cardWidth }]}
              onPress={() =>
                router.push({
                  pathname: '/recipe/[id]',
                  params: { id: recipe.id },
                })
              }>
              <Image
                source={recipe.image}
                style={[styles.recipeImage, isWide ? styles.recipeImageWide : styles.recipeImageHalf]}
                contentFit="cover"
              />
              <View style={styles.recipeFavorite}>
                <FavoriteButton active={recipe.saved} onPress={() => toggleFavorite(recipe.id)} />
              </View>
              <View style={styles.recipeOverlay}>
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <Text style={styles.recipeMeta}>
                  {recipe.cuisine} - {formatCookTime(recipe.cookTime, settings.language)}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ResponsiveScrollScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 36,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  backText: {
    color: '#251712',
    fontSize: 14,
    fontWeight: '700',
  },
  heroCard: {
    marginTop: 18,
    height: 240,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#D9C7BA',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 22,
    backgroundColor: 'rgba(25, 16, 12, 0.48)',
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroTitle: {
    marginTop: 8,
    color: '#FFF8F2',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
  },
  heroCopy: {
    marginTop: 8,
    color: '#F4E4DA',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 340,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  statNumber: {
    color: '#23150F',
    fontSize: 22,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 4,
    color: '#6D5D55',
    fontSize: 12,
    fontWeight: '700',
  },
  infoCard: {
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  infoEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  infoCopy: {
    marginTop: 8,
    color: '#5A4337',
    fontSize: 14,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
  },
  recipeCard: {
    borderRadius: 26,
    overflow: 'hidden',
    backgroundColor: '#E2D1C3',
  },
  recipeImage: {
    width: '100%',
  },
  recipeImageWide: {
    height: 208,
  },
  recipeImageHalf: {
    height: 178,
  },
  recipeFavorite: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  recipeOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    backgroundColor: 'rgba(35, 21, 15, 0.44)',
  },
  recipeTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  recipeMeta: {
    marginTop: 6,
    color: '#FFE7DB',
    fontSize: 13,
    fontWeight: '600',
  },
  emptyCard: {
    marginTop: 20,
    borderRadius: 28,
    borderWidth: 1,
    padding: 22,
  },
  emptyTitle: {
    color: '#23150F',
    fontSize: 24,
    fontWeight: '900',
  },
  emptyCopy: {
    marginTop: 10,
    color: '#6D5D55',
    fontSize: 14,
    lineHeight: 21,
  },
  emptyButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
