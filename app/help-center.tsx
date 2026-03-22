import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useAuth } from '@/components/auth-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { useSettings } from '@/components/settings-provider';
import { openProtectedRoute, PROTECTED_AUTH_ROUTES } from '@/utils/auth-gate';

const FAQS = [
  {
    title: 'How do smart collections work?',
    copy: 'They update from what you save, search for, and open often, so the app can group recipes around your real habits.',
  },
  {
    title: 'Can I add my own recipes?',
    copy: 'Yes. Start from Add recipe, and Savorly will draft tags, ingredients, and steps from your idea.',
  },
  {
    title: 'Where do meal plans live?',
    copy: 'Your meal planner saves breakfast, lunch, and dinner slots by day so you can preview what is coming next.',
  },
];

export default function HelpCenterScreen() {
  const { user } = useAuth();
  const { theme } = useSettings();
  const isSignedIn = Boolean(user);

  return (
    <ResponsiveScrollScreen backgroundColor={theme.appBackground} contentStyle={styles.content}>
      <Pressable
        style={[styles.backButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={20} color="#251712" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={[styles.heroCard, { backgroundColor: theme.heroBackground }]}>
        <Text style={[styles.heroEyebrow, { color: theme.heroAccent }]}>Help center</Text>
        <Text style={styles.heroTitle}>A quick guide to the app&apos;s core flows.</Text>
        <Text style={styles.heroCopy}>
          If something feels unfinished or hard to find, these are the fastest routes back into search, planning, and
          profile controls.
        </Text>
      </View>

      <View style={styles.faqList}>
        {FAQS.map((item) => (
          <View key={item.title} style={[styles.faqCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={styles.faqTitle}>{item.title}</Text>
            <Text style={styles.faqCopy}>{item.copy}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.actionsCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={styles.actionsTitle}>Jump to</Text>
        <View style={styles.actionList}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.accent }]}
            onPress={() => openProtectedRoute(isSignedIn, PROTECTED_AUTH_ROUTES.mealPlanner)}>
            <Text style={styles.actionButtonText}>Meal planner</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, { backgroundColor: theme.accentSoft }]} onPress={() => router.push('/(tabs)/search')}>
            <Text style={[styles.actionButtonTextDark, { color: theme.accent }]}>Search recipes</Text>
          </Pressable>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.accentSoft }]}
            onPress={() => openProtectedRoute(isSignedIn, PROTECTED_AUTH_ROUTES.addRecipe)}>
            <Text style={[styles.actionButtonTextDark, { color: theme.accent }]}>Add recipe</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, { backgroundColor: theme.accentSoft }]} onPress={() => router.push('/settings')}>
            <Text style={[styles.actionButtonTextDark, { color: theme.accent }]}>Settings</Text>
          </Pressable>
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
    borderRadius: 30,
    padding: 22,
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
    marginTop: 10,
    color: '#E6D7D1',
    fontSize: 14,
    lineHeight: 21,
  },
  faqList: {
    gap: 12,
    marginTop: 20,
  },
  faqCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
  },
  faqTitle: {
    color: '#251712',
    fontSize: 18,
    fontWeight: '800',
  },
  faqCopy: {
    marginTop: 8,
    color: '#6D5D55',
    fontSize: 14,
    lineHeight: 20,
  },
  actionsCard: {
    marginTop: 20,
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
  },
  actionsTitle: {
    color: '#251712',
    fontSize: 22,
    fontWeight: '900',
  },
  actionList: {
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  actionButtonTextDark: {
    fontSize: 14,
    fontWeight: '800',
  },
});
