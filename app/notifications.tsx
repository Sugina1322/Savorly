import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { useAuth } from '@/components/auth-provider';
import { useRecipes } from '@/components/recipes-provider';
import { ResponsiveScrollScreen } from '@/components/responsive-scroll-screen';
import { useSettings } from '@/components/settings-provider';
import { openProtectedRoute, PROTECTED_AUTH_ROUTES } from '@/utils/auth-gate';

export default function NotificationsScreen() {
  const { user } = useAuth();
  const { featuredPick, mealPlans, savedCount, smartCollections } = useRecipes();
  const { settings, setPushAlerts, setSmartSuggestions, theme } = useSettings();
  const isSignedIn = Boolean(user);
  const upcomingMealCount = Object.values(mealPlans).reduce((total, dayPlan) => total + Object.keys(dayPlan).length, 0);
  const pushStatusTitle = settings.pushAlerts ? 'Push alerts are active' : 'Push alerts are paused';
  const pushStatusCopy = settings.pushAlerts
    ? upcomingMealCount > 0
      ? `You have ${upcomingMealCount} planned meal slot${upcomingMealCount === 1 ? '' : 's'} that can trigger reminders.`
      : 'Turn meal planning into timely nudges when you start filling breakfast, lunch, or dinner slots.'
    : 'Reminder banners and collection alerts stay quiet until you turn push alerts back on.';
  const suggestionStatusTitle = settings.smartSuggestions ? 'Suggestion alerts are active' : 'Suggestion alerts are paused';
  const suggestionStatusCopy = settings.smartSuggestions
    ? smartCollections.length > 0
      ? `${smartCollections.length} smart collection${smartCollections.length === 1 ? '' : 's'} are ready to shape future suggestions.`
      : 'Save and search a little more to make the next recommendation batch feel sharper.'
    : 'Savorly will stop surfacing recommendation-driven alerts until smart suggestions are enabled again.';

  const activityItems = [
    {
      icon: 'campaign' as const,
      title: settings.smartSuggestions ? featuredPick?.recipe.title ?? 'Today\'s featured pick' : 'Suggestion alerts paused',
      copy: settings.smartSuggestions
        ? featuredPick?.reason ?? 'A featured recipe is ready for you to explore.'
        : 'Smart picks are currently hidden from alert previews because suggestion alerts are turned off.',
    },
    {
      icon: 'calendar-month' as const,
      title: upcomingMealCount > 0 ? `${upcomingMealCount} meal slots planned` : settings.pushAlerts ? 'Meal planner is waiting' : 'Planner nudges paused',
      copy:
        !settings.pushAlerts
          ? 'Planner reminders will stay muted until push alerts are enabled again.'
          : upcomingMealCount > 0
          ? 'Planner reminders can nudge you before your next cook.'
          : 'Add a few breakfasts, lunches, or dinners and reminders will feel more useful.',
    },
    {
      icon: 'favorite-border' as const,
      title: `${savedCount} saved recipes`,
      copy:
        smartCollections.length > 0
          ? `Your saves are already shaping ${smartCollections.length} smart collections.`
          : 'Start saving more recipes to unlock richer notification suggestions.',
    },
  ];

  return (
    <ResponsiveScrollScreen backgroundColor={theme.appBackground} contentStyle={styles.content}>
      <Pressable
        style={[styles.backButton, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}
        onPress={() => router.back()}>
        <MaterialIcons name="arrow-back" size={20} color="#251712" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={[styles.heroCard, { backgroundColor: theme.heroBackground }]}>
        <Text style={[styles.heroEyebrow, { color: theme.heroAccent }]}>Notifications</Text>
        <Text style={styles.heroTitle}>Control reminders without digging through settings.</Text>
        <Text style={styles.heroCopy}>
          This page is for alert behavior and recent activity, while the main settings page stays focused on app-wide
          appearance and language.
        </Text>
      </View>

      {!user ? (
        <View style={[styles.noticeCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
          <Text style={styles.noticeTitle}>Guest mode</Text>
          <Text style={styles.noticeCopy}>
            You can preview alert preferences here, but signing in gives notifications a real account to follow.
          </Text>
          <Pressable style={[styles.noticeButton, { backgroundColor: theme.accent }]} onPress={() => router.push('/sign-in')}>
            <Text style={styles.noticeButtonText}>Sign in for synced alerts</Text>
          </Pressable>
        </View>
      ) : null}

      <View style={[styles.preferencesCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={styles.sectionTitle}>Alert preferences</Text>

        <View style={styles.preferenceRow}>
          <View style={styles.preferenceBody}>
            <Text style={styles.preferenceTitle}>Push alerts</Text>
            <Text style={styles.preferenceCopy}>Recipe drops, planner nudges, and collection reminders.</Text>
          </View>
          <Switch
            trackColor={{ false: theme.border, true: theme.accentSoft }}
            thumbColor={settings.pushAlerts ? theme.accent : '#FFF8F2'}
            value={settings.pushAlerts}
            onValueChange={setPushAlerts}
          />
        </View>

        <View style={[styles.preferenceRow, styles.rowBorder, { borderTopColor: theme.border }]}>
          <View style={styles.preferenceBody}>
            <Text style={styles.preferenceTitle}>Suggestion alerts</Text>
            <Text style={styles.preferenceCopy}>Let Savorly surface smart picks from your saves and searches.</Text>
          </View>
          <Switch
            trackColor={{ false: theme.border, true: theme.accentSoft }}
            thumbColor={settings.smartSuggestions ? theme.accent : '#FFF8F2'}
            value={settings.smartSuggestions}
            onValueChange={setSmartSuggestions}
          />
        </View>
      </View>

      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Notification health</Text>
        <View style={styles.statusRow}>
          <View style={[styles.statusCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.statusEyebrow, { color: settings.pushAlerts ? theme.accent : '#A16244' }]}>
              {settings.pushAlerts ? 'Live' : 'Paused'}
            </Text>
            <Text style={styles.statusTitle}>{pushStatusTitle}</Text>
            <Text style={styles.statusCopy}>{pushStatusCopy}</Text>
          </View>
          <View style={[styles.statusCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
            <Text style={[styles.statusEyebrow, { color: settings.smartSuggestions ? theme.accent : '#A16244' }]}>
              {settings.smartSuggestions ? 'Personalized' : 'Manual mode'}
            </Text>
            <Text style={styles.statusTitle}>{suggestionStatusTitle}</Text>
            <Text style={styles.statusCopy}>{suggestionStatusCopy}</Text>
          </View>
        </View>
      </View>

      <View style={styles.activitySection}>
        <Text style={styles.sectionTitle}>Recent notification activity</Text>
        <View style={styles.activityList}>
          {activityItems.map((item) => (
            <View key={item.title} style={[styles.activityCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <View style={[styles.activityIconWrap, { backgroundColor: theme.accentSoft }]}>
                <MaterialIcons name={item.icon} size={20} color={theme.accent} />
              </View>
              <View style={styles.activityBody}>
                <Text style={styles.activityTitle}>{item.title}</Text>
                <Text style={styles.activityCopy}>{item.copy}</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      <View style={[styles.actionsCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
        <Text style={styles.sectionTitle}>Quick actions</Text>
        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.accent }]}
            onPress={() => openProtectedRoute(isSignedIn, PROTECTED_AUTH_ROUTES.mealPlanner)}>
            <Text style={styles.actionButtonText}>Open planner</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, { backgroundColor: theme.accentSoft }]} onPress={() => router.push('/settings')}>
            <Text style={[styles.actionButtonSecondaryText, { color: theme.accent }]}>App settings</Text>
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
  noticeCard: {
    marginTop: 18,
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
  },
  noticeTitle: {
    color: '#251712',
    fontSize: 20,
    fontWeight: '800',
  },
  noticeCopy: {
    marginTop: 8,
    color: '#6D5D55',
    fontSize: 14,
    lineHeight: 20,
  },
  noticeButton: {
    alignSelf: 'flex-start',
    marginTop: 14,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  noticeButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  preferencesCard: {
    marginTop: 18,
    borderRadius: 28,
    borderWidth: 1,
    padding: 18,
  },
  sectionTitle: {
    color: '#241611',
    fontSize: 22,
    fontWeight: '900',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    paddingVertical: 16,
  },
  rowBorder: {
    borderTopWidth: 1,
  },
  preferenceBody: {
    flex: 1,
  },
  preferenceTitle: {
    color: '#241611',
    fontSize: 16,
    fontWeight: '800',
  },
  preferenceCopy: {
    marginTop: 4,
    color: '#7B6C63',
    fontSize: 13,
    lineHeight: 18,
  },
  activitySection: {
    marginTop: 24,
  },
  statusRow: {
    gap: 12,
    marginTop: 14,
  },
  statusCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  statusEyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statusTitle: {
    marginTop: 8,
    color: '#241611',
    fontSize: 18,
    fontWeight: '800',
  },
  statusCopy: {
    marginTop: 6,
    color: '#7B6C63',
    fontSize: 13,
    lineHeight: 19,
  },
  activityList: {
    gap: 12,
    marginTop: 14,
  },
  activityCard: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 24,
    borderWidth: 1,
    padding: 16,
  },
  activityIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityBody: {
    flex: 1,
  },
  activityTitle: {
    color: '#241611',
    fontSize: 16,
    fontWeight: '800',
  },
  activityCopy: {
    marginTop: 4,
    color: '#7B6C63',
    fontSize: 13,
    lineHeight: 18,
  },
  actionsCard: {
    marginTop: 24,
    borderRadius: 26,
    borderWidth: 1,
    padding: 18,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  actionButton: {
    flex: 1,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  actionButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '800',
  },
});
