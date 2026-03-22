import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FavoriteButton } from '@/components/favorite-button';
import { useRecipes } from '@/components/recipes-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { useSettings } from '@/components/settings-provider';
import { formatCookTime } from '@/utils/app-settings-display';

const catalogFilters = [
  { key: 'all', label: 'All' },
  { key: 'quick', label: 'Quick' },
  { key: 'budget', label: 'Budget' },
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'dessert', label: 'Dessert' },
  { key: 'drinks', label: 'Drinks' },
] as const;

type CatalogFilterKey = (typeof catalogFilters)[number]['key'];

export default function FoodsCatalogScreen() {
  const { recipes, toggleFavorite } = useRecipes();
  const { settings, theme } = useSettings();
  const [activeFilter, setActiveFilter] = useState<CatalogFilterKey>('all');

  const filteredRecipes = useMemo(() => {
    return recipes.filter((recipe) => {
      if (activeFilter === 'quick') {
        return recipe.cookTime <= 20 || recipe.tags.includes('Quick');
      }

      if (activeFilter === 'budget') {
        return recipe.tags.includes('Budget') || recipe.categories.includes('Pantry-friendly');
      }

      if (activeFilter === 'breakfast') {
        return recipe.categories.includes('Breakfast') || recipe.tags.includes('Breakfast');
      }

      if (activeFilter === 'dessert') {
        return recipe.categories.includes('Dessert') || recipe.tags.includes('Dessert');
      }

      if (activeFilter === 'drinks') {
        return recipe.categories.includes('Drinks') || recipe.tags.includes('Drink');
      }

      return true;
    });
  }, [activeFilter, recipes]);

  const featuredSlice = filteredRecipes.slice(0, 3);
  const listSlice = filteredRecipes.slice(3);

  return (
    <ResponsiveScrollScreen backgroundColor={theme.appBackground} contentStyle={styles.content}>
      <Pressable
        style={[styles.backButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={20} color="#251712" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={[styles.heroCard, { backgroundColor: theme.heroBackground }]}>
        <Text style={[styles.heroEyebrow, { color: theme.heroAccent }]}>Catalog</Text>
        <Text style={styles.heroTitle}>All available foods</Text>
        <Text style={styles.heroCopy}>
          A lighter catalog view so you can scan the full food library without feeling buried by giant cards.
        </Text>

        <View style={styles.heroStatsRow}>
          <View style={[styles.heroStat, { backgroundColor: 'rgba(255, 248, 242, 0.12)' }]}>
            <Text style={styles.heroStatNumber}>{recipes.length}</Text>
            <Text style={styles.heroStatLabel}>total foods</Text>
          </View>
          <View style={[styles.heroStat, { backgroundColor: 'rgba(255, 248, 242, 0.12)' }]}>
            <Text style={styles.heroStatNumber}>{filteredRecipes.length}</Text>
            <Text style={styles.heroStatLabel}>shown now</Text>
          </View>
        </View>
      </View>

      <View style={[styles.filterShell, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={styles.filterTitle}>Browse faster</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {catalogFilters.map((filter) => {
            const active = activeFilter === filter.key;

            return (
              <Pressable
                key={filter.key}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor: active ? theme.accentSoft : theme.appBackground,
                    borderColor: active ? theme.accent : theme.border,
                  },
                ]}
                onPress={() => setActiveFilter(filter.key)}>
                <Text style={[styles.filterChipText, { color: active ? theme.accent : '#5A4337' }]}>
                  {filter.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {featuredSlice.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Start with these</Text>
            <Text style={[styles.sectionMeta, { color: theme.accent }]}>{featuredSlice.length} picks</Text>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.featuredRow}>
            {featuredSlice.map((recipe) => (
              <Pressable
                key={recipe.id}
                style={[styles.featuredCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                onPress={() =>
                  router.push({
                    pathname: '/recipe/[id]',
                    params: { id: recipe.id },
                  })
                }>
                <Image source={recipe.image} style={styles.featuredImage} contentFit="cover" />
                <View style={styles.featuredFavorite}>
                  <FavoriteButton active={recipe.saved} onPress={() => toggleFavorite(recipe.id)} />
                </View>
                <View style={styles.featuredBody}>
                  <Text style={styles.featuredCardTitle} numberOfLines={2}>{recipe.title}</Text>
                  <Text style={styles.featuredMeta}>
                    {recipe.cuisine} - {formatCookTime(recipe.cookTime, settings.language)}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Full list</Text>
          <Text style={[styles.sectionMeta, { color: theme.accent }]}>{filteredRecipes.length} foods</Text>
        </View>

        <View style={[styles.listCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          {listSlice.map((recipe, index) => (
            <Pressable
              key={recipe.id}
              style={[styles.listRow, index > 0 && [styles.rowBorder, { borderTopColor: theme.border }]]}
              onPress={() =>
                router.push({
                  pathname: '/recipe/[id]',
                  params: { id: recipe.id },
                })
              }>
              <Image source={recipe.image} style={styles.listImage} contentFit="cover" />
              <View style={styles.listBody}>
                <Text style={styles.listTitle} numberOfLines={1}>{recipe.title}</Text>
                <Text style={styles.listMeta} numberOfLines={1}>
                  {recipe.cuisine} - {formatCookTime(recipe.cookTime, settings.language)}
                </Text>
                <View style={styles.listChipRow}>
                  {recipe.categories.slice(0, 2).map((category) => (
                    <Text
                      key={category}
                      style={[styles.listChip, { backgroundColor: theme.accentSoft, color: theme.accent }]}>
                      {category}
                    </Text>
                  ))}
                </View>
              </View>
              <View style={styles.rowRight}>
                <FavoriteButton active={recipe.saved} onPress={() => toggleFavorite(recipe.id)} />
              </View>
            </Pressable>
          ))}
        </View>
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
    borderRadius: 28,
    padding: 20,
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
    color: '#E6D7D1',
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 360,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  heroStat: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  heroStatNumber: {
    color: '#FFF8F2',
    fontSize: 18,
    fontWeight: '900',
  },
  heroStatLabel: {
    marginTop: 4,
    color: '#E6D7D1',
    fontSize: 12,
    fontWeight: '600',
  },
  filterShell: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
  },
  filterTitle: {
    color: '#23150F',
    fontSize: 18,
    fontWeight: '800',
  },
  filterRow: {
    gap: 10,
    marginTop: 12,
    paddingRight: 8,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  section: {
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: '#23150F',
    fontSize: 21,
    fontWeight: '800',
  },
  sectionMeta: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  featuredRow: {
    gap: 12,
    marginTop: 14,
    paddingRight: 8,
  },
  featuredCard: {
    width: 220,
    borderRadius: 22,
    borderWidth: 1,
    overflow: 'hidden',
  },
  featuredImage: {
    width: '100%',
    height: 130,
  },
  featuredFavorite: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  featuredBody: {
    padding: 14,
  },
  featuredCardTitle: {
    color: '#23150F',
    fontSize: 15,
    fontWeight: '800',
  },
  featuredMeta: {
    marginTop: 5,
    color: '#6B5F58',
    fontSize: 12,
    fontWeight: '700',
  },
  listCard: {
    marginTop: 14,
    borderWidth: 1,
    borderRadius: 24,
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  rowBorder: {
    borderTopWidth: 1,
  },
  listImage: {
    width: 68,
    height: 68,
    borderRadius: 16,
    backgroundColor: '#E7D0C0',
  },
  listBody: {
    flex: 1,
    minWidth: 0,
  },
  listTitle: {
    color: '#23150F',
    fontSize: 15,
    fontWeight: '800',
  },
  listMeta: {
    marginTop: 4,
    color: '#6B5F58',
    fontSize: 12,
    fontWeight: '700',
  },
  listChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  listChip: {
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '700',
    overflow: 'hidden',
  },
  rowRight: {
    alignSelf: 'flex-start',
  },
});
