import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { FavoriteButton } from '@/components/favorite-button';
import { useRecipes } from '@/components/recipes-provider';
import { useSettings } from '@/components/settings-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { formatCookTime, getUiCopy } from '@/utils/app-settings-display';

export default function SavedScreen() {
  const { width } = useWindowDimensions();
  const { recipes, savedCount, toggleFavorite } = useRecipes();
  const { settings, theme } = useSettings();
  const contentWidth = Math.min(width - 40, 460);
  const cardWidth = (contentWidth - 12) / 2;
  const savedRecipes = recipes.filter((recipe) => recipe.saved);
  const copy = getUiCopy(settings.language);

  return (
    <ResponsiveScrollScreen backgroundColor={theme.tabBarBackground} contentStyle={styles.screenPadding}>
      <Text style={styles.title}>{copy.savedRecipes}</Text>
      <Text style={styles.subtitle}>Your personal board of dishes worth coming back to.</Text>

      <View style={styles.topActions}>
        <View style={[styles.statsCard, { backgroundColor: theme.accent }]}>
          <Text style={styles.statsNumber}>{savedCount}</Text>
          <Text style={styles.statsLabel}>{copy.savedForLater}</Text>
        </View>
        <Pressable style={[styles.miniButton, { backgroundColor: theme.heroBackground }]} onPress={() => router.push('/(tabs)/discover')}>
          <Text style={styles.miniButtonText}>{copy.browseAll}</Text>
        </Pressable>
        <Pressable style={[styles.miniButton, styles.miniButtonLight, { backgroundColor: theme.accentSoft }]} onPress={() => router.push('/add-recipe')}>
          <Text style={[styles.miniButtonTextDark, { color: theme.accent }]}>{copy.addRecipe}</Text>
        </Pressable>
      </View>

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
    </ResponsiveScrollScreen>
  );
}

const styles = StyleSheet.create({
  screenPadding: { paddingHorizontal: 20 },
  title: { color: '#23150F', fontSize: 30, fontWeight: '800' },
  subtitle: { marginTop: 8, color: '#6B5F58', fontSize: 15, lineHeight: 22 },
  topActions: { marginTop: 20, gap: 10 },
  statsCard: {
    borderRadius: 24,
    padding: 20,
    backgroundColor: '#C7512D',
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
