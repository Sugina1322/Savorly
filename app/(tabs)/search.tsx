import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';

import { useAuth } from '@/components/auth-provider';
import { FavoriteButton } from '@/components/favorite-button';
import { useRecipes } from '@/components/recipes-provider';
import { type AppLanguage, useSettings } from '@/components/settings-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { formatCookTime, getUiCopy } from '@/utils/app-settings-display';
import { openProtectedRoute, PROTECTED_AUTH_ROUTES } from '@/utils/auth-gate';
import { matchRecipesByPantry } from '@/utils/recipe-intelligence';

const quickFilters = ['Restaurant-like', 'Everyday food', 'Easy recipes', 'High protein', 'Filipino favorites', 'Pantry-friendly'];
const exploreModes = [
  { key: 'all', label: 'All picks', icon: 'dashboard' as const, note: 'Taste-based browse' },
  { key: 'leftovers', label: 'Leftovers mode', icon: 'kitchen' as const, note: 'Cook from what is already there' },
  { key: 'budget', label: 'Budget meals', icon: 'savings' as const, note: 'Cheaper comfort and pantry wins' },
  { key: 'quick', label: 'Quick fixes', icon: 'bolt' as const, note: 'Fast answers for hungry days' },
] as const;

type ExploreMode = (typeof exploreModes)[number]['key'];

type SearchScreenCopy = {
  heroTitle: string;
  heroSubtitle: string;
  searchPlaceholder: string;
  matchingDishes: string;
  popularSearches: string;
  tapToAutofill: string;
  noCloseMatch: string;
  noCloseMatchCopy: string;
  recipesReady: string;
  searchStudio: string;
  browseByVibe: string;
  browseByVibeCopy: string;
  browseByVibeSupport: string;
  recipesReadyCount: (count: number) => string;
  browseByVibeHint: string;
  cookFromKitchen: string;
  cookFromKitchenCopy: string;
  pantryPlaceholder: string;
  have: string;
  need: string;
  noPantryMatch: string;
  noPantryMatchCopy: string;
  spotlightResult: string;
  kitchenMatches: string;
  searchBoard: string;
  moreToOpen: string;
  emptyResults: string;
  viewAllFoods: string;
};

const SEARCH_COPY: Record<AppLanguage, SearchScreenCopy> = {
  en: {
    heroTitle: 'Find dinner faster than your cravings can spiral.',
    heroSubtitle: 'Search by dish, jump into a mood, or let leftovers mode rescue whatever is already in your kitchen.',
    searchPlaceholder: 'Search dishes',
    matchingDishes: 'Matching dishes',
    popularSearches: 'Popular searches',
    tapToAutofill: 'Tap to autofill',
    noCloseMatch: 'No close match yet',
    noCloseMatchCopy: 'Try a simpler dish name or tap one of the suggestions above.',
    recipesReady: 'recipes ready',
    searchStudio: 'Search studio',
    browseByVibe: 'Browse by vibe',
    browseByVibeCopy: 'Tap a mood and let the board tighten up instantly.',
    browseByVibeSupport: 'Great for fast lunch and dinner decisions.',
    recipesReadyCount: (count) => `${count} recipes ready`,
    browseByVibeHint: 'Switch a vibe and the search board updates right away.',
    cookFromKitchen: 'Cook from your kitchen',
    cookFromKitchenCopy: 'Try `egg, tofu, onion, rice` or `chicken, garlic, soy sauce`.',
    pantryPlaceholder: 'What do you already have?',
    have: 'Have',
    need: 'Need',
    noPantryMatch: 'No strong pantry match yet',
    noPantryMatchCopy: 'Try shorter staples like rice, egg, garlic, onion, tofu, or canned tuna.',
    spotlightResult: 'Spotlight result',
    kitchenMatches: 'Kitchen matches',
    searchBoard: 'Search board',
    moreToOpen: 'More to open',
    emptyResults: 'Nothing landed yet',
    viewAllFoods: 'View all foods',
  },
  es: {
    heroTitle: 'Encuentra tu comida mas rapido que tu antojo.',
    heroSubtitle: 'Busca por plato, entra por mood o deja que leftovers mode rescate lo que ya tienes en la cocina.',
    searchPlaceholder: 'Buscar platos',
    matchingDishes: 'Platos coincidentes',
    popularSearches: 'Busquedas populares',
    tapToAutofill: 'Toca para completar',
    noCloseMatch: 'Aun no hay coincidencias cercanas',
    noCloseMatchCopy: 'Prueba un nombre mas simple o toca una sugerencia arriba.',
    recipesReady: 'recetas listas',
    searchStudio: 'Estudio de busqueda',
    browseByVibe: 'Explorar por mood',
    browseByVibeCopy: 'Toca un mood y el tablero se ajusta al instante.',
    browseByVibeSupport: 'Ideal para decidir rapido el almuerzo o la cena.',
    recipesReadyCount: (count) => `${count} recetas listas`,
    browseByVibeHint: 'Cambia el mood y el tablero se actualiza de inmediato.',
    cookFromKitchen: 'Cocina con lo que ya tienes',
    cookFromKitchenCopy: 'Prueba `huevo, tofu, cebolla, arroz` o `pollo, ajo, salsa de soya`.',
    pantryPlaceholder: 'Que tienes en casa?',
    have: 'Tienes',
    need: 'Falta',
    noPantryMatch: 'Aun no hay buena coincidencia',
    noPantryMatchCopy: 'Prueba con basicos como arroz, huevo, ajo, cebolla, tofu o atun.',
    spotlightResult: 'Resultado destacado',
    kitchenMatches: 'Coincidencias de cocina',
    searchBoard: 'Tablero de busqueda',
    moreToOpen: 'Mas para abrir',
    emptyResults: 'Aun no aparece nada',
    viewAllFoods: 'Ver toda la comida',
  },
  fr: {
    heroTitle: 'Trouvez un diner plus vite que vos envies ne s emballent.',
    heroSubtitle: 'Cherchez un plat, passez par une envie, ou laissez le mode restes sauver ce qu il y a deja dans votre cuisine.',
    searchPlaceholder: 'Chercher des plats',
    matchingDishes: 'Plats correspondants',
    popularSearches: 'Recherches populaires',
    tapToAutofill: 'Touchez pour remplir',
    noCloseMatch: 'Pas encore de correspondance proche',
    noCloseMatchCopy: 'Essayez un nom plus simple ou touchez une suggestion ci-dessus.',
    recipesReady: 'recettes pretes',
    searchStudio: 'Studio de recherche',
    browseByVibe: 'Parcourir par envie',
    browseByVibeCopy: 'Touchez une humeur et le tableau se resserre aussitot.',
    browseByVibeSupport: 'Pratique pour choisir vite le dejeuner ou le diner.',
    recipesReadyCount: (count) => `${count} recettes pretes`,
    browseByVibeHint: 'Changez d humeur et le tableau se met a jour tout de suite.',
    cookFromKitchen: 'Cuisinez depuis votre cuisine',
    cookFromKitchenCopy: 'Essayez `oeuf, tofu, oignon, riz` ou `poulet, ail, sauce soja`.',
    pantryPlaceholder: 'Qu avez-vous deja ?',
    have: 'Vous avez',
    need: 'Il faut',
    noPantryMatch: 'Pas encore de bon match',
    noPantryMatchCopy: 'Essayez des bases simples comme riz, oeuf, ail, oignon, tofu ou thon.',
    spotlightResult: 'Resultat vedette',
    kitchenMatches: 'Correspondances cuisine',
    searchBoard: 'Tableau de recherche',
    moreToOpen: 'Encore a ouvrir',
    emptyResults: 'Rien n a encore accroche',
    viewAllFoods: 'Voir tous les plats',
  },
  fil: {
    heroTitle: 'Hanapin ang kakainin bago pa lumala ang craving.',
    heroSubtitle: 'Maghanap ng dish, pumili ayon sa mood, o hayaan ang leftovers mode ang sumagip sa laman ng kusina.',
    searchPlaceholder: 'Maghanap ng dishes',
    matchingDishes: 'Mga tugmang dish',
    popularSearches: 'Mga sikat na search',
    tapToAutofill: 'I-tap para ilagay',
    noCloseMatch: 'Wala pang malapit na tugma',
    noCloseMatchCopy: 'Subukan ang mas simpleng pangalan ng dish o i-tap ang suggestion sa itaas.',
    recipesReady: 'recipes ready',
    searchStudio: 'Search studio',
    browseByVibe: 'Browse by vibe',
    browseByVibeCopy: 'Pumili ng vibe at sikip agad ang board.',
    browseByVibeSupport: 'Maganda ito para sa mabilisang lunch at dinner decisions.',
    recipesReadyCount: (count) => `${count} recipes ready`,
    browseByVibeHint: 'Kapag nagpalit ka ng vibe, a-update agad ang search board.',
    cookFromKitchen: 'Magluto mula sa kusina mo',
    cookFromKitchenCopy: 'Subukan ang `egg, tofu, onion, rice` o `chicken, garlic, soy sauce`.',
    pantryPlaceholder: 'Ano ang meron ka na?',
    have: 'Meron',
    need: 'Kailangan',
    noPantryMatch: 'Wala pang malakas na pantry match',
    noPantryMatchCopy: 'Subukan ang simpleng staples tulad ng rice, egg, garlic, onion, tofu, o canned tuna.',
    spotlightResult: 'Spotlight result',
    kitchenMatches: 'Kitchen matches',
    searchBoard: 'Search board',
    moreToOpen: 'Mas marami pang mabubuksan',
    emptyResults: 'Wala pang lumalabas',
    viewAllFoods: 'Tingnan lahat ng pagkain',
  },
  ko: {
    heroTitle: '배고픔이 커지기 전에 더 빨리 저녁을 찾아보세요.',
    heroSubtitle: '요리명으로 검색하거나 분위기로 고르거나, 남은 재료 모드로 지금 있는 재료를 살려보세요.',
    searchPlaceholder: '요리 검색',
    matchingDishes: '일치하는 요리',
    popularSearches: '인기 검색어',
    tapToAutofill: '탭해서 입력',
    noCloseMatch: '가까운 결과가 아직 없어요',
    noCloseMatchCopy: '더 간단한 이름으로 검색하거나 위 제안을 눌러 보세요.',
    recipesReady: '개의 레시피',
    searchStudio: '검색 스튜디오',
    browseByVibe: '분위기별 둘러보기',
    browseByVibeCopy: '무드를 누르면 보드가 바로 좁혀져요.',
    browseByVibeSupport: '빠르게 점심과 저녁을 고르기 좋아요.',
    recipesReadyCount: (count) => `${count}개 준비됨`,
    browseByVibeHint: '무드를 바꾸면 검색 보드가 바로 업데이트돼요.',
    cookFromKitchen: '지금 있는 재료로 요리하기',
    cookFromKitchenCopy: '`egg, tofu, onion, rice` 또는 `chicken, garlic, soy sauce`처럼 입력해 보세요.',
    pantryPlaceholder: '지금 있는 재료는?',
    have: '있는 것',
    need: '필요한 것',
    noPantryMatch: '아직 강한 재료 매치가 없어요',
    noPantryMatchCopy: 'rice, egg, garlic, onion, tofu, canned tuna 같은 기본 재료로 시도해 보세요.',
    spotlightResult: '추천 결과',
    kitchenMatches: '주방 매치',
    searchBoard: '검색 보드',
    moreToOpen: '더 둘러보기',
    emptyResults: '아직 맞는 결과가 없어요',
    viewAllFoods: '전체 음식 보기',
  },
  ja: {
    heroTitle: '迷う前にもっと早く夕食を見つけましょう。',
    heroSubtitle: '料理名で検索したり、気分で選んだり、残り物モードで今ある材料を活かせます。',
    searchPlaceholder: '料理を検索',
    matchingDishes: '一致した料理',
    popularSearches: '人気の検索',
    tapToAutofill: 'タップで入力',
    noCloseMatch: '近い一致がまだありません',
    noCloseMatchCopy: 'もっと簡単な料理名を試すか、上の候補をタップしてください。',
    recipesReady: '件のレシピ',
    searchStudio: '検索スタジオ',
    browseByVibe: '気分で探す',
    browseByVibeCopy: '気分を選ぶとボードがすぐ絞り込まれます。',
    browseByVibeSupport: '忙しい昼食や夕食選びに便利です。',
    recipesReadyCount: (count) => `${count}件表示`,
    browseByVibeHint: '気分を切り替えると検索ボードがすぐ更新されます。',
    cookFromKitchen: '今ある材料で作る',
    cookFromKitchenCopy: '`egg, tofu, onion, rice` や `chicken, garlic, soy sauce` を試してください。',
    pantryPlaceholder: '今ある材料は？',
    have: 'あるもの',
    need: '必要なもの',
    noPantryMatch: 'まだ強い一致がありません',
    noPantryMatchCopy: 'rice, egg, garlic, onion, tofu, canned tuna のような基本材料で試してください。',
    spotlightResult: '注目の結果',
    kitchenMatches: 'キッチン一致',
    searchBoard: '検索ボード',
    moreToOpen: 'さらに見る',
    emptyResults: 'まだ結果がありません',
    viewAllFoods: 'すべての料理を見る',
  },
};

export default function SearchScreen() {
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams();
  const { user } = useAuth();
  const { recipes, recordSearchQuery, searchRecipes, toggleFavorite } = useRecipes();
  const { settings, theme } = useSettings();
  const copy = getUiCopy(settings.language);
  const screenCopy = SEARCH_COPY[settings.language];
  const isSignedIn = Boolean(user);
  const contentWidth = Math.min(width - 40, 460);
  const isCompact = width < 390;
  const cardWidth = isCompact ? contentWidth : Math.floor((contentWidth - 18) / 2);
  const [query, setQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [pantryInput, setPantryInput] = useState('');
  const [activeMode, setActiveMode] = useState<ExploreMode>('all');
  const normalizedQuery = query.trim().toLowerCase();
  const rankedResults = searchRecipes(query);
  const pantryMatches = matchRecipesByPantry(recipes, pantryInput).slice(0, 8);
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

  const visibleResults = useMemo(() => {
    if (activeMode === 'leftovers') {
      return pantryMatches.map((result) => ({
        recipe: result.recipe,
        score: result.score,
        reason: result.reason,
      }));
    }

    return rankedResults.filter((result) => {
      if (activeMode === 'budget') {
        return result.recipe.tags.includes('Budget') || result.recipe.categories.includes('Pantry-friendly');
      }

      if (activeMode === 'quick') {
        return result.recipe.tags.includes('Quick') || result.recipe.categories.includes('Easy recipes') || result.recipe.cookTime <= 20;
      }

      return true;
    });
  }, [activeMode, pantryMatches, rankedResults]);
  const directQueryMatches = useMemo(() => {
    if (normalizedQuery.length === 0) {
      return [];
    }

    return recipes.filter((recipe) => {
      const searchableText = [
        recipe.title,
        recipe.cuisine,
        recipe.description,
        ...recipe.categories,
        ...recipe.tags,
        ...recipe.ingredients,
      ]
        .join(' ')
        .toLowerCase();

      return normalizedQuery.split(/\s+/).every((token) => searchableText.includes(token));
    });
  }, [normalizedQuery, recipes]);
  const alignedVisibleResults = useMemo(() => {
    if (!normalizedQuery || activeMode === 'leftovers') {
      return visibleResults;
    }

    const directMatchIds = new Set(directQueryMatches.map((recipe) => recipe.id));
    return visibleResults.filter((result) => directMatchIds.has(result.recipe.id));
  }, [activeMode, directQueryMatches, normalizedQuery, visibleResults]);

  const featuredResult = alignedVisibleResults[0]?.recipe ?? (!normalizedQuery ? recipes[0] : null);
  const spotlightCards = alignedVisibleResults.slice(0, 4);
  const immediateResults = (normalizedQuery ? directQueryMatches : alignedVisibleResults.map((result) => result.recipe)).slice(0, query.trim() ? 4 : 3);
  const searchSuggestions = useMemo(() => {
    if (normalizedQuery.length >= 2) {
      return recipes
        .filter((recipe) => {
          const haystack = `${recipe.title} ${recipe.cuisine} ${recipe.categories.join(' ')} ${recipe.tags.join(' ')}`.toLowerCase();
          return haystack.includes(normalizedQuery);
        })
        .slice(0, 6)
        .map((recipe) => recipe.title);
    }

    return [
      'Chicken Adobo Rice Bowl',
      'Oyakodon',
      'Egg Fried Rice',
      'Budget Chicken Adobo',
      'Tuna Mayo Onigiri',
      'Kimchi Fried Rice',
    ];
  }, [normalizedQuery, recipes]);
  const activeModeMeta = exploreModes.find((mode) => mode.key === activeMode) ?? exploreModes[0];
  const showSearchAssistant = isSearchFocused || normalizedQuery.length > 0;

  return (
    <ResponsiveScrollScreen backgroundColor={theme.tabBarBackground} bottomInsetBehavior="tab-bar" contentStyle={styles.screenPadding}>
      <View style={styles.heroShell}>
        <View style={[styles.heroPanel, { backgroundColor: theme.heroBackground }]}>
          <View style={[styles.heroOrbLarge, { backgroundColor: theme.heroAccent }]} />
          <View style={[styles.heroOrbSmall, { backgroundColor: theme.accent }]} />

          <Text style={[styles.heroEyebrow, { color: theme.heroAccent }]}>{copy.searchNextBite}</Text>
          <Text style={styles.heroTitle}>{screenCopy.heroTitle}</Text>
          <Text style={styles.heroSubtitle}>{screenCopy.heroSubtitle}</Text>

          <View style={[styles.searchInputShell, { backgroundColor: 'rgba(255, 248, 242, 0.12)', borderColor: 'rgba(255, 248, 242, 0.16)' }]}>
            <MaterialIcons name="search" size={20} color="#F7D5C2" />
            <TextInput
              value={query}
              onChangeText={setQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              placeholder={screenCopy.searchPlaceholder}
              placeholderTextColor="#DABAA9"
              style={styles.searchInput}
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery('')} hitSlop={8} style={styles.clearSearchButton}>
                <MaterialIcons name="close" size={16} color="#FFF8F2" />
              </Pressable>
            ) : null}
          </View>

          {showSearchAssistant ? (
            <View style={styles.searchAssistantCard}>
              <View style={styles.searchAssistantHeader}>
                <Text style={styles.searchAssistantTitle}>
                  {normalizedQuery ? screenCopy.matchingDishes : screenCopy.popularSearches}
                </Text>
                <Text style={styles.searchAssistantMeta}>
                  {normalizedQuery ? `${directQueryMatches.length} found` : screenCopy.tapToAutofill}
                </Text>
              </View>

              <View style={styles.suggestionWrap}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.suggestionRail}>
                  {searchSuggestions.map((suggestion) => (
                    <Pressable
                      key={suggestion}
                      style={styles.suggestionChip}
                      onPress={() => setQuery(suggestion)}>
                      <Text style={styles.suggestionChipText}>{suggestion}</Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              {immediateResults.length > 0 ? (
                <View style={styles.liveResultsSection}>
                  {immediateResults.map((recipe) => (
                    <Pressable
                      key={recipe.id}
                      style={styles.liveResultRow}
                      onPress={() =>
                        router.push({
                          pathname: '/recipe/[id]',
                          params: { id: recipe.id },
                        })
                      }>
                      <Image source={recipe.image} style={styles.liveResultImage} contentFit="cover" />
                      <View style={styles.liveResultBody}>
                        <Text style={styles.liveResultTitle} numberOfLines={1}>
                          {recipe.title}
                        </Text>
                        <Text style={styles.liveResultMeta} numberOfLines={1}>
                          {recipe.cuisine} - {formatCookTime(recipe.cookTime, settings.language)}
                        </Text>
                      </View>
                      <MaterialIcons name="north-east" size={18} color="#F3D9CB" />
                    </Pressable>
                  ))}
                </View>
              ) : normalizedQuery ? (
                <View style={styles.searchEmptyState}>
                  <Text style={styles.searchEmptyTitle}>{screenCopy.noCloseMatch}</Text>
                  <Text style={styles.searchEmptyCopy}>{screenCopy.noCloseMatchCopy}</Text>
                </View>
              ) : null}
            </View>
          ) : null}

          <View style={[styles.heroFootRow, isCompact && styles.heroFootRowCompact]}>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>{recipes.length}</Text>
              <Text style={styles.heroStatLabel}>{screenCopy.recipesReady}</Text>
            </View>
            <View style={styles.heroStat}>
              <Text style={styles.heroStatNumber}>{activeModeMeta.label}</Text>
              <Text style={styles.heroStatLabel}>{activeModeMeta.note}</Text>
            </View>
            <Pressable
              style={[styles.heroAction, { backgroundColor: '#FFF8F2' }]}
              onPress={() => openProtectedRoute(isSignedIn, PROTECTED_AUTH_ROUTES.addRecipe)}>
              <Text style={[styles.heroActionText, { color: theme.accent }]}>{copy.addRecipe}</Text>
            </Pressable>
          </View>
        </View>
      </View>

      <View style={styles.modesSection}>
        <Text style={styles.sectionEyebrow}>{screenCopy.searchStudio}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.modeRail}>
          {exploreModes.map((mode) => {
            const isActive = activeMode === mode.key;

            return (
              <Pressable
                key={mode.key}
                style={[
                  styles.modeCard,
                  {
                    backgroundColor: isActive ? theme.accentSoft : theme.cardBackground,
                    borderColor: isActive ? theme.accent : theme.border,
                  },
                ]}
                onPress={() => setActiveMode(mode.key)}>
                <View style={[styles.modeIconWrap, { backgroundColor: isActive ? theme.cardBackground : theme.appBackground }]}>
                  <MaterialIcons name={mode.icon} size={20} color={theme.accent} />
                </View>
                <Text style={[styles.modeTitle, { color: isActive ? theme.accent : '#23150F' }]}>{mode.label}</Text>
                <Text style={styles.modeNote}>{mode.note}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <View style={[styles.quickFilterShell, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.quickFilterHeader}>
          <View>
            <Text style={styles.quickFilterTitle}>{screenCopy.browseByVibe}</Text>
            <Text style={styles.quickFilterCopy}>{screenCopy.browseByVibeCopy}</Text>
          </View>
          <Text style={styles.quickFilterSupport}>{screenCopy.browseByVibeSupport}</Text>
        </View>
        <View style={[styles.quickFilterBadgeRow, isCompact && styles.quickFilterBadgeRowCompact]}>
          <View style={[styles.quickFilterBadge, { backgroundColor: theme.accentSoft }]}>
            <Text style={[styles.quickFilterBadgeText, { color: theme.accent }]}>{screenCopy.recipesReadyCount(alignedVisibleResults.length)}</Text>
          </View>
          <Text style={styles.quickFilterHint}>{screenCopy.browseByVibeHint}</Text>
        </View>
        <View style={styles.filterWrap}>
          {quickFilters.map((filter) => (
            <Pressable
              key={filter}
              style={[styles.filterChip, { backgroundColor: theme.appBackground, borderColor: theme.border }]}
              onPress={() => setQuery(filter)}>
              <Text style={[styles.filterText, { color: theme.accent }]}>{filter}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.pantryStage, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <View style={styles.pantryHeader}>
          <View style={[styles.pantryIcon, { backgroundColor: theme.accentSoft }]}>
            <MaterialIcons name="countertops" size={22} color={theme.accent} />
          </View>
          <View style={styles.pantryCopyWrap}>
            <Text style={styles.pantryTitle}>{screenCopy.cookFromKitchen}</Text>
            <Text style={styles.pantryCopy}>{screenCopy.cookFromKitchenCopy}</Text>
          </View>
        </View>

        <View style={[styles.pantryInputShell, { backgroundColor: theme.appBackground, borderColor: theme.border }]}>
          <MaterialIcons name="inventory-2" size={18} color={theme.accent} />
          <TextInput
            value={pantryInput}
            onChangeText={setPantryInput}
            placeholder={screenCopy.pantryPlaceholder}
            placeholderTextColor="#9A8D84"
            style={styles.pantryInput}
          />
        </View>

        {pantryMatches.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pantryRail}>
            {pantryMatches.slice(0, 4).map((result) => (
              <Pressable
                key={result.recipe.id}
                style={[styles.pantryMatchCard, { backgroundColor: theme.appBackground, borderColor: theme.border }]}
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
                <Text style={styles.pantryMatchMeta}>{screenCopy.have}: {result.matchedIngredients.slice(0, 3).join(', ')}</Text>
                <Text style={styles.pantryMatchMeta}>{screenCopy.need}: {result.missingIngredients.slice(0, 2).join(', ')}</Text>
              </Pressable>
            ))}
          </ScrollView>
        ) : pantryInput.trim().length > 0 ? (
          <View style={[styles.emptyPantryState, { backgroundColor: theme.appBackground, borderColor: theme.border }]}>
            <Text style={styles.emptyPantryTitle}>{screenCopy.noPantryMatch}</Text>
            <Text style={styles.emptyPantryCopy}>{screenCopy.noPantryMatchCopy}</Text>
          </View>
        ) : null}
      </View>

      {featuredResult ? (
        <Pressable
          style={[styles.spotlightCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          onPress={() =>
            router.push({
              pathname: '/recipe/[id]',
              params: { id: featuredResult.id },
            })
          }>
          <Image source={featuredResult.image} style={styles.spotlightImage} contentFit="cover" />
          <View style={styles.spotlightOverlay}>
            <Text style={[styles.spotlightEyebrow, { color: theme.heroAccent }]}>{screenCopy.spotlightResult}</Text>
            <Text style={styles.spotlightTitle}>{featuredResult.title}</Text>
            <Text style={styles.spotlightMeta}>
              {featuredResult.cuisine} - {formatCookTime(featuredResult.cookTime, settings.language)}
            </Text>
          </View>
        </Pressable>
      ) : null}

      <View style={styles.resultsHeader}>
        <View style={styles.resultsHeaderTop}>
          <Text style={styles.resultsTitle}>
            {activeMode === 'leftovers' ? screenCopy.kitchenMatches : screenCopy.searchBoard}
          </Text>
          <Pressable
            style={[styles.resultsActionButton, { backgroundColor: theme.accentSoft, borderColor: theme.border }]}
            onPress={() => {
              setQuery('');
              setPantryInput('');
              setActiveMode('all');
            }}>
            <Text style={[styles.resultsActionText, { color: theme.accent }]}>{screenCopy.viewAllFoods}</Text>
          </Pressable>
        </View>
        <Text style={styles.resultsCopy}>
          {activeMode === 'leftovers'
            ? pantryInput.trim()
              ? 'Recipes ranked from what is already in your kitchen.'
              : 'Type ingredients above to let leftovers mode do its thing.'
            : normalizedQuery
              ? 'Results are scored by title, ingredients, categories, and your taste profile.'
              : activeMode === 'budget'
                ? 'Cheaper-feeling recipes with pantry-friendly bias.'
                : activeMode === 'quick'
                  ? 'Short-cook recipes and low-friction picks.'
                  : 'Browse the board and open whatever feels right.'}
        </Text>
      </View>

      <View style={styles.grid}>
        {spotlightCards.map((result, index) => {
          const recipe = result.recipe;
          const tallCard = index % 3 === 0;

          return (
            <Pressable
              key={recipe.id}
              style={[
                styles.resultCard,
                {
                  width: cardWidth,
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}
              onPress={() =>
                router.push({
                  pathname: '/recipe/[id]',
                  params: { id: recipe.id },
                })
              }>
              <Image source={recipe.image} style={[styles.resultImage, tallCard && styles.resultImageTall]} contentFit="cover" />
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
          );
        })}
      </View>

      {alignedVisibleResults.length > 4 ? (
        <View style={[styles.moreResultsShell, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={styles.moreResultsTitle}>{screenCopy.moreToOpen}</Text>
          <View style={styles.moreResultsList}>
            {alignedVisibleResults.slice(4, 8).map((result) => (
              <Pressable
                key={result.recipe.id}
                style={[styles.moreResultRow, { borderColor: theme.border }]}
                onPress={() =>
                  router.push({
                    pathname: '/recipe/[id]',
                    params: { id: result.recipe.id },
                  })
                }>
                <View style={styles.moreResultCopy}>
                  <Text style={styles.moreResultTitle}>{result.recipe.title}</Text>
                  <Text style={styles.moreResultMeta}>{result.reason}</Text>
                </View>
                <Text style={[styles.moreResultTime, { color: theme.accent }]}>
                  {formatCookTime(result.recipe.cookTime, settings.language)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {alignedVisibleResults.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <MaterialIcons name="travel-explore" size={26} color={theme.accent} />
          <Text style={styles.emptyTitle}>
            {activeMode === 'leftovers' ? screenCopy.noPantryMatch : screenCopy.emptyResults}
          </Text>
          <Text style={styles.emptyCopy}>
            {activeMode === 'leftovers'
              ? 'Try simpler pantry words like rice, egg, garlic, onion, tofu, sardines, or chicken.'
              : 'Try a broader search, a different browse vibe, or switch to budget or quick mode.'}
          </Text>
        </View>
      ) : null}
    </ResponsiveScrollScreen>
  );
}

const styles = StyleSheet.create({
  screenPadding: {
    paddingHorizontal: 20,
  },
  heroShell: {
    paddingTop: 2,
  },
  heroPanel: {
    borderRadius: 32,
    padding: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  heroOrbLarge: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    right: -36,
    top: -30,
    opacity: 0.14,
  },
  heroOrbSmall: {
    position: 'absolute',
    width: 104,
    height: 104,
    borderRadius: 52,
    left: -24,
    bottom: -20,
    opacity: 0.12,
  },
  heroEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  heroTitle: {
    marginTop: 10,
    color: '#FFF8F2',
    fontSize: 31,
    lineHeight: 35,
    fontWeight: '900',
    maxWidth: 320,
  },
  heroSubtitle: {
    marginTop: 10,
    color: '#E7D3C7',
    fontSize: 14,
    lineHeight: 21,
    maxWidth: 340,
  },
  searchInputShell: {
    marginTop: 18,
    borderWidth: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFF8F2',
    fontSize: 15,
    lineHeight: 20,
    minHeight: 22,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  suggestionWrap: {
    marginTop: 12,
  },
  suggestionRail: {
    gap: 10,
    paddingRight: 8,
  },
  clearSearchButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 248, 242, 0.12)',
  },
  searchAssistantCard: {
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: 'rgba(42, 24, 15, 0.38)',
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 242, 0.12)',
    padding: 14,
    gap: 12,
  },
  searchAssistantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  searchAssistantTitle: {
    color: '#FFF8F2',
    fontSize: 14,
    fontWeight: '800',
  },
  searchAssistantMeta: {
    color: '#E7D3C7',
    fontSize: 11,
    fontWeight: '700',
  },
  suggestionChip: {
    borderRadius: 999,
    backgroundColor: 'rgba(255, 248, 242, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 242, 0.14)',
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  suggestionChipText: {
    color: '#FFF8F2',
    fontSize: 12,
    fontWeight: '700',
  },
  liveResultsSection: {
    gap: 10,
  },
  liveResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 248, 242, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 242, 0.12)',
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  liveResultImage: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#D8C2B3',
  },
  liveResultBody: {
    flex: 1,
  },
  liveResultTitle: {
    color: '#FFF8F2',
    fontSize: 13,
    fontWeight: '800',
  },
  liveResultMeta: {
    marginTop: 4,
    color: '#E7D3C7',
    fontSize: 11,
    fontWeight: '600',
  },
  searchEmptyState: {
    borderRadius: 18,
    backgroundColor: 'rgba(255, 248, 242, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 248, 242, 0.1)',
    padding: 12,
  },
  searchEmptyTitle: {
    color: '#FFF8F2',
    fontSize: 13,
    fontWeight: '800',
  },
  searchEmptyCopy: {
    marginTop: 4,
    color: '#E7D3C7',
    fontSize: 12,
    lineHeight: 17,
  },
  heroFootRow: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 10,
  },
  heroFootRowCompact: {
    flexDirection: 'column',
  },
  heroStat: {
    flex: 1,
    minHeight: 74,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 248, 242, 0.1)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  heroStatNumber: {
    color: '#FFF8F2',
    fontSize: 16,
    fontWeight: '800',
  },
  heroStatLabel: {
    marginTop: 5,
    color: '#E7D3C7',
    fontSize: 12,
    lineHeight: 17,
  },
  heroAction: {
    minWidth: 112,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroActionText: {
    fontSize: 13,
    fontWeight: '800',
  },
  modesSection: {
    marginTop: 22,
  },
  sectionEyebrow: {
    color: '#7B6D65',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modeRail: {
    gap: 12,
    marginTop: 12,
    paddingRight: 8,
  },
  modeCard: {
    width: 176,
    borderWidth: 1,
    borderRadius: 24,
    padding: 14,
  },
  modeIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTitle: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '800',
  },
  modeNote: {
    marginTop: 6,
    color: '#6B5F58',
    fontSize: 12,
    lineHeight: 18,
  },
  quickFilterShell: {
    marginTop: 18,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
  },
  quickFilterHeader: {
    gap: 8,
  },
  quickFilterTitle: {
    color: '#23150F',
    fontSize: 20,
    fontWeight: '800',
  },
  quickFilterCopy: {
    marginTop: 6,
    color: '#6B5F58',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 250,
  },
  quickFilterBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickFilterBadgeRow: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  quickFilterBadgeRowCompact: {
    alignItems: 'flex-start',
  },
  quickFilterBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  quickFilterSupport: {
    color: '#8A7C74',
    fontSize: 12,
    lineHeight: 17,
  },
  quickFilterHint: {
    flex: 1,
    minWidth: 180,
    color: '#6B5F58',
    fontSize: 12,
    lineHeight: 17,
  },
  filterWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  filterChip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '700',
  },
  pantryStage: {
    marginTop: 18,
    borderRadius: 30,
    borderWidth: 1,
    padding: 18,
  },
  pantryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  pantryIcon: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pantryCopyWrap: {
    flex: 1,
  },
  pantryTitle: {
    color: '#23150F',
    fontSize: 20,
    fontWeight: '800',
  },
  pantryCopy: {
    marginTop: 6,
    color: '#6B5F58',
    fontSize: 13,
    lineHeight: 19,
  },
  pantryInputShell: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  pantryInput: {
    flex: 1,
    color: '#23150F',
    fontSize: 15,
    lineHeight: 20,
    minHeight: 22,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  pantryRail: {
    gap: 12,
    marginTop: 16,
    paddingRight: 8,
  },
  pantryMatchCard: {
    width: 250,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
  },
  pantryMatchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  pantryMatchTitle: {
    flex: 1,
    color: '#23150F',
    fontSize: 15,
    fontWeight: '800',
  },
  pantryMatchTime: {
    fontSize: 12,
    fontWeight: '800',
  },
  pantryMatchReason: {
    marginTop: 7,
    color: '#5E4C43',
    fontSize: 13,
    fontWeight: '700',
  },
  pantryMatchMeta: {
    marginTop: 5,
    color: '#7B6D65',
    fontSize: 12,
    lineHeight: 17,
  },
  emptyPantryState: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 20,
    padding: 14,
  },
  emptyPantryTitle: {
    color: '#23150F',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyPantryCopy: {
    marginTop: 6,
    color: '#72655C',
    fontSize: 12,
    lineHeight: 18,
  },
  spotlightCard: {
    marginTop: 20,
    height: 198,
    borderRadius: 28,
    borderWidth: 1,
    overflow: 'hidden',
  },
  spotlightImage: {
    width: '100%',
    height: '100%',
  },
  spotlightOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    backgroundColor: 'rgba(29, 18, 12, 0.46)',
  },
  spotlightEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  spotlightTitle: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  spotlightMeta: {
    marginTop: 6,
    color: '#F4E4D8',
    fontSize: 13,
    fontWeight: '600',
  },
  resultsHeader: {
    marginTop: 24,
    marginBottom: 14,
  },
  resultsHeaderTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  resultsTitle: {
    flex: 1,
    color: '#23150F',
    fontSize: 22,
    fontWeight: '800',
  },
  resultsActionButton: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  resultsActionText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultsCopy: {
    marginTop: 6,
    color: '#7B6D65',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 320,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  resultCard: {
    borderRadius: 26,
    borderWidth: 1,
    overflow: 'hidden',
  },
  resultImage: {
    width: '100%',
    height: 138,
  },
  resultImageTall: {
    height: 176,
  },
  cardFavorite: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  resultBody: {
    padding: 14,
  },
  resultTitle: {
    color: '#23150F',
    fontSize: 16,
    fontWeight: '800',
  },
  resultMeta: {
    marginTop: 5,
    color: '#A36B46',
    fontSize: 12,
    fontWeight: '700',
  },
  matchReason: {
    marginTop: 7,
    fontSize: 12,
    fontWeight: '700',
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 9,
  },
  categoryChip: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 11,
    fontWeight: '700',
    overflow: 'hidden',
  },
  resultDescription: {
    marginTop: 9,
    color: '#72655C',
    fontSize: 13,
    lineHeight: 19,
  },
  moreResultsShell: {
    marginTop: 22,
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
  },
  moreResultsTitle: {
    color: '#23150F',
    fontSize: 18,
    fontWeight: '800',
  },
  moreResultsList: {
    marginTop: 10,
  },
  moreResultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  moreResultCopy: {
    flex: 1,
  },
  moreResultTitle: {
    color: '#23150F',
    fontSize: 15,
    fontWeight: '800',
  },
  moreResultMeta: {
    marginTop: 5,
    color: '#72655C',
    fontSize: 12,
    lineHeight: 17,
  },
  moreResultTime: {
    fontSize: 12,
    fontWeight: '800',
  },
  emptyCard: {
    marginTop: 20,
    borderWidth: 1,
    borderRadius: 26,
    padding: 20,
    alignItems: 'flex-start',
  },
  emptyTitle: {
    marginTop: 12,
    color: '#23150F',
    fontSize: 18,
    fontWeight: '800',
  },
  emptyCopy: {
    marginTop: 8,
    color: '#72655C',
    fontSize: 13,
    lineHeight: 19,
    maxWidth: 320,
  },
});
