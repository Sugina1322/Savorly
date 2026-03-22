import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { useAuth } from '@/components/auth-provider';
import { FavoriteButton } from '@/components/favorite-button';
import { useRecipes } from '@/components/recipes-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { type AppLanguage, useSettings } from '@/components/settings-provider';
import { formatCookTime, getUiCopy } from '@/utils/app-settings-display';
import { openProtectedRoute, PROTECTED_AUTH_ROUTES } from '@/utils/auth-gate';
import {
  DISCOVER_FILTERS,
  DISCOVER_SHELVES,
  type DiscoverFilterKey,
  getDiscoverCategoryByKey,
} from '@/utils/discover-categories';

function matchesCategory(category: DiscoverFilterKey, recipeCategories: string[]) {
  return category === 'all' ? true : recipeCategories.includes(category);
}

type DiscoverScreenCopy = {
  title: string;
  subtitle: string;
  browseByCategory: string;
  browseByCategoryCopy: string;
  startHere: string;
  selectedPicks: string;
  startHereCopy: string;
  selectedCopy: string;
  viewCategory: string;
  exploreMore: string;
  openSearch: string;
  classicBrowseCopy: string;
};

const DISCOVER_COPY: Record<AppLanguage, DiscoverScreenCopy> = {
  en: {
    title: 'Discover by craving, not just by scroll.',
    subtitle: 'Jump between mains, desserts, breakfast, and drinks so the board feels closer to how people actually browse.',
    browseByCategory: 'Browse by category',
    browseByCategoryCopy: 'Switch the board from everyday meals to desserts and drinks without leaving Discover.',
    startHere: 'Start here',
    selectedPicks: 'picks',
    startHereCopy: 'A broad mix of what is worth opening next.',
    selectedCopy: 'A tighter slice of the board based on the category you picked.',
    viewCategory: 'View category',
    exploreMore: 'Explore more',
    openSearch: 'Open search',
    classicBrowseCopy: 'A smaller grid if you still want the classic browse-all view.',
  },
  es: {
    title: 'Descubre por antojo, no solo por scroll.',
    subtitle: 'Salta entre platos fuertes, postres, desayunos y bebidas para navegar como la gente realmente decide.',
    browseByCategory: 'Explorar por categoria',
    browseByCategoryCopy: 'Cambia el tablero de comidas diarias a postres y bebidas sin salir de Discover.',
    startHere: 'Empieza aqui',
    selectedPicks: 'selecciones',
    startHereCopy: 'Una mezcla amplia de lo que vale la pena abrir ahora.',
    selectedCopy: 'Una parte mas enfocada segun la categoria que elegiste.',
    viewCategory: 'Ver categoria',
    exploreMore: 'Explorar mas',
    openSearch: 'Abrir busqueda',
    classicBrowseCopy: 'Una cuadricula mas pequena si aun quieres la vista clasica.',
  },
  fr: {
    title: 'Decouvrez selon l envie, pas seulement en faisant defiler.',
    subtitle: 'Passez des plats aux desserts, petits-dejeuners et boissons pour parcourir comme on choisit vraiment quoi manger.',
    browseByCategory: 'Parcourir par categorie',
    browseByCategoryCopy: 'Faites passer le tableau des plats du quotidien aux desserts et boissons sans quitter Discover.',
    startHere: 'Commencez ici',
    selectedPicks: 'selections',
    startHereCopy: 'Un melange large de ce qui vaut la peine d etre ouvert ensuite.',
    selectedCopy: 'Une selection plus serree selon la categorie choisie.',
    viewCategory: 'Voir la categorie',
    exploreMore: 'Explorer plus',
    openSearch: 'Ouvrir la recherche',
    classicBrowseCopy: 'Une grille plus petite si vous voulez encore la vue classique.',
  },
  fil: {
    title: 'Mag-discover ayon sa craving, hindi puro scroll.',
    subtitle: 'Lumipat sa pagitan ng mains, desserts, breakfast, at drinks para mas natural ang pag-browse.',
    browseByCategory: 'Browse by category',
    browseByCategoryCopy: 'Ilipat ang board mula everyday meals papuntang desserts at drinks nang hindi umaalis sa Discover.',
    startHere: 'Simulan dito',
    selectedPicks: 'picks',
    startHereCopy: 'Isang malawak na halo ng mga sulit buksan.',
    selectedCopy: 'Mas siksik na board base sa category na pinili mo.',
    viewCategory: 'Tingnan ang category',
    exploreMore: 'Mag-explore pa',
    openSearch: 'Buksan ang search',
    classicBrowseCopy: 'Mas maliit na grid kung gusto mo pa rin ang classic browse-all view.',
  },
  ko: {
    title: '그냥 스크롤하지 말고 먹고 싶은 기분으로 둘러보세요.',
    subtitle: '메인 요리, 디저트, 아침 메뉴, 음료를 오가며 더 자연스럽게 고를 수 있어요.',
    browseByCategory: '카테고리로 보기',
    browseByCategoryCopy: 'Discover를 벗어나지 않고 일상식, 디저트, 음료로 바로 전환하세요.',
    startHere: '여기서 시작',
    selectedPicks: '추천',
    startHereCopy: '지금 열어보기 좋은 레시피를 넓게 모아뒀어요.',
    selectedCopy: '선택한 카테고리에 맞춰 더 좁혀진 보드예요.',
    viewCategory: '카테고리 보기',
    exploreMore: '더 둘러보기',
    openSearch: '검색 열기',
    classicBrowseCopy: '클래식한 전체 보기가 필요하면 작은 그리드로 볼 수 있어요.',
  },
  ja: {
    title: 'ただスクロールするのではなく、食べたい気分で探しましょう。',
    subtitle: '主食、デザート、朝食、ドリンクを行き来しながら、もっと自然に選べます。',
    browseByCategory: 'カテゴリで見る',
    browseByCategoryCopy: 'Discoverを離れずに日常ごはん、デザート、ドリンクへ切り替えられます。',
    startHere: 'まずはこちら',
    selectedPicks: 'おすすめ',
    startHereCopy: '次に開く価値のあるレシピを広く集めています。',
    selectedCopy: '選んだカテゴリに合わせて絞り込んだボードです。',
    viewCategory: 'カテゴリを見る',
    exploreMore: 'さらに見る',
    openSearch: '検索を開く',
    classicBrowseCopy: '従来の一覧感が欲しい場合は小さめのグリッドでも見られます。',
  },
};

export default function DiscoverScreen() {
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  const { featuredPick, recipes, toggleFavorite } = useRecipes();
  const { settings, theme } = useSettings();
  const copy = getUiCopy(settings.language);
  const screenCopy = DISCOVER_COPY[settings.language];
  const isSignedIn = Boolean(user);
  const featuredRecipe = featuredPick?.recipe ?? recipes[0];
  const featuredReason = featuredPick?.reason ?? 'Picked from today\'s recipe rotation.';
  const [activeFilter, setActiveFilter] = useState<DiscoverFilterKey>('all');
  const contentWidth = Math.min(width - 36, 460);
  const railCardWidth = Math.min(Math.max(contentWidth * 0.72, 240), 300);
  const gridCardWidth = (contentWidth - 12) / 2;
  const dessertCount = recipes.filter((recipe) => recipe.categories.includes('Dessert')).length;
  const drinksCount = recipes.filter((recipe) => recipe.categories.includes('Drinks')).length;

  const filteredRecipes = useMemo(
    () => recipes.filter((recipe) => matchesCategory(activeFilter, recipe.categories)),
    [activeFilter, recipes]
  );

  const spotlightRecipes = filteredRecipes.filter((recipe) => recipe.id !== featuredRecipe.id).slice(0, 6);
  const shelves = DISCOVER_SHELVES.map((shelf) => ({
    ...shelf,
    recipes: recipes.filter((recipe) => recipe.categories.includes(shelf.key)).slice(0, 6),
  })).filter((shelf) => shelf.recipes.length > 0);

  function openRecipe(id: string) {
    router.push({
      pathname: '/recipe/[id]',
      params: { id },
    });
  }

  function openCategoryPage(categoryKey: Exclude<DiscoverFilterKey, 'all'>) {
    const category = getDiscoverCategoryByKey(categoryKey);

    if (!category) {
      return;
    }

    router.push({
      pathname: '/category/[slug]',
      params: { slug: category.slug },
    });
  }

  return (
    <ResponsiveScrollScreen backgroundColor={theme.tabBarBackground} bottomInsetBehavior="tab-bar">
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: theme.accent }]}>{copy.appName}</Text>
        <Text style={styles.title}>{screenCopy.title}</Text>
        <Text style={styles.subtitle}>{screenCopy.subtitle}</Text>

        <View style={styles.headerActions}>
          <Pressable
            style={[styles.headerButton, styles.headerButtonPrimary, { backgroundColor: theme.heroBackground }]}
            onPress={() => openRecipe(featuredRecipe.id)}>
            <Text style={styles.headerButtonPrimaryText}>{copy.featured}</Text>
          </Pressable>
          <Pressable
            style={[styles.headerButton, styles.headerButtonSecondary, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
            onPress={() => openProtectedRoute(isSignedIn, PROTECTED_AUTH_ROUTES.addRecipe)}>
            <Text style={styles.headerButtonSecondaryText}>{copy.addRecipe}</Text>
          </Pressable>
        </View>
      </View>

      <Pressable style={styles.featuredCard} onPress={() => openRecipe(featuredRecipe.id)}>
        <Image source={featuredRecipe.image} style={styles.featuredImage} contentFit="cover" />
        <View style={styles.favoriteWrap}>
          <FavoriteButton active={featuredRecipe.saved} onPress={() => toggleFavorite(featuredRecipe.id)} />
        </View>
        <View style={styles.featuredOverlay}>
          <Text style={[styles.featuredLabel, { color: theme.heroAccent }]}>{copy.featuredPick}</Text>
          <Text style={styles.featuredTitle}>{featuredRecipe.title}</Text>
          <Text style={styles.featuredMeta}>
            {formatCookTime(featuredRecipe.cookTime, settings.language)} - {featuredRecipe.cuisine}
          </Text>
          <Text style={styles.featuredReason}>{featuredReason}</Text>
        </View>
      </Pressable>

      <View style={[styles.categoryCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.categoryHeader}>
          <View>
            <Text style={styles.categoryTitle}>{screenCopy.browseByCategory}</Text>
            <Text style={styles.categoryCopy}>{screenCopy.browseByCategoryCopy}</Text>
          </View>
          <View style={styles.categoryStats}>
            <View style={[styles.statChip, { backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.statChipText, { color: theme.accent }]}>{dessertCount} desserts</Text>
            </View>
            <View style={[styles.statChip, { backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.statChipText, { color: theme.accent }]}>{drinksCount} drinks</Text>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {DISCOVER_FILTERS.map((filter) => {
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

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {activeFilter === 'all'
              ? screenCopy.startHere
              : `${DISCOVER_FILTERS.find((filter) => filter.key === activeFilter)?.label ?? 'Selected'} ${screenCopy.selectedPicks}`}
          </Text>
          <Text style={[styles.sectionCaption, { color: theme.accent }]}>{spotlightRecipes.length} recipes</Text>
        </View>
        <Text style={styles.sectionCopy}>
          {activeFilter === 'all'
            ? screenCopy.startHereCopy
            : screenCopy.selectedCopy}
        </Text>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.railRow}>
          {spotlightRecipes.map((recipe) => (
            <Pressable
              key={recipe.id}
              style={[styles.railCard, { width: railCardWidth, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => openRecipe(recipe.id)}>
              <Image source={recipe.image} style={styles.railImage} contentFit="cover" />
              <View style={styles.railFavorite}>
                <FavoriteButton active={recipe.saved} onPress={() => toggleFavorite(recipe.id)} />
              </View>
              <View style={styles.railBody}>
                <Text style={styles.railTitle}>{recipe.title}</Text>
                <Text style={styles.railMeta}>
                  {recipe.cuisine} - {formatCookTime(recipe.cookTime, settings.language)}
                </Text>
                <Text style={styles.railDescription} numberOfLines={2}>
                  {recipe.description}
                </Text>
                <View style={styles.railChipRow}>
                  {recipe.categories.slice(0, 2).map((category) => (
                    <Text key={category} style={[styles.railChip, { backgroundColor: theme.accentSoft, color: theme.accent }]}>
                      {category}
                    </Text>
                  ))}
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {shelves.map((shelf) => (
        <View key={shelf.key} style={styles.section}>
          <View style={styles.shelfHeader}>
            <View style={styles.shelfHeaderBody}>
              <Text style={styles.shelfTitle}>{shelf.title}</Text>
              <Text style={styles.shelfCopy}>{shelf.subtitle}</Text>
            </View>
            <Pressable
              style={[styles.shelfActionButton, { backgroundColor: theme.accentSoft, borderColor: theme.border }]}
              onPress={() => openCategoryPage(shelf.key)}>
              <Text style={[styles.shelfActionText, { color: theme.accent }]}>{screenCopy.viewCategory}</Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.shelfRow}>
            {shelf.recipes.map((recipe) => (
              <Pressable
                key={recipe.id}
                style={[styles.shelfCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                onPress={() => openRecipe(recipe.id)}>
                <Image source={recipe.image} style={styles.shelfImage} contentFit="cover" />
                <View style={styles.shelfFavorite}>
                  <FavoriteButton active={recipe.saved} onPress={() => toggleFavorite(recipe.id)} />
                </View>
                <View style={styles.shelfBody}>
                  <Text style={styles.shelfCardTitle}>{recipe.title}</Text>
                  <Text style={styles.shelfMeta}>{formatCookTime(recipe.cookTime, settings.language)}</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      ))}

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{screenCopy.exploreMore}</Text>
          <Pressable onPress={() => router.push('/(tabs)/search')}>
            <Text style={[styles.sectionAction, { color: theme.accent }]}>{screenCopy.openSearch}</Text>
          </Pressable>
        </View>
        <Text style={styles.sectionCopy}>{screenCopy.classicBrowseCopy}</Text>

        <View style={styles.grid}>
          {filteredRecipes.slice(0, 4).map((recipe) => (
            <Pressable
              key={recipe.id}
              style={[styles.gridCard, { width: gridCardWidth, backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => openRecipe(recipe.id)}>
              <Image source={recipe.image} style={styles.gridImage} contentFit="cover" />
              <View style={styles.gridFavorite}>
                <FavoriteButton active={recipe.saved} onPress={() => toggleFavorite(recipe.id)} />
              </View>
              <View style={styles.gridBody}>
                <Text style={styles.gridTitle}>{recipe.title}</Text>
                <Text style={styles.gridMeta}>
                  {recipe.cuisine} - {formatCookTime(recipe.cookTime, settings.language)}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>
      </View>
    </ResponsiveScrollScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 18,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    color: '#23150F',
    fontSize: 34,
    lineHeight: 38,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 10,
    color: '#6B5F58',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 340,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  headerButton: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPrimary: {
    backgroundColor: '#23150F',
  },
  headerButtonSecondary: {
    backgroundColor: '#FFFDFC',
    borderWidth: 1,
    borderColor: '#F0DDD0',
  },
  headerButtonPrimaryText: {
    color: '#FFF8F2',
    fontSize: 13,
    fontWeight: '800',
  },
  headerButtonSecondaryText: {
    color: '#5A4337',
    fontSize: 13,
    fontWeight: '800',
  },
  featuredCard: {
    height: 230,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#E9D0BA',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
  },
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
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  featuredTitle: {
    marginTop: 6,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  featuredMeta: {
    marginTop: 4,
    color: '#F6E7DB',
    fontSize: 14,
    fontWeight: '500',
  },
  featuredReason: {
    marginTop: 8,
    color: '#FDEDE2',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600',
  },
  categoryCard: {
    marginTop: 18,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
  },
  categoryHeader: {
    gap: 12,
  },
  categoryTitle: {
    color: '#23150F',
    fontSize: 20,
    fontWeight: '800',
  },
  categoryCopy: {
    marginTop: 6,
    color: '#6B5F58',
    fontSize: 14,
    lineHeight: 20,
  },
  categoryStats: {
    flexDirection: 'row',
    gap: 8,
  },
  statChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  statChipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  filterRow: {
    gap: 10,
    marginTop: 14,
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
    marginTop: 26,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    flexShrink: 1,
    color: '#23150F',
    fontSize: 22,
    fontWeight: '800',
  },
  sectionCaption: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionAction: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionCopy: {
    marginTop: 6,
    color: '#6B5F58',
    fontSize: 14,
    lineHeight: 20,
  },
  railRow: {
    gap: 12,
    marginTop: 14,
    paddingRight: 8,
  },
  railCard: {
    borderRadius: 26,
    borderWidth: 1,
    overflow: 'hidden',
  },
  railImage: {
    width: '100%',
    height: 170,
  },
  railFavorite: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  railBody: {
    padding: 16,
  },
  railTitle: {
    color: '#23150F',
    fontSize: 18,
    fontWeight: '800',
  },
  railMeta: {
    marginTop: 5,
    color: '#A36B46',
    fontSize: 12,
    fontWeight: '700',
  },
  railDescription: {
    marginTop: 8,
    color: '#6B5F58',
    fontSize: 13,
    lineHeight: 18,
  },
  railChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  railChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
  },
  shelfHeader: {
    width: '100%',
  },
  shelfHeaderBody: {
    width: '100%',
  },
  shelfTitle: {
    color: '#23150F',
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '800',
  },
  shelfCopy: {
    marginTop: 6,
    color: '#6B5F58',
    fontSize: 14,
    lineHeight: 20,
  },
  shelfActionButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  shelfActionText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  shelfRow: {
    gap: 12,
    marginTop: 14,
    paddingRight: 8,
  },
  shelfCard: {
    width: 184,
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  shelfImage: {
    width: '100%',
    height: 132,
  },
  shelfFavorite: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  shelfBody: {
    padding: 14,
  },
  shelfCardTitle: {
    color: '#23150F',
    fontSize: 15,
    fontWeight: '800',
  },
  shelfMeta: {
    marginTop: 5,
    color: '#6B5F58',
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 14,
  },
  gridCard: {
    borderRadius: 24,
    borderWidth: 1,
    overflow: 'hidden',
  },
  gridImage: {
    width: '100%',
    height: 150,
  },
  gridFavorite: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  gridBody: {
    padding: 14,
  },
  gridTitle: {
    color: '#23150F',
    fontSize: 16,
    fontWeight: '800',
  },
  gridMeta: {
    marginTop: 5,
    color: '#6B5F58',
    fontSize: 12,
    fontWeight: '700',
  },
});
