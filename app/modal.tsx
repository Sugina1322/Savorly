import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';
import { useRecipes } from '@/components/recipes-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { useSettings } from '@/components/settings-provider';

const HIGHLIGHTS = [
  {
    icon: 'auto-awesome' as const,
    title: 'Smart discovery',
    copy: 'Browse by food mood, featured picks, pantry matches, and categories like easy recipes or everyday food.',
  },
  {
    icon: 'kitchen' as const,
    title: 'Cook from what you have',
    copy: 'Type ingredients already in your kitchen and Savorly helps surface meals you can make right away.',
  },
  {
    icon: 'favorite-border' as const,
    title: 'Build your own board',
    copy: 'Save what looks good, shape your taste profile, and keep your go-to meals in one place.',
  },
];

const HOW_IT_WORKS = [
  'Open Discover to browse recipes visually.',
  'Use Search when you want a dish, ingredient, category, or pantry-based suggestion.',
  'Open any recipe to see ingredients, categories, and step-by-step cooking instructions.',
];

export default function ModalScreen() {
  const { recipes, savedCount } = useRecipes();
  const { theme } = useSettings();

  return (
    <ResponsiveScrollScreen backgroundColor={theme.appBackground} contentStyle={styles.content}>
      <Pressable
        style={[styles.backButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={18} color="#251712" />
        <Text style={styles.backButtonText}>Back</Text>
      </Pressable>

      <View style={[styles.heroCard, { backgroundColor: theme.heroBackground }]}>
        <View style={styles.heroBrandOverlay}>
          <View style={styles.heroBrandOuter}>
            <BrandMark size={96} />
          </View>
        </View>
        <Text style={[styles.eyebrow, { color: theme.heroAccent }]}>About Savorly</Text>
        <Text style={styles.heroTitle}>A recipe app built for the &quot;what should I cook today?&quot; moment.</Text>
        <Text style={styles.heroCopy}>
          Savorly helps people decide faster by mixing recipe browsing, ingredient-first search, smart categories, and
          simple cooking guidance in one place.
        </Text>

        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255, 248, 242, 0.12)' }]}>
            <Text style={styles.statNumber}>{recipes.length}</Text>
            <Text style={styles.statLabel}>Recipes ready</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: 'rgba(255, 248, 242, 0.12)' }]}>
            <Text style={styles.statNumber}>{savedCount}</Text>
            <Text style={styles.statLabel}>Saved so far</Text>
          </View>
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={styles.sectionTitle}>Why it exists</Text>
        <Text style={styles.sectionCopy}>
          Most recipe apps are good at storing recipes, but not always good at helping people decide. Savorly is meant
          to reduce choice overload and help users find something realistic to cook from their mood, budget, time, or
          available ingredients.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What Savorly does</Text>
        <View style={styles.highlightList}>
          {HIGHLIGHTS.map((item) => (
            <View key={item.title} style={[styles.highlightCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={[styles.iconWrap, { backgroundColor: theme.accentSoft }]}>
                <MaterialIcons name={item.icon} size={22} color={theme.accent} />
              </View>
              <View style={styles.highlightBody}>
                <Text style={styles.highlightTitle}>{item.title}</Text>
                <Text style={styles.highlightCopy}>{item.copy}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.sectionCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={styles.sectionTitle}>How to use it</Text>
        <View style={styles.stepsList}>
          {HOW_IT_WORKS.map((item, index) => (
            <View key={item} style={styles.stepRow}>
              <View style={[styles.stepBadge, { backgroundColor: theme.accent }]}>
                <Text style={styles.stepBadgeText}>{index + 1}</Text>
              </View>
              <Text style={styles.stepCopy}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.footerCard, { backgroundColor: theme.accentSoft, borderColor: theme.border }]}>
        <Text style={styles.footerTitle}>Built for everyday cooking</Text>
        <Text style={styles.footerCopy}>
          Whether you want something cheap, fast, high-protein, restaurant-like, or based on leftovers in your fridge,
          Savorly is designed to help you land on an answer quickly.
        </Text>
        <Pressable style={[styles.footerButton, { backgroundColor: theme.accent }]} onPress={() => router.replace('/(tabs)/discover')}>
          <Text style={styles.footerButtonText}>Start exploring recipes</Text>
        </Pressable>
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
    marginBottom: 16,
  },
  backButtonText: {
    color: '#251712',
    fontSize: 14,
    fontWeight: '700',
  },
  heroCard: {
    borderRadius: 32,
    padding: 22,
    overflow: 'hidden',
    position: 'relative',
  },
  heroBrandOverlay: {
    position: 'absolute',
    top: -18,
    right: -10,
    opacity: 0.22,
    transform: [{ rotate: '10deg' }],
  },
  heroBrandOuter: {
    transform: [{ scale: 1.15 }],
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.3,
  },
  heroTitle: {
    marginTop: 10,
    color: '#FFF8F2',
    fontSize: 31,
    lineHeight: 35,
    fontWeight: '900',
  },
  heroCopy: {
    marginTop: 12,
    color: '#E8D7CE',
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 360,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 18,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 16,
  },
  statNumber: {
    color: '#FFF8F2',
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 4,
    color: '#E8D7CE',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginTop: 24,
  },
  sectionCard: {
    marginTop: 20,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
    backgroundColor: '#FFFFFF',
  },
  sectionTitle: {
    color: '#251712',
    fontSize: 22,
    fontWeight: '900',
  },
  sectionCopy: {
    marginTop: 10,
    color: '#6D5D55',
    fontSize: 14,
    lineHeight: 21,
  },
  highlightList: {
    gap: 12,
    marginTop: 14,
  },
  highlightCard: {
    flexDirection: 'row',
    gap: 14,
    borderWidth: 1,
    borderRadius: 24,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  iconWrap: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  highlightBody: {
    flex: 1,
  },
  highlightTitle: {
    color: '#251712',
    fontSize: 16,
    fontWeight: '800',
  },
  highlightCopy: {
    marginTop: 5,
    color: '#6D5D55',
    fontSize: 13,
    lineHeight: 19,
  },
  stepsList: {
    marginTop: 14,
    gap: 14,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepBadge: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  stepCopy: {
    flex: 1,
    color: '#52463F',
    fontSize: 14,
    lineHeight: 21,
  },
  footerCard: {
    marginTop: 24,
    borderRadius: 28,
    borderWidth: 1,
    padding: 20,
  },
  footerTitle: {
    color: '#251712',
    fontSize: 24,
    fontWeight: '900',
  },
  footerCopy: {
    marginTop: 8,
    color: '#5E4C43',
    fontSize: 14,
    lineHeight: 21,
  },
  footerButton: {
    alignSelf: 'flex-start',
    marginTop: 16,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  footerButtonText: {
    color: '#FFF8F2',
    fontSize: 14,
    fontWeight: '800',
  },
});
