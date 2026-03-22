import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FavoriteButton } from '@/components/favorite-button';
import { useAuth } from '@/components/auth-provider';
import { MealSlot, useRecipes } from '@/components/recipes-provider';
import { useSettings } from '@/components/settings-provider';
import { SideMenu } from '@/components/side-menu';
import { formatCookTime, getUiCopy } from '@/utils/app-settings-display';
import { openProtectedRoute, PROTECTED_AUTH_ROUTES } from '@/utils/auth-gate';

const MEAL_SLOTS: MealSlot[] = ['breakfast', 'lunch', 'dinner'];

function formatMealSlotLabel(slot: MealSlot) {
  if (slot === 'breakfast') return "Today's breakfast";
  if (slot === 'lunch') return "Today's lunch";
  return "Tonight's dinner";
}

function formatMissingMealCopy(slot: MealSlot) {
  if (slot === 'breakfast') return "No meal planned for today's breakfast";
  if (slot === 'lunch') return "No meal planned for today's lunch";
  return "No meal planned for tonight's dinner";
}

function getCurrentMealSlot(date: Date): MealSlot {
  const hour = date.getHours();

  if (hour < 11) return 'breakfast';
  if (hour < 17) return 'lunch';
  return 'dinner';
}

function getDateKey(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

export default function LandingScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();
  const { featuredPick, mealPlans, recipes, smartCollections, smartSuggestions, toggleFavorite } = useRecipes();
  const { settings, theme } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const edgeSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: (_, gestureState) => gestureState.x0 <= 24,
        onMoveShouldSetPanResponder: (_, gestureState) =>
          gestureState.x0 <= 24 && gestureState.dx > 12 && Math.abs(gestureState.dy) < 20,
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx > 60) {
            setIsMenuOpen(true);
          }
        },
      }),
    []
  );

  const contentWidth = Math.min(width - 36, 460);
  const compact = width < 390;
  const cardWidth = (contentWidth - 12) / 2;
  const featuredRecipe = featuredPick?.recipe ?? recipes[0];
  const featuredReason = featuredPick?.reason ?? 'Daily rotation from the recipe board.';
  const previewRecipes = recipes.filter((recipe) => recipe.id !== featuredRecipe?.id).slice(0, 4);
  const fastestCookTime = recipes.reduce((fastest, recipe) => Math.min(fastest, recipe.cookTime), Number.POSITIVE_INFINITY);
  const quickStartFilters = ['Easy recipes', 'Everyday food', 'Budget', 'Dessert'];
  const today = useMemo(() => new Date(), []);
  const todayKey = useMemo(() => getDateKey(today), [today]);
  const tomorrowKey = useMemo(() => getDateKey(addDays(today, 1)), [today]);
  const todayMealCount = MEAL_SLOTS.filter((slot) => Boolean(mealPlans[todayKey]?.[slot])).length;
  const tomorrowMealCount = MEAL_SLOTS.filter((slot) => Boolean(mealPlans[tomorrowKey]?.[slot])).length;
  const plannerStatusCopy =
    todayMealCount > 0
      ? `${todayMealCount} of 3 meals planned for today`
      : 'No meals planned for today yet';
  const plannerSecondaryCopy =
    tomorrowMealCount > 0
      ? `${tomorrowMealCount} ready for tomorrow`
      : 'You can also map out tomorrow in advance';
  const copy = getUiCopy(settings.language);
  const recommendationsEnabled = settings.smartSuggestions;
  const isSignedIn = Boolean(user);
  const firstName =
    profile?.full_name?.trim().split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'chef';
  const currentMealSlot = getCurrentMealSlot(today);
  const previewMealSlot = currentMealSlot;
  const previewMealRecipe =
    previewMealSlot && mealPlans[todayKey]?.[previewMealSlot]
      ? recipes.find((recipe) => recipe.id === mealPlans[todayKey]?.[previewMealSlot])
      : null;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.appBackground }]}>
      <View style={[styles.backgroundOrbLarge, { backgroundColor: theme.accentSoft }]} />
      <View style={[styles.backgroundOrbSmall, { backgroundColor: theme.cardBackground }]} />

      <ScrollView contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) + 12 }]} showsVerticalScrollIndicator={false}>
          <View style={styles.contentWrap}>
            <View style={styles.topBar}>
              <Pressable
                style={[styles.menuIconButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                onPress={() => setIsMenuOpen(true)}>
                <MaterialIcons name="menu" size={20} color={theme.accent} />
              </Pressable>
              <View style={styles.topBarCopy}>
                <Text style={styles.eyebrow}>{user ? `Welcome back, ${firstName}` : 'Welcome to guest mode'}</Text>
                <Text style={[styles.brand, compact && styles.brandCompact]}>{copy.appName}</Text>
              </View>
              <Pressable
                style={[styles.addChip, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                onPress={() => openProtectedRoute(isSignedIn, PROTECTED_AUTH_ROUTES.addRecipe)}>
                <Text style={[styles.addChipText, { color: theme.accent }]}>+ {copy.addRecipe}</Text>
              </Pressable>
            </View>

          <View style={[styles.heroCard, compact && styles.heroCardCompact]}>
            <Image source={featuredRecipe.image} style={styles.heroImage} contentFit="cover" />
            <View style={styles.heroFavorite}>
              <FavoriteButton active={featuredRecipe.saved} onPress={() => toggleFavorite(featuredRecipe.id)} />
            </View>
            <View style={styles.heroOverlay}>
              <Text style={[styles.heroLabel, { color: theme.heroAccent }]}>{copy.featured}</Text>
              <Text style={[styles.heroTitle, compact && styles.heroTitleCompact]}>{featuredRecipe.title}</Text>
              <Text style={styles.heroMeta}>
                {featuredRecipe.cuisine} - {formatCookTime(featuredRecipe.cookTime, settings.language)}
              </Text>
              <Text style={styles.heroReason}>{featuredReason}</Text>
            </View>
          </View>

          <View style={styles.headerBlock}>
            <Text style={[styles.title, compact && styles.titleCompact]}>
              Discover dishes you&apos;ll actually cook, save, and make your own.
            </Text>
            <Text style={styles.subtitle}>
              Browse standout recipes, jump into your saved collection, or add a house favorite of your own.
            </Text>
          </View>

          <View style={styles.actionsRow}>
            <Pressable style={[styles.smallAction, styles.primaryAction, { backgroundColor: theme.accent }]} onPress={() => router.push('/(tabs)/discover')}>
              <Text style={styles.primaryActionText}>{copy.explore}</Text>
            </Pressable>
            <Pressable
              style={[styles.smallAction, styles.secondaryAction, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => openProtectedRoute(isSignedIn, PROTECTED_AUTH_ROUTES.addRecipe)}>
              <Text style={styles.secondaryActionText}>{copy.addYours}</Text>
            </Pressable>
            <Pressable
              style={[styles.smallAction, styles.ghostAction, { backgroundColor: theme.accentSoft }]}
              onPress={() => openProtectedRoute(isSignedIn, PROTECTED_AUTH_ROUTES.mealPlanner)}>
              <Text style={[styles.ghostActionText, { color: theme.accent }]}>Plan meals</Text>
            </Pressable>
          </View>

          <View style={[styles.plannerCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.plannerCardHeader}>
              <View style={[styles.plannerIconWrap, { backgroundColor: theme.accentSoft }]}>
                <MaterialIcons name="calendar-month" size={22} color={theme.accent} />
              </View>
              <View style={styles.plannerCopyWrap}>
                <Text style={styles.plannerTitle}>Plan meals faster</Text>
                <Text style={styles.plannerCopy}>{plannerStatusCopy}</Text>
                <Text style={styles.plannerHint}>{plannerSecondaryCopy}</Text>
                {previewMealSlot ? (
                  <View style={[styles.plannerPreviewCard, { backgroundColor: theme.appBackground, borderColor: theme.border }]}>
                    <View style={[styles.plannerPreviewIconWrap, { backgroundColor: theme.accentSoft }]}>
                      <MaterialIcons
                        name={previewMealRecipe ? 'schedule' : 'event-busy'}
                        size={16}
                        color={theme.accent}
                      />
                    </View>
                    <View style={styles.plannerPreviewBody}>
                      <Text style={styles.plannerPreviewLabel}>{formatMealSlotLabel(previewMealSlot)}</Text>
                      <Text style={styles.plannerPreviewValue} numberOfLines={1}>
                        {previewMealRecipe ? previewMealRecipe.title : formatMissingMealCopy(previewMealSlot)}
                      </Text>
                    </View>
                  </View>
                ) : null}
              </View>
            </View>
            <Pressable
              style={[styles.plannerButton, { backgroundColor: theme.accentSoft }]}
              onPress={() => openProtectedRoute(isSignedIn, PROTECTED_AUTH_ROUTES.mealPlanner)}>
              <Text style={[styles.plannerButtonText, { color: theme.accent }]}>
                {todayMealCount > 0 || tomorrowMealCount > 0 ? 'Manage meal plan' : 'Open meal planner'}
              </Text>
            </Pressable>
          </View>

          <View style={styles.statRow}>
            <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Text style={styles.statNumber}>{recipes.length}</Text>
              <Text style={styles.statLabel}>{copy.recipesReady}</Text>
            </View>
            <View style={[styles.statCardAccent, { backgroundColor: theme.heroBackground }]}>
              <Text style={styles.statNumberLight}>{Number.isFinite(fastestCookTime) ? `${fastestCookTime} min` : '--'}</Text>
              <Text style={styles.statLabelLight}>{copy.fastestDinner}</Text>
            </View>
          </View>

          <View style={[styles.quickStartCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Start fast</Text>
              <Text style={[styles.sectionCaption, { color: theme.accent }]}>Cook by category</Text>
            </View>
            <View style={styles.quickFilterRow}>
              {quickStartFilters.map((filter) => (
                <Pressable
                  key={filter}
                  style={[styles.quickFilterChip, { backgroundColor: theme.accentSoft }]}
                  onPress={() => router.push({ pathname: '/(tabs)/search', params: { q: filter } })}>
                  <Text style={[styles.quickFilterText, { color: theme.accent }]}>{filter}</Text>
                </Pressable>
              ))}
            </View>
            <Text style={styles.quickStartCopy}>
              {!recommendationsEnabled
                ? 'Personalized smart collections are paused right now, so this board is leaning on category-first browsing instead.'
                : smartCollections.length > 0
                ? `Your taste profile is already building smart collections like ${smartCollections[0].title.toLowerCase()}.`
                : 'Jump into a category when you want a quick answer instead of scrolling the full recipe list.'}
            </Text>
          </View>

          <View style={[styles.creatorCard, { backgroundColor: theme.accent }]}>
            <View style={styles.creatorCopy}>
              <Text style={styles.creatorEyebrow}>{copy.cookbookBuilder}</Text>
              <Text style={styles.creatorTitle}>Got a family favorite?</Text>
              <Text style={styles.creatorText}>
                Add your own recipe so your personal dishes can live beside the ones you discover here.
              </Text>
            </View>
            <Pressable style={styles.creatorButton} onPress={() => openProtectedRoute(isSignedIn, PROTECTED_AUTH_ROUTES.addRecipe)}>
              <Text style={[styles.creatorButtonText, { color: theme.accent }]}>{copy.startAdding}</Text>
            </Pressable>
          </View>

          <View style={styles.previewSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{copy.preview}</Text>
              <Text style={[styles.sectionCaption, { color: theme.accent }]}>Fresh ideas</Text>
            </View>

            <View style={styles.previewGrid}>
              {previewRecipes.map((recipe, index) => {
                const isWideCard = index === 0 || index === 3;
                return (
                  <Pressable
                    key={recipe.id}
                    onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })}
                    style={[
                      styles.previewCard,
                      isWideCard
                        ? [styles.previewCardWide, { width: contentWidth }]
                        : [styles.previewCardHalf, { width: cardWidth }],
                    ]}>
                    <Image
                      source={recipe.image}
                      style={[
                        styles.previewImage,
                        isWideCard ? styles.previewImageWide : styles.previewImageHalf,
                      ]}
                      contentFit="cover"
                    />
                    <View style={styles.previewFavorite}>
                      <FavoriteButton active={recipe.saved} onPress={() => toggleFavorite(recipe.id)} />
                    </View>
                    <View style={styles.previewBody}>
                      <Text style={styles.previewCardTitle}>{recipe.title}</Text>
                      <Text style={styles.previewCardMeta}>
                        {recipe.cuisine} - {formatCookTime(recipe.cookTime, settings.language)}
                      </Text>
                      <Text style={styles.previewCardCopy} numberOfLines={isWideCard ? 2 : 3}>
                        {recipe.description}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {settings.smartSuggestions && smartSuggestions.length > 0 ? (
            <View style={styles.previewSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>For you</Text>
                <Text style={[styles.sectionCaption, { color: theme.accent }]}>Smart suggestions</Text>
              </View>

              <View style={styles.smartList}>
                {smartSuggestions.slice(0, 3).map((item) => (
                  <Pressable
                    key={item.recipe.id}
                    style={[styles.smartCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                    onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: item.recipe.id } })}>
                    <View style={styles.smartCardBody}>
                      <Text style={styles.smartTitle}>{item.recipe.title}</Text>
                      <Text style={styles.smartReason}>{item.reason}</Text>
                    </View>
                    <Text style={[styles.smartBadge, { backgroundColor: theme.accentSoft, color: theme.accent }]}>
                      {formatCookTime(item.recipe.cookTime, settings.language)}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : !settings.smartSuggestions ? (
            <View style={styles.previewSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>For you</Text>
                <Text style={[styles.sectionCaption, { color: theme.accent }]}>Paused</Text>
              </View>
              <View style={[styles.pausedCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={styles.pausedTitle}>Smart suggestions are currently off.</Text>
                <Text style={styles.pausedCopy}>
                  The app is still browseable, but recommendation-based picks stay hidden until you re-enable smart suggestions in Settings.
                </Text>
                <Pressable style={[styles.pausedButton, { backgroundColor: theme.accentSoft }]} onPress={() => router.push('/settings')}>
                  <Text style={[styles.pausedButtonText, { color: theme.accent }]}>Open settings</Text>
                </Pressable>
              </View>
            </View>
          ) : null}
        </View>
      </ScrollView>

      <View style={styles.edgeSwipeZone} {...edgeSwipeResponder.panHandlers} />
      <SideMenu visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#FCF5EE' },
  backgroundOrbLarge: {
    position: 'absolute',
    top: 82,
    right: -52,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#F4D7BF',
    opacity: 0.55,
  },
  backgroundOrbSmall: {
    position: 'absolute',
    top: 320,
    left: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#F7E5D8',
  },
  content: { paddingHorizontal: 18, paddingBottom: 40 },
  contentWrap: { width: '100%', maxWidth: 460, alignSelf: 'center' },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  topBarCopy: { flex: 1, minWidth: 0 },
  eyebrow: {
    color: '#A16244',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  brand: { marginTop: 4, color: '#251712', fontSize: 28, fontWeight: '900' },
  brandCompact: { fontSize: 26 },
  menuIconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: '#FFF8F2',
    borderWidth: 1,
    borderColor: '#F0DDD0',
  },
  addChip: {
    borderRadius: 999,
    backgroundColor: '#FFF8F2',
    borderWidth: 1,
    borderColor: '#F0DDD0',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addChipText: { color: '#9E4E2C', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  heroCard: {
    marginTop: 18,
    height: 236,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#D8C2B3',
  },
  heroCardCompact: { height: 214 },
  heroImage: { width: '100%', height: '100%' },
  heroOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 18,
    backgroundColor: 'rgba(21, 14, 11, 0.44)',
  },
  heroFavorite: {
    position: 'absolute',
    top: 14,
    right: 14,
    zIndex: 1,
  },
  heroLabel: {
    color: '#FFE7DA',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  heroTitle: { marginTop: 8, color: '#FFFFFF', fontSize: 24, fontWeight: '800' },
  heroTitleCompact: { fontSize: 22 },
  heroMeta: { marginTop: 6, color: '#F7E7DE', fontSize: 13, fontWeight: '600' },
  heroReason: { marginTop: 8, color: '#FCEADF', fontSize: 12, lineHeight: 17, fontWeight: '600' },
  headerBlock: { marginTop: 18 },
  title: { color: '#251712', fontSize: 30, lineHeight: 34, fontWeight: '900' },
  titleCompact: { fontSize: 27, lineHeight: 31 },
  subtitle: { marginTop: 8, color: '#6D5D55', fontSize: 14, lineHeight: 20 },
  actionsRow: { flexDirection: 'row', gap: 8, marginTop: 20 },
  smallAction: {
    flex: 1,
    minHeight: 42,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
  },
  primaryAction: { backgroundColor: '#C7512D' },
  secondaryAction: { backgroundColor: '#FFFDFC', borderWidth: 1, borderColor: '#F0DDD0' },
  ghostAction: { backgroundColor: '#F7E5D8' },
  primaryActionText: { color: '#FFF8F2', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  secondaryActionText: { color: '#5A4337', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  ghostActionText: { color: '#9E4E2C', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  plannerCard: {
    marginTop: 18,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  plannerCardHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  plannerIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  plannerIcon: {
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  plannerCopyWrap: {
    flex: 1,
  },
  plannerTitle: {
    color: '#251712',
    fontSize: 18,
    fontWeight: '800',
  },
  plannerCopy: {
    marginTop: 5,
    color: '#5A4337',
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '700',
  },
  plannerHint: {
    marginTop: 4,
    color: '#7B6D65',
    fontSize: 12,
    lineHeight: 17,
  },
  plannerPreviewCard: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    alignSelf: 'stretch',
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  plannerPreviewIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  plannerPreviewBody: {
    flex: 1,
  },
  plannerPreviewLabel: {
    color: '#A16244',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  plannerPreviewValue: {
    marginTop: 3,
    color: '#5A4337',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  plannerButton: {
    alignSelf: 'flex-start',
    marginTop: 14,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  plannerButtonText: { fontSize: 13, fontWeight: '800' },
  statRow: { flexDirection: 'row', gap: 10, marginTop: 16 },
  statCard: {
    flex: 1.2,
    borderRadius: 24,
    backgroundColor: '#FFF8F2',
    borderWidth: 1,
    borderColor: '#F0DDD0',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  statCardAccent: {
    flex: 0.8,
    borderRadius: 24,
    backgroundColor: '#251712',
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  statNumber: { color: '#251712', fontSize: 21, fontWeight: '900' },
  statLabel: { marginTop: 4, color: '#7B6D65', fontSize: 12, fontWeight: '700' },
  statNumberLight: { color: '#FFF8F2', fontSize: 21, fontWeight: '900' },
  statLabelLight: { marginTop: 4, color: '#E7D2C6', fontSize: 12, fontWeight: '700' },
  quickStartCard: {
    marginTop: 18,
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
  },
  quickFilterRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  quickFilterChip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  quickFilterText: {
    fontSize: 13,
    fontWeight: '800',
  },
  quickStartCopy: {
    marginTop: 12,
    color: '#6D5D55',
    fontSize: 13,
    lineHeight: 19,
  },
  creatorCard: { marginTop: 18, borderRadius: 28, backgroundColor: '#C7512D', padding: 20 },
  creatorCopy: { maxWidth: 290 },
  creatorEyebrow: {
    color: '#FFDCCB',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  creatorTitle: { marginTop: 8, color: '#FFF8F2', fontSize: 24, fontWeight: '900' },
  creatorText: { marginTop: 8, color: '#FCEADF', fontSize: 14, lineHeight: 20 },
  creatorButton: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#FFF8F2',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  creatorButtonText: { color: '#9E4E2C', fontSize: 13, fontWeight: '900' },
  previewSection: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { color: '#251712', fontSize: 22, fontWeight: '800' },
  sectionCaption: { color: '#A16244', fontSize: 12, fontWeight: '700' },
  previewGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  smartList: { gap: 10 },
  pausedCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  pausedTitle: {
    color: '#23150F',
    fontSize: 18,
    fontWeight: '800',
  },
  pausedCopy: {
    marginTop: 8,
    color: '#6B5F58',
    fontSize: 14,
    lineHeight: 20,
  },
  pausedButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  pausedButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  smartCard: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  smartCardBody: { flex: 1 },
  smartTitle: { color: '#251712', fontSize: 16, fontWeight: '800' },
  smartReason: { marginTop: 5, color: '#6D5D55', fontSize: 13, lineHeight: 18 },
  smartBadge: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '800',
  },
  previewCard: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F0DDD0',
  },
  previewCardWide: {},
  previewCardHalf: {},
  previewImage: { width: '100%' },
  previewImageWide: { height: 170 },
  previewImageHalf: { height: 150 },
  previewFavorite: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 1,
  },
  previewBody: { padding: 14 },
  previewCardTitle: { color: '#251712', fontSize: 17, fontWeight: '800' },
  previewCardMeta: { marginTop: 5, color: '#A16244', fontSize: 12, fontWeight: '700' },
  previewCardCopy: { marginTop: 8, color: '#74655D', fontSize: 13, lineHeight: 18 },
  edgeSwipeZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    backgroundColor: 'transparent',
  },
});
