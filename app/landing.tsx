import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { PanResponder, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { FavoriteButton } from '@/components/favorite-button';
import { useAuth } from '@/components/auth-provider';
import { useRecipes } from '@/components/recipes-provider';
import { useSettings } from '@/components/settings-provider';
import { SideMenu } from '@/components/side-menu';
import { formatCookTime, getUiCopy } from '@/utils/app-settings-display';

export default function LandingScreen() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { profile, user } = useAuth();
  const { recipes, toggleFavorite } = useRecipes();
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
  const featuredRecipe = recipes[0];
  const previewRecipes = recipes.slice(1, 5);
  const copy = getUiCopy(settings.language);
  const firstName =
    profile?.full_name?.trim().split(' ')[0] ||
    user?.email?.split('@')[0] ||
    'chef';

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.appBackground }]}>
      <View style={[styles.backgroundOrbLarge, { backgroundColor: theme.accentSoft }]} />
      <View style={[styles.backgroundOrbSmall, { backgroundColor: theme.cardBackground }]} />

      <ScrollView contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) + 12 }]} showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrap}>
          <View style={styles.topBar}>
            <View>
              <Text style={styles.eyebrow}>{user ? `Welcome back, ${firstName}` : 'Welcome to guest mode'}</Text>
              <Text style={[styles.brand, compact && styles.brandCompact]}>{copy.appName}</Text>
            </View>
            <Pressable
              style={[styles.addChip, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
              onPress={() => router.push('/add-recipe')}>
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
              onPress={() => router.push('/add-recipe')}>
              <Text style={styles.secondaryActionText}>{copy.addYours}</Text>
            </Pressable>
            <Pressable style={[styles.smallAction, styles.ghostAction, { backgroundColor: theme.accentSoft }]} onPress={() => router.push('/modal')}>
              <Text style={[styles.ghostActionText, { color: theme.accent }]}>{copy.about}</Text>
            </Pressable>
          </View>

          <View style={styles.statRow}>
            <View style={[styles.statCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Text style={styles.statNumber}>{recipes.length}</Text>
              <Text style={styles.statLabel}>{copy.recipesReady}</Text>
            </View>
            <View style={[styles.statCardAccent, { backgroundColor: theme.heroBackground }]}>
              <Text style={styles.statNumberLight}>12 min</Text>
              <Text style={styles.statLabelLight}>{copy.fastestDinner}</Text>
            </View>
          </View>

          <View style={[styles.creatorCard, { backgroundColor: theme.accent }]}>
            <View style={styles.creatorCopy}>
              <Text style={styles.creatorEyebrow}>{copy.cookbookBuilder}</Text>
              <Text style={styles.creatorTitle}>Got a family favorite?</Text>
              <Text style={styles.creatorText}>
                Add your own recipe so your personal dishes can live beside the ones you discover here.
              </Text>
            </View>
            <Pressable style={styles.creatorButton} onPress={() => router.push('/add-recipe')}>
              <Text style={[styles.creatorButtonText, { color: theme.accent }]}>{copy.startAdding}</Text>
            </Pressable>
          </View>

          <View style={styles.previewSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{copy.preview}</Text>
              <Text style={[styles.sectionCaption, { color: theme.accent }]}>{copy.editorialBoard}</Text>
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
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  eyebrow: {
    color: '#A16244',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  brand: { marginTop: 4, color: '#251712', fontSize: 28, fontWeight: '900' },
  brandCompact: { fontSize: 26 },
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
