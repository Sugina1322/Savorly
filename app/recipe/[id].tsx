import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useEffect } from 'react';

import { FavoriteButton } from '@/components/favorite-button';
import { useRecipes } from '@/components/recipes-provider';
import { useSettings } from '@/components/settings-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { getUiCopy } from '@/utils/app-settings-display';

export default function RecipeDetailScreen() {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const { recipes, toggleFavorite, trackRecipeView } = useRecipes();
  const { settings, theme } = useSettings();
  const { id } = useLocalSearchParams<{ id: string }>();
  const recipe = recipes.find((item) => item.id === id);
  const copy = getUiCopy(settings.language);

  useEffect(() => {
    if (!id) {
      return;
    }

    trackRecipeView(id);
  }, [id, trackRecipeView]);

  if (!recipe) {
    return (
      <View style={[styles.missingSafeArea, { backgroundColor: theme.tabBarBackground }]}>
        <View style={styles.missingContainer}>
          <Text style={styles.missingTitle}>{copy.recipeNotFound}</Text>
          <Pressable style={[styles.backButton, { backgroundColor: theme.accent }]} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>{copy.goBack}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ResponsiveScrollScreen
      backgroundColor={theme.tabBarBackground}
      contentStyle={styles.screenContent}
      contentWrapStyle={styles.contentWrap}>
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

      <View style={[styles.metaRow, isCompact && styles.metaRowCompact]}>
        <View style={[styles.metaCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={styles.metaNumber}>{recipe.cookTime}</Text>
          <Text style={styles.metaLabel}>{copy.minutes}</Text>
        </View>
        <View style={[styles.metaCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={styles.metaNumber}>{recipe.servings}</Text>
          <Text style={styles.metaLabel}>{copy.servings}</Text>
        </View>
        <View style={[styles.metaCard, { backgroundColor: theme.cardBackground }]}>
          <Text style={styles.metaNumber}>{recipe.ingredients.length}</Text>
          <Text style={styles.metaLabel}>{copy.ingredients}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{copy.ingredients}</Text>
        {recipe.ingredients.map((ingredient) => (
          <View key={ingredient} style={styles.listItem}>
            <View style={[styles.listDot, { backgroundColor: theme.accent }]} />
            <Text style={styles.listText}>{ingredient}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{copy.howToMakeIt}</Text>
        {recipe.steps.map((step, index) => (
          <View key={step} style={styles.stepRow}>
            <View style={[styles.stepBadge, { backgroundColor: theme.accent }]}>
              <Text style={styles.stepBadgeText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.section, styles.tagsSection]}>
        <Text style={styles.sectionTitle}>{copy.tags}</Text>
        <View style={styles.tagRow}>
          {recipe.tags.map((tag) => (
            <Text key={tag} style={[styles.tagChip, { backgroundColor: theme.accentSoft, color: theme.accent }]}>
              {tag}
            </Text>
          ))}
        </View>
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
  hero: {
    height: 360,
    backgroundColor: '#E5D2C3',
    overflow: 'hidden',
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
    top: 52,
    left: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 248, 242, 0.96)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  floatingBackButtonCompact: {
    top: 20,
    left: 16,
  },
  favoriteButtonWrap: {
    position: 'absolute',
    top: 52,
    right: 20,
    zIndex: 1,
  },
  favoriteButtonWrapCompact: {
    top: 20,
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
  metaRow: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },
  metaRowCompact: {
    flexDirection: 'column',
  },
  metaCard: {
    flex: 1,
    borderRadius: 22,
    paddingVertical: 18,
    paddingHorizontal: 12,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  metaNumber: {
    color: '#23150F',
    fontSize: 24,
    fontWeight: '800',
  },
  metaLabel: {
    marginTop: 4,
    color: '#8A7A70',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    color: '#23150F',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 14,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    gap: 10,
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
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  stepBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C7512D',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  stepText: {
    flex: 1,
    color: '#52463F',
    fontSize: 15,
    lineHeight: 23,
  },
  tagsSection: {
    marginTop: 20,
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
  backButton: {
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
