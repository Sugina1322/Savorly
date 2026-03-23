import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/components/auth-provider';
import { MealSlot, useRecipes } from '@/components/recipes-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { useSettings } from '@/components/settings-provider';
import { formatCookTime } from '@/utils/app-settings-display';
import { PROTECTED_AUTH_ROUTES, useProtectedRouteGuard } from '@/utils/auth-gate';
import { MealPlannerFilterKey, recommendMealRecipes } from '@/utils/recipe-intelligence';

const MEAL_SLOTS: {
  key: MealSlot;
  label: string;
  prompt: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
}[] = [
  { key: 'breakfast', label: 'Breakfast', prompt: 'Light, easy, or morning-friendly', icon: 'free-breakfast' },
  { key: 'lunch', label: 'Lunch', prompt: 'Balanced, practical, and midday-ready', icon: 'lunch-dining' },
  { key: 'dinner', label: 'Dinner', prompt: 'Comforting, filling, or family-style', icon: 'dinner-dining' },
];

const DEFAULT_SLOT_QUERIES: Record<MealSlot, string> = {
  breakfast: 'Breakfast Quick',
  lunch: 'Everyday food Quick',
  dinner: 'Comfort Everyday food',
};

const FILTERS: { key: MealPlannerFilterKey; label: string }[] = [
  { key: 'smart', label: 'Smart picks' },
  { key: 'saved', label: 'Saved' },
  { key: 'budget', label: 'Budget' },
  { key: 'quick', label: 'Quick' },
  { key: 'high-protein', label: 'High protein' },
];

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

function formatDayLabel(date: Date) {
  return date.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function formatDayChipTitle(date: Date, baseDate: Date) {
  const dateKey = getDateKey(date);
  const todayKey = getDateKey(baseDate);
  const tomorrowKey = getDateKey(addDays(baseDate, 1));

  if (dateKey === todayKey) return 'Today';
  if (dateKey === tomorrowKey) return 'Tomorrow';

  return date.toLocaleDateString(undefined, {
    weekday: 'short',
  });
}

function getFilterQuery(filter: MealPlannerFilterKey) {
  if (filter === 'budget') return 'Budget';
  if (filter === 'quick') return 'Quick';
  if (filter === 'high-protein') return 'High protein';
  return '';
}

export default function MealPlannerScreen() {
  const { isLoading: isAuthLoading, user } = useAuth();
  const { mealPlans, recipes, setMealPlanSlot, clearMealPlanSlot, tasteProfile } = useRecipes();
  const { settings, theme } = useSettings();
  const hasAccess = useProtectedRouteGuard(isAuthLoading, Boolean(user), PROTECTED_AUTH_ROUTES.mealPlanner);
  const today = useMemo(() => new Date(), []);
  const [weekOffset, setWeekOffset] = useState(0);
  const plannerDays = useMemo(() => {
    const start = addDays(today, weekOffset * 7);

    return Array.from({ length: 7 }, (_, index) => {
      const date = addDays(start, index);
      return {
        key: getDateKey(date),
        title: formatDayChipTitle(date, today),
        subtitle: formatDayLabel(date),
      };
    });
  }, [today, weekOffset]);
  const [selectedDayKey, setSelectedDayKey] = useState(plannerDays[0].key);
  const [pickerSlot, setPickerSlot] = useState<MealSlot | null>(null);
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<MealPlannerFilterKey>('smart');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const feedbackAnimation = useMemo(() => new Animated.Value(0), []);

  useEffect(() => {
    if (!plannerDays.some((day) => day.key === selectedDayKey)) {
      setSelectedDayKey(plannerDays[0].key);
    }
  }, [plannerDays, selectedDayKey]);

  const selectedDay = plannerDays.find((day) => day.key === selectedDayKey) ?? plannerDays[0];
  const plannedMealCount = MEAL_SLOTS.filter((slot) => Boolean(mealPlans[selectedDayKey]?.[slot.key])).length;
  const pickerSlotConfig = MEAL_SLOTS.find((slot) => slot.key === pickerSlot) ?? null;
  const assignedRecipeId = pickerSlot ? mealPlans[selectedDayKey]?.[pickerSlot] : undefined;
  const recipeById = useMemo(() => new Map(recipes.map((recipe) => [recipe.id, recipe])), [recipes]);
  const assignedRecipe = assignedRecipeId ? recipeById.get(assignedRecipeId) : undefined;
  const effectiveQuery =
    pickerSlot === null
      ? ''
      : query.trim() || [DEFAULT_SLOT_QUERIES[pickerSlot], getFilterQuery(activeFilter)].filter(Boolean).join(' ');
  const deferredEffectiveQuery = useDeferredValue(effectiveQuery);
  const recommendedRecipes = useMemo(
    () =>
      pickerSlot
        ? recommendMealRecipes(recipes, tasteProfile, pickerSlot, activeFilter, deferredEffectiveQuery).slice(0, 8)
        : [],
    [activeFilter, deferredEffectiveQuery, pickerSlot, recipes, tasteProfile]
  );

  useEffect(() => {
    if (!feedbackVisible) {
      Animated.timing(feedbackAnimation, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(feedbackAnimation, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();

    const timeout = setTimeout(() => {
      setFeedbackVisible(false);
    }, 1600);

    return () => clearTimeout(timeout);
  }, [feedbackAnimation, feedbackVisible]);

  if (!hasAccess) {
    return null;
  }

  function openPicker(slot: MealSlot) {
    setPickerSlot(slot);
    setQuery('');
    setActiveFilter('smart');
  }

  function showPlannerFeedback(message: string) {
    setFeedbackMessage(message);
    setFeedbackVisible(true);
  }

  return (
    <>
      <ResponsiveScrollScreen backgroundColor={theme.appBackground} contentStyle={styles.content}>
        <Animated.View
          pointerEvents="none"
          style={[
            styles.feedbackBanner,
            {
              backgroundColor: theme.heroBackground,
              opacity: feedbackAnimation,
              transform: [
                {
                  translateY: feedbackAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-12, 0],
                  }),
                },
              ],
            },
          ]}>
          <MaterialIcons name="check-circle" size={16} color={theme.heroAccent} />
          <Text style={styles.feedbackBannerText}>{feedbackMessage}</Text>
        </Animated.View>
        <Pressable
          style={[styles.backButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
          onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={20} color="#251712" />
          <Text style={styles.backText}>Back</Text>
        </Pressable>

        <View style={[styles.heroCard, { backgroundColor: theme.heroBackground }]}>
          <Text style={[styles.eyebrow, { color: theme.heroAccent }]}>Meal planner</Text>
          <Text style={styles.heroTitle}>Pick a day, tap a meal, and assign it in one quick flow.</Text>
          <Text style={styles.heroCopy}>
            This planner keeps the main screen simple. Every meal slot opens a focused chooser, so new users do not
            have to scroll through a long page just to make one decision.
          </Text>
        </View>

        <View style={[styles.dayCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <View style={styles.dayHeader}>
            <View>
              <Text style={styles.dayTitle}>Choose your day</Text>
              <Text style={styles.daySubtitle}>
                {plannedMealCount > 0
                  ? `${plannedMealCount} meal${plannedMealCount === 1 ? '' : 's'} planned for ${selectedDay.title.toLowerCase()}.`
                  : `No meals planned for ${selectedDay.title.toLowerCase()} yet.`}
              </Text>
            </View>
          </View>

          <View style={styles.weekNavRow}>
            <Pressable
              style={[
                styles.weekNavButton,
                { backgroundColor: theme.appBackground, borderColor: weekOffset === 0 ? theme.border : theme.accentSoft },
                weekOffset === 0 && styles.weekNavButtonDisabled,
              ]}
              onPress={() => setWeekOffset((current) => Math.max(0, current - 1))}
              disabled={weekOffset === 0}>
              <MaterialIcons name="chevron-left" size={18} color={weekOffset === 0 ? '#B5A39A' : theme.accent} />
              <Text style={[styles.weekNavText, { color: weekOffset === 0 ? '#B5A39A' : theme.accent }]}>Earlier</Text>
            </Pressable>

            <Pressable
              style={[styles.weekNavButton, { backgroundColor: theme.accentSoft, borderColor: theme.accentSoft }]}
              onPress={() => setWeekOffset((current) => current + 1)}>
              <Text style={[styles.weekNavText, { color: theme.accent }]}>Next week</Text>
              <MaterialIcons name="chevron-right" size={18} color={theme.accent} />
            </Pressable>
          </View>

          <View style={styles.dayStatusRow}>
            <Text style={[styles.dayBadge, { backgroundColor: theme.accentSoft, color: theme.accent }]}>
              {plannedMealCount}/3 planned
            </Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayToggleRow}>
            {plannerDays.map((day) => {
              const active = day.key === selectedDayKey;

              return (
                <Pressable
                  key={day.key}
                  style={[
                    styles.dayToggle,
                    {
                      backgroundColor: active ? theme.accentSoft : theme.appBackground,
                      borderColor: active ? theme.accent : theme.border,
                    },
                  ]}
                  onPress={() => setSelectedDayKey(day.key)}>
                  <View style={[styles.radioDot, active && { borderColor: theme.accent }]}>
                    {active ? <View style={[styles.radioDotInner, { backgroundColor: theme.accent }]} /> : null}
                  </View>
                  <View style={styles.dayToggleBody}>
                    <Text style={styles.dayToggleTitle}>{day.title}</Text>
                    <Text style={styles.dayToggleSubtitle}>{day.subtitle}</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        <View style={styles.slotStack}>
          {MEAL_SLOTS.map((slot) => {
            const recipeId = mealPlans[selectedDayKey]?.[slot.key];
            const recipe = recipeId ? recipeById.get(recipeId) : undefined;

            return (
              <View
                key={slot.key}
                style={[styles.slotCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <View style={styles.slotHeader}>
                  <View style={[styles.slotIconWrap, { backgroundColor: theme.accentSoft }]}>
                    <MaterialIcons name={slot.icon} size={20} color={theme.accent} />
                  </View>
                  <View style={styles.slotHeaderBody}>
                    <Text style={styles.slotTitle}>{slot.label}</Text>
                    <Text style={styles.slotPrompt}>{slot.prompt}</Text>
                  </View>
                </View>

                {recipe ? (
                  <View style={styles.slotRecipeRow}>
                    <Image source={recipe.image} style={styles.slotRecipeImage} contentFit="cover" />
                    <View style={styles.slotRecipeBody}>
                      <Text style={styles.slotRecipeTitle}>{recipe.title}</Text>
                      <Text style={styles.slotRecipeMeta}>
                        {recipe.cuisine} - {formatCookTime(recipe.cookTime, settings.language)}
                      </Text>
                    </View>
                  </View>
                ) : (
                  <Text style={styles.slotEmptyCopy}>Nothing planned yet. Tap below and choose a recipe.</Text>
                )}

                <View style={styles.slotActions}>
                  <Pressable
                    style={[styles.slotButtonPrimary, { backgroundColor: theme.accent }]}
                    onPress={() => openPicker(slot.key)}>
                    <Text style={styles.slotButtonPrimaryText}>{recipe ? 'Change meal' : 'Choose meal'}</Text>
                  </Pressable>
                  {recipe ? (
                    <Pressable
                      style={[styles.slotButtonSecondary, { backgroundColor: theme.appBackground, borderColor: theme.border }]}
                      onPress={() => {
                        clearMealPlanSlot(selectedDayKey, slot.key);
                        showPlannerFeedback(`${slot.label} cleared for ${selectedDay.title}.`);
                      }}>
                      <Text style={[styles.slotButtonSecondaryText, { color: theme.accent }]}>Clear</Text>
                    </Pressable>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </ResponsiveScrollScreen>

      <Modal visible={pickerSlot !== null} transparent animationType="slide" onRequestClose={() => setPickerSlot(null)}>
        <View style={styles.modalOverlay}>
          <Pressable style={styles.modalBackdrop} onPress={() => setPickerSlot(null)} />

          <View style={[styles.modalSheet, { backgroundColor: theme.appBackground }]}>
            <View style={styles.modalTopRow}>
              <View>
                <Text style={[styles.modalEyebrow, { color: theme.accent }]}>
                  {selectedDay.title} meal plan
                </Text>
                <Text style={styles.modalTitle}>
                  {pickerSlotConfig ? `Choose ${pickerSlotConfig.label.toLowerCase()}` : 'Choose a meal'}
                </Text>
              </View>
              <Pressable
                style={[styles.closeButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
                onPress={() => setPickerSlot(null)}>
                <MaterialIcons name="close" size={20} color="#251712" />
              </Pressable>
            </View>

            {assignedRecipe ? (
              <View style={[styles.currentSelectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
                <Text style={styles.currentSelectionLabel}>Current selection</Text>
                <View style={styles.currentSelectionRow}>
                  <Image source={assignedRecipe.image} style={styles.currentSelectionImage} contentFit="cover" />
                  <View style={styles.currentSelectionBody}>
                    <Text style={styles.currentSelectionTitle}>{assignedRecipe.title}</Text>
                    <Text style={styles.currentSelectionMeta}>
                      {assignedRecipe.cuisine} - {formatCookTime(assignedRecipe.cookTime, settings.language)}
                    </Text>
                  </View>
                </View>
              </View>
            ) : null}

            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder={pickerSlot ? `Search recipes for ${pickerSlot}` : 'Search recipes'}
              placeholderTextColor="#9A8D84"
              style={[styles.searchInput, { borderColor: theme.border }]}
            />

            <View style={styles.filterSection}>
              <Text style={styles.filterSectionLabel}>Quick filters</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                <View style={styles.filterInline}>
                  {FILTERS.map((filter) => {
                    const active = filter.key === activeFilter;

                    return (
                      <Pressable
                        key={filter.key}
                        style={[
                          styles.filterChip,
                          {
                            backgroundColor: active ? theme.accentSoft : theme.cardBackground,
                            borderColor: active ? theme.accent : theme.border,
                          },
                        ]}
                        onPress={() => {
                          setActiveFilter(filter.key);
                          setQuery('');
                        }}>
                        <Text style={[styles.filterChipText, { color: active ? theme.accent : '#5A4337' }]}>
                          {filter.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </ScrollView>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.recommendationList}>
              {recommendedRecipes.map((result) => {
                const recipe = result.recipe;
                const assigned = assignedRecipe?.id === recipe.id;

                return (
                  <Pressable
                    key={recipe.id}
                    style={[
                      styles.recommendationCard,
                      {
                        borderColor: assigned ? theme.accent : theme.border,
                        backgroundColor: assigned ? theme.accentSoft : theme.cardBackground,
                      },
                    ]}
                    onPress={() => {
                      if (pickerSlot) {
                        setMealPlanSlot(selectedDayKey, pickerSlot, recipe.id);
                        const slotLabel = pickerSlotConfig?.label ?? 'Meal';
                        showPlannerFeedback(`${recipe.title} planned for ${selectedDay.title} ${slotLabel.toLowerCase()}.`);
                      }
                      setPickerSlot(null);
                      setQuery('');
                    }}>
                    <Image source={recipe.image} style={styles.recommendationImage} contentFit="cover" />
                    <View style={styles.recommendationBody}>
                      <Text style={styles.recommendationTitle}>{recipe.title}</Text>
                      <Text style={styles.recommendationMeta}>
                        {recipe.cuisine} - {formatCookTime(recipe.cookTime, settings.language)}
                      </Text>
                      <Text style={[styles.recommendationReason, { color: theme.accent }]}>{result.reason}</Text>
                      <Text style={styles.recommendationTags}>{recipe.categories.slice(0, 2).join(' / ')}</Text>
                    </View>
                    <View style={[styles.assignIndicator, assigned && { backgroundColor: theme.accent, borderColor: theme.accent }]}>
                      {assigned ? <MaterialIcons name="check" size={16} color="#FFFFFF" /> : <MaterialIcons name="add" size={16} color={theme.accent} />}
                    </View>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 40,
  },
  feedbackBanner: {
    alignSelf: 'flex-start',
    marginBottom: 14,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  feedbackBannerText: {
    color: '#FFF8F2',
    fontSize: 12,
    fontWeight: '800',
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
    borderRadius: 30,
    padding: 20,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  heroTitle: {
    marginTop: 10,
    color: '#FFF8F2',
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900',
  },
  heroCopy: {
    marginTop: 10,
    color: '#E6D7D1',
    fontSize: 14,
    lineHeight: 21,
  },
  dayCard: {
    marginTop: 20,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
  },
  dayHeader: {
    gap: 12,
    alignItems: 'flex-start',
  },
  dayTitle: {
    color: '#251712',
    fontSize: 20,
    fontWeight: '900',
  },
  daySubtitle: {
    marginTop: 6,
    color: '#6D5D55',
    fontSize: 13,
    lineHeight: 18,
  },
  dayStatusRow: {
    marginTop: 12,
    flexDirection: 'row',
  },
  weekNavRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 14,
  },
  weekNavButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  weekNavButtonDisabled: {
    opacity: 0.65,
  },
  weekNavText: {
    fontSize: 12,
    fontWeight: '800',
  },
  dayBadge: {
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    fontWeight: '800',
  },
  dayToggleRow: {
    gap: 10,
    marginTop: 16,
    paddingRight: 8,
  },
  dayToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 14,
    width: 216,
  },
  radioDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#D9C9BC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDotInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dayToggleBody: {
    flex: 1,
  },
  dayToggleTitle: {
    color: '#251712',
    fontSize: 16,
    fontWeight: '800',
  },
  dayToggleSubtitle: {
    marginTop: 4,
    color: '#7B6D65',
    fontSize: 12,
    fontWeight: '600',
  },
  slotStack: {
    gap: 14,
    marginTop: 18,
  },
  slotCard: {
    borderRadius: 26,
    borderWidth: 1,
    padding: 16,
  },
  slotHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  slotIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slotHeaderBody: {
    flex: 1,
  },
  slotTitle: {
    color: '#251712',
    fontSize: 18,
    fontWeight: '800',
  },
  slotPrompt: {
    marginTop: 4,
    color: '#7B6D65',
    fontSize: 13,
    lineHeight: 18,
  },
  slotRecipeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 14,
    alignItems: 'center',
  },
  slotRecipeImage: {
    width: 72,
    height: 72,
    borderRadius: 18,
  },
  slotRecipeBody: {
    flex: 1,
  },
  slotRecipeTitle: {
    color: '#251712',
    fontSize: 15,
    fontWeight: '800',
  },
  slotRecipeMeta: {
    marginTop: 4,
    color: '#7B6D65',
    fontSize: 12,
    fontWeight: '600',
  },
  slotEmptyCopy: {
    marginTop: 12,
    color: '#6D5D55',
    fontSize: 13,
    lineHeight: 19,
  },
  slotActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  slotButtonPrimary: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  slotButtonPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  slotButtonSecondary: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  slotButtonSecondaryText: {
    fontSize: 13,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 12, 8, 0.32)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  modalSheet: {
    maxHeight: '88%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
  },
  modalTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  modalEyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  modalTitle: {
    marginTop: 8,
    color: '#251712',
    fontSize: 26,
    fontWeight: '900',
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentSelectionCard: {
    marginTop: 16,
    borderRadius: 24,
    borderWidth: 1,
    padding: 14,
  },
  currentSelectionLabel: {
    color: '#A16244',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  currentSelectionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 10,
    alignItems: 'center',
  },
  currentSelectionImage: {
    width: 62,
    height: 62,
    borderRadius: 16,
  },
  currentSelectionBody: {
    flex: 1,
  },
  currentSelectionTitle: {
    color: '#251712',
    fontSize: 15,
    fontWeight: '800',
  },
  currentSelectionMeta: {
    marginTop: 4,
    color: '#7B6D65',
    fontSize: 12,
    fontWeight: '600',
  },
  searchInput: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#23150F',
    fontSize: 15,
  },
  filterSection: {
    marginTop: 14,
  },
  filterSectionLabel: {
    color: '#7B6D65',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.9,
  },
  filterRow: {
    gap: 10,
    marginTop: 10,
    paddingRight: 8,
    paddingBottom: 6,
  },
  filterInline: {
    flexDirection: 'row',
    gap: 10,
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
  recommendationList: {
    gap: 10,
    marginTop: 10,
    paddingBottom: 12,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
  },
  recommendationImage: {
    width: 82,
    height: 82,
    borderRadius: 18,
  },
  recommendationBody: {
    flex: 1,
    justifyContent: 'center',
  },
  recommendationTitle: {
    color: '#251712',
    fontSize: 15,
    fontWeight: '800',
  },
  recommendationMeta: {
    marginTop: 4,
    color: '#A16244',
    fontSize: 12,
    fontWeight: '700',
  },
  recommendationReason: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '700',
  },
  recommendationTags: {
    marginTop: 6,
    color: '#6D5D55',
    fontSize: 12,
    lineHeight: 17,
  },
  assignIndicator: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#D9C9BC',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
});
