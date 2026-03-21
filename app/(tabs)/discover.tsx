import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { FavoriteButton } from '@/components/favorite-button';
import { useRecipes } from '@/components/recipes-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';

export default function DiscoverScreen() {
  const { width } = useWindowDimensions();
  const { recipes, toggleFavorite } = useRecipes();
  const contentWidth = Math.min(width - 36, 460);
  const tileWidth = (contentWidth - 12) / 2;
  const featuredRecipes = recipes.filter((recipe) => recipe.featured);

  return (
    <ResponsiveScrollScreen backgroundColor="#FFF8F2">
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Savorly</Text>
        <Text style={styles.title}>Your food mood board.</Text>
        <Text style={styles.subtitle}>
          Find dishes you want to cook, save the ones you love, and open any card for ingredients and steps.
        </Text>

        <View style={styles.headerActions}>
          <Pressable style={[styles.headerButton, styles.headerButtonPrimary]}>
            <Text style={styles.headerButtonPrimaryText}>Featured</Text>
          </Pressable>
          <Pressable style={[styles.headerButton, styles.headerButtonSecondary]} onPress={() => router.push('/add-recipe')}>
            <Text style={styles.headerButtonSecondaryText}>Add recipe</Text>
          </Pressable>
        </View>

        <View style={styles.featuredCard}>
          <Image source={featuredRecipes[0].image} style={styles.featuredImage} contentFit="cover" />
          <View style={styles.favoriteWrap}>
            <FavoriteButton active={featuredRecipes[0].saved} onPress={() => toggleFavorite(featuredRecipes[0].id)} />
          </View>
          <View style={styles.featuredOverlay}>
            <Text style={styles.featuredLabel}>Featured pick</Text>
            <Text style={styles.featuredTitle}>{featuredRecipes[0].title}</Text>
            <Text style={styles.featuredMeta}>
              {featuredRecipes[0].cookTime} min - {featuredRecipes[0].cuisine}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.grid}>
        {recipes.map((item, index) => {
          const isTall = index % 3 === 0;
          return (
            <Pressable
              key={item.id}
              style={[styles.card, { width: tileWidth }, isTall && styles.cardTall]}
              onPress={() =>
                router.push({
                  pathname: '/recipe/[id]',
                  params: { id: item.id },
                })
              }>
              <Image source={item.image} style={[styles.cardImage, isTall && styles.cardImageTall]} contentFit="cover" />
              <View style={styles.cardFavorite}>
                <FavoriteButton active={item.saved} onPress={() => toggleFavorite(item.id)} />
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardDescription} numberOfLines={isTall ? 3 : 2}>
                  {item.description}
                </Text>
                <View style={styles.chipRow}>
                  <Text style={styles.chip}>{item.cuisine}</Text>
                  <Text style={styles.chip}>{item.cookTime} min</Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>
    </ResponsiveScrollScreen>
  );
}

const styles = StyleSheet.create({
  header: { paddingBottom: 22 },
  eyebrow: {
    color: '#C7512D',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: { marginTop: 8, color: '#23150F', fontSize: 34, lineHeight: 38, fontWeight: '800' },
  subtitle: { marginTop: 10, color: '#6B5F58', fontSize: 16, lineHeight: 24, maxWidth: 320 },
  headerActions: { flexDirection: 'row', gap: 8, marginTop: 18 },
  headerButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPrimary: { backgroundColor: '#23150F' },
  headerButtonSecondary: { backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#F0DDD0' },
  headerButtonPrimaryText: { color: '#FFF8F2', fontSize: 13, fontWeight: '800' },
  headerButtonSecondaryText: { color: '#5A4337', fontSize: 13, fontWeight: '800' },
  featuredCard: {
    marginTop: 18,
    height: 220,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#E9D0BA',
  },
  featuredImage: { width: '100%', height: '100%' },
  featuredOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: 'rgba(35, 21, 15, 0.45)',
  },
  favoriteWrap: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 1,
  },
  featuredLabel: {
    color: '#FFE9D7',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuredTitle: { marginTop: 6, color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  featuredMeta: { marginTop: 4, color: '#F6E7DB', fontSize: 14, fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0DED0',
  },
  cardTall: {
    transform: [{ translateY: 18 }],
    marginBottom: 18,
  },
  cardImage: { width: '100%', height: 148 },
  cardImageTall: { height: 188 },
  cardFavorite: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  cardBody: { padding: 14 },
  cardTitle: { color: '#23150F', fontSize: 17, fontWeight: '700' },
  cardDescription: { marginTop: 6, color: '#72655C', fontSize: 13, lineHeight: 18 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: '#F8E6D8',
    color: '#A45534',
    fontSize: 12,
    fontWeight: '600',
  },
});
