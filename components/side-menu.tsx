import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, type Href } from 'expo-router';
import { type ComponentProps, useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import { useRecipes } from '@/components/recipes-provider';
import { useSettings } from '@/components/settings-provider';
import { getAvatarOption, getDisplayName, getHandle, getInitials } from '@/utils/profile';

type SideMenuProps = {
  visible: boolean;
  onClose: () => void;
};

type MenuItem = {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  title: string;
  subtitle: string;
  href: Href;
  guestHref?: Href;
};

const accountItems: MenuItem[] = [
  {
    icon: 'person-outline' as const,
    title: 'Edit profile',
    subtitle: 'Name, photo, bio, and food preferences',
    href: '/edit-profile',
    guestHref: '/sign-in',
  },
  {
    icon: 'favorite-border' as const,
    title: 'Taste profile',
    subtitle: 'Spicy level, cuisines, and dietary needs',
    href: '/taste-profile',
    guestHref: '/sign-in',
  },
  {
    icon: 'notifications-none' as const,
    title: 'Notifications',
    subtitle: 'Manage alerts and reminder preferences',
    href: '/notifications',
  },
];

const supportItems: MenuItem[] = [
  {
    icon: 'info-outline' as const,
    title: 'About Savorly',
    subtitle: 'Learn more about the app',
    href: '/modal',
  },
  {
    icon: 'security' as const,
    title: 'Settings',
    subtitle: 'Theme, language, alerts, and app preferences',
    href: '/settings',
  },
  {
    icon: 'help-outline' as const,
    title: 'Help center',
    subtitle: 'FAQs and support options',
    href: '/help-center',
  },
];

export function SideMenu({ visible, onClose }: SideMenuProps) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { isAccountReady, profile, signOut, user } = useAuth();
  const { kitchenPulse, savedCount, smartCollections } = useRecipes();
  const { setPushAlerts, setSmartSuggestions, settings, theme } = useSettings();
  const panelWidth = Math.min(Math.max(width * 0.86, 292), 360);
  const isCompact = width < 390;
  const translateX = useRef(new Animated.Value(-panelWidth)).current;
  const displayName = getDisplayName(profile?.full_name, user?.email);
  const handle = getHandle(profile?.username, profile?.email ?? user?.email);
  const initials = getInitials(displayName);
  const avatar = getAvatarOption(profile?.avatar_key);
  const isGuest = !user;

  const closeSwipeResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) =>
          visible && gestureState.dx < -10 && Math.abs(gestureState.dy) < 20,
        onPanResponderMove: (_, gestureState) => {
          if (gestureState.dx < 0) {
            translateX.setValue(Math.max(gestureState.dx, -panelWidth));
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          if (gestureState.dx < -80) {
            onClose();
            return;
          }

          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        },
      }),
    [onClose, panelWidth, translateX, visible]
  );

  useEffect(() => {
    Animated.timing(translateX, {
      toValue: visible ? 0 : -panelWidth,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [panelWidth, translateX, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <Animated.View
          style={[
            styles.panel,
            {
              width: panelWidth,
              paddingTop: Math.max(insets.top, 22) + 18,
              paddingBottom: Math.max(insets.bottom, 12),
              transform: [{ translateX }],
              backgroundColor: theme.appBackground,
            },
          ]}
          {...closeSwipeResponder.panHandlers}>
          <ScrollView
            contentContainerStyle={[styles.content, isCompact && styles.contentCompact]}
            showsVerticalScrollIndicator={false}>
            <View style={styles.topRow}>
              <Text style={[styles.topLabel, { color: theme.accent }]}>Menu</Text>
              <Pressable style={[styles.closeButton, { backgroundColor: theme.cardBackground }]} onPress={onClose}>
                <MaterialIcons name="close" size={20} color="#2A1A14" />
              </Pressable>
            </View>

            <View style={[styles.heroCard, isCompact && styles.heroCardCompact, { backgroundColor: theme.heroBackground }]}>
              <View style={[styles.avatar, isCompact && styles.avatarCompact, !isGuest && { backgroundColor: avatar.backgroundColor }]}>
                <Text style={styles.avatarText}>{isGuest ? initials : avatar.emoji}</Text>
              </View>

              <View style={styles.heroBody}>
                <Text style={[styles.eyebrow, { color: theme.heroAccent }]}>{isGuest ? 'Guest mode' : 'Your menu'}</Text>
                <Text style={[styles.name, isCompact && styles.nameCompact]} numberOfLines={2}>{displayName}</Text>
                <Text style={styles.handle}>{handle}</Text>
                <Text style={[styles.bio, isCompact && styles.bioCompact]}>
                  {isGuest
                    ? 'Browse recipes in guest mode, or sign in to save your favorites and build your own account.'
                    : isAccountReady
                      ? 'Your profile is ready. Save favorites, build collections, and keep your best kitchen ideas together.'
                      : 'We are still preparing your account details.'}
                </Text>
              </View>

              <Pressable
                style={[styles.editPill, { backgroundColor: theme.cardBackground }]}
                onPress={() => {
                  onClose();
                  if (isGuest) {
                    router.push('/sign-in');
                    return;
                  }

                  router.push('/edit-profile');
                }}>
                <Text style={[styles.editPillText, { color: theme.accent }]}>{isGuest ? 'Sign in' : 'Edit'}</Text>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.statNumber}>{savedCount}</Text>
                <Text style={styles.statLabel}>Saved recipes</Text>
              </View>
              <View style={[styles.statCard, { backgroundColor: theme.cardBackground }]}>
                <Text style={styles.statNumber}>{smartCollections.length}</Text>
                <Text style={styles.statLabel}>Smart collections</Text>
              </View>
            </View>

            <View style={[styles.profilePulseCard, { backgroundColor: theme.cardBackground, borderColor: theme.border }]}>
              <Text style={[styles.profilePulseLabel, { color: theme.accent }]}>Kitchen pulse</Text>
              <Text style={styles.profilePulseTitle}>{kitchenPulse.category}</Text>
              <Text style={styles.profilePulseCopy}>
                {kitchenPulse.reason}
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={[styles.listCard, { backgroundColor: theme.cardBackground }]}>
                {accountItems.map((item, index) => (
                  <Pressable
                    key={item.title}
                    style={[
                      styles.listRow,
                      isCompact && styles.listRowCompact,
                      index < accountItems.length - 1 ? [styles.rowBorder, { borderTopColor: theme.border }] : undefined,
                    ]}
                    onPress={() => {
                      onClose();
                      router.push(isGuest ? item.guestHref ?? item.href : item.href);
                    }}>
                    <View style={[styles.leadingIcon, { backgroundColor: theme.accentSoft }]}>
                      <MaterialIcons name={item.icon} size={22} color={theme.accent} />
                    </View>
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                    </View>
                    {!isCompact ? <MaterialIcons name="chevron-right" size={22} color={theme.accent} /> : null}
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <View style={[styles.preferenceCard, { backgroundColor: theme.cardBackground }]}>
                <View style={[styles.preferenceRow, isCompact && styles.preferenceRowCompact]}>
                  <View style={styles.preferenceText}>
                    <Text style={styles.rowTitle}>Smart suggestions</Text>
                    <Text style={styles.rowSubtitle}>Recommend dishes based on what you save and search.</Text>
                  </View>
                  <Switch
                    trackColor={{ false: theme.border, true: theme.accentSoft }}
                    thumbColor={settings.smartSuggestions ? theme.accent : '#FFF8F2'}
                    value={settings.smartSuggestions}
                    onValueChange={setSmartSuggestions}
                  />
                </View>

                <View style={[styles.preferenceRow, isCompact && styles.preferenceRowCompact, styles.rowBorder, { borderTopColor: theme.border }]}>
                  <View style={styles.preferenceText}>
                    <Text style={styles.rowTitle}>Push alerts</Text>
                    <Text style={styles.rowSubtitle}>Get notified when new recipe collections arrive.</Text>
                  </View>
                  <Switch
                    trackColor={{ false: theme.border, true: theme.accentSoft }}
                    thumbColor={settings.pushAlerts ? theme.accent : '#FFF8F2'}
                    value={settings.pushAlerts}
                    onValueChange={setPushAlerts}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support</Text>
              <View style={[styles.listCard, { backgroundColor: theme.cardBackground }]}>
                {supportItems.map((item, index) => (
                  <Pressable
                    key={item.title}
                    style={[
                      styles.listRow,
                      isCompact && styles.listRowCompact,
                      index < supportItems.length - 1 ? [styles.rowBorder, { borderTopColor: theme.border }] : undefined,
                    ]}
                    onPress={() => {
                      onClose();
                      router.push(item.href);
                    }}>
                    <View style={[styles.leadingIconMuted, { backgroundColor: theme.accentSoft }]}>
                      <MaterialIcons name={item.icon} size={22} color={theme.accent} />
                    </View>
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                    </View>
                    {!isCompact ? <MaterialIcons name="chevron-right" size={22} color={theme.accent} /> : null}
                  </Pressable>
                ))}
              </View>
            </View>

            {isGuest ? (
              <Pressable
                style={[styles.logoutButton, { backgroundColor: theme.accent }]}
                onPress={() => {
                  onClose();
                  router.push('/sign-in');
                }}>
                <MaterialIcons name="login" size={18} color="#FFFFFF" />
                <Text style={styles.logoutText}>Sign in</Text>
              </Pressable>
            ) : (
              <Pressable
                style={[styles.logoutButton, { backgroundColor: theme.accent }]}
                onPress={async () => {
                  try {
                    await signOut();
                  } catch (error) {
                    console.warn('Failed to sign out', error);
                  } finally {
                    onClose();
                    router.replace('/');
                  }
                }}>
                <MaterialIcons name="logout" size={18} color="#FFFFFF" />
                <Text style={styles.logoutText}>Log out</Text>
              </Pressable>
            )}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 12, 8, 0.32)',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  panel: {
    height: '100%',
    backgroundColor: '#FBF4ED',
    shadowColor: '#140C08',
    shadowOpacity: 0.18,
    shadowRadius: 16,
    shadowOffset: { width: 6, height: 0 },
    elevation: 8,
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 36,
  },
  contentCompact: {
    paddingHorizontal: 14,
    paddingBottom: 28,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  topLabel: {
    color: '#5C463A',
    fontSize: 14,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF8F2',
  },
  heroCard: {
    borderRadius: 30,
    padding: 20,
    backgroundColor: '#201612',
  },
  heroCardCompact: {
    borderRadius: 24,
    padding: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C7512D',
  },
  avatarCompact: {
    width: 60,
    height: 60,
    borderRadius: 20,
  },
  avatarText: {
    color: '#FFF8F2',
    fontSize: 28,
    fontWeight: '900',
  },
  heroBody: {
    marginTop: 18,
  },
  eyebrow: {
    color: '#FFB28B',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.4,
  },
  name: {
    marginTop: 8,
    color: '#FFF6F0',
    fontSize: 30,
    fontWeight: '900',
  },
  nameCompact: {
    fontSize: 24,
    lineHeight: 28,
  },
  handle: {
    marginTop: 4,
    color: '#E4C7B7',
    fontSize: 14,
    fontWeight: '600',
  },
  bio: {
    marginTop: 12,
    color: '#D6C2B8',
    fontSize: 15,
    lineHeight: 22,
  },
  bioCompact: {
    fontSize: 14,
    lineHeight: 20,
  },
  editPill: {
    alignSelf: 'flex-start',
    marginTop: 18,
    borderRadius: 999,
    backgroundColor: '#FFF8F2',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  editPillText: {
    color: '#4D3227',
    fontSize: 13,
    fontWeight: '800',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 0,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  statNumber: {
    color: '#261712',
    fontSize: 20,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 4,
    color: '#7B6C63',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
  },
  profilePulseCard: {
    marginTop: 16,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
  },
  profilePulseLabel: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  profilePulseTitle: {
    marginTop: 8,
    color: '#241611',
    fontSize: 20,
    fontWeight: '900',
  },
  profilePulseCopy: {
    marginTop: 8,
    color: '#7B6C63',
    fontSize: 13,
    lineHeight: 19,
  },
  sectionTitle: {
    color: '#241611',
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 12,
  },
  listCard: {
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  listRowCompact: {
    alignItems: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  preferenceCard: {
    borderRadius: 26,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  preferenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 18,
  },
  preferenceRowCompact: {
    alignItems: 'flex-start',
  },
  rowBorder: {
    borderTopWidth: 1,
    borderTopColor: '#F0E1D6',
  },
  leadingIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FBE8DB',
    marginRight: 14,
  },
  leadingIconMuted: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F4ECE7',
    marginRight: 14,
  },
  rowBody: {
    flex: 1,
  },
  preferenceText: {
    flex: 1,
    paddingRight: 10,
  },
  rowTitle: {
    color: '#241611',
    fontSize: 16,
    fontWeight: '800',
  },
  rowSubtitle: {
    marginTop: 4,
    color: '#7B6C63',
    fontSize: 13,
    lineHeight: 18,
  },
  logoutButton: {
    marginTop: 24,
    borderRadius: 18,
    backgroundColor: '#C7512D',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
