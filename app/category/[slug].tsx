import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { FavoriteButton } from '@/components/favorite-button';
import { useRecipes } from '@/components/recipes-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { useSettings } from '@/components/settings-provider';
import { formatCookTime } from '@/utils/app-settings-display';
import { getDiscoverCategoryBySlug } from '@/utils/discover-categories';

export default function CategoryDetailScreen() {
  const { width } = useWindowDimensions();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { recipes, toggleFavorite } = useRecipes();
  const { settings, theme } = useSettings();
  const category = typeof slug === 'string' ? getDiscoverCategoryBySlug(slug) : null;
  const contentWidth = Math.min(width - 40, 460);
  const cardWidth = (contentWidth - 12) / 2;
  const categoryRecipes = category ? recipes.filter((recipe) => recipe.categories.includes(category.key)) : [];
  const heroRecipe = categoryRecipes[0];

  if (!category || categoryRecipes.length === 0 || !heroRecipe) {
    return (
      <ResponsiveScrollScreen backgroundColor={theme.appBackground} contentStyle={styles.content}>
        <Pressable
          style={[styles.backButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={20} color="#251712" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={[styles.emptyCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={styles.emptyTitle}>Category not available</Text>
          <Text style={styles.emptyCopy}>
            This category could not be loaded right now. Head back to Discover and try another section.
          </Text>
          <Pressable style={[styles.emptyButton, { backgroundColor: theme.accent }]} onPress={() => router.replace('/(tabs)/discover')}>
            <Text style={styles.emptyButtonText}>Back to Discover</Text>
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
          <Text style={[styles.heroEyebrow, { color: theme.heroAccent }]}>{category.label}</Text>
          <Text style={styles.heroTitle}>{category.pageTitle}</Text>
          <Text style={styles.heroCopy}>{category.pageSubtitle}</Text>
        </View>
      </Pressable>

      <View style={[styles.infoCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={styles.infoTitle}>{categoryRecipes.length} recipes in this category</Text>
        <Text style={styles.infoCopy}>
          Open any card to view ingredients and steps, or keep browsing this category as its own focused page.
        </Text>
      </View>

      <View style={styles.grid}>
        {categoryRecipes.map((recipe) => (
          <Pressable
            key={recipe.id}
            style={[styles.card, { width: cardWidth, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() =>
              router.push({
                pathname: '/recipe/[id]',
                params: { id: recipe.id },
              })
            }>
            <Image source={recipe.image} style={styles.cardImage} contentFit="cover" />
            <View style={styles.cardFavorite}>
              <FavoriteButton active={recipe.saved} onPress={() => toggleFavorite(recipe.id)} />
            </View>
            <View style={styles.cardBody}>
              <Text style={styles.cardTitle}>{recipe.title}</Text>
              <Text style={styles.cardMeta}>
                {recipe.cuisine} - {formatCookTime(recipe.cookTime, settings.language)}
              </Text>
              <Text style={styles.cardDescription} numberOfLines={3}>
                {recipe.description}
              </Text>
            </View>
          </Pressable>
        ))}
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
    height: 230,
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#DFCDBF',
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
    backgroundColor: 'rgba(24, 16, 11, 0.46)',
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
    color: '#E8D7CE',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 340,
  },
  infoCard: {
    marginTop: 18,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  infoTitle: {
    color: '#23150F',
    fontSize: 20,
    fontWeight: '800',
  },
  infoCopy: {
    marginTop: 8,
    color: '#6D5D55',
    fontSize: 14,
    lineHeight: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 18,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: 152,
  },
  cardFavorite: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  cardBody: {
    padding: 14,
  },
  cardTitle: {
    color: '#23150F',
    fontSize: 16,
    fontWeight: '800',
  },
  cardMeta: {
    marginTop: 5,
    color: '#A36B46',
    fontSize: 12,
    fontWeight: '700',
  },
  cardDescription: {
    marginTop: 8,
    color: '#6B5F58',
    fontSize: 13,
    lineHeight: 18,
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
