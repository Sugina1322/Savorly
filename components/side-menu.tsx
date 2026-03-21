import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';

import { useAuth } from '@/components/auth-provider';
import { useRecipes } from '@/components/recipes-provider';

type SideMenuProps = {
  visible: boolean;
  onClose: () => void;
};

const accountItems = [
  {
    icon: 'person-outline' as const,
    title: 'Edit profile',
    subtitle: 'Name, photo, bio, and food preferences',
  },
  {
    icon: 'favorite-border' as const,
    title: 'Taste profile',
    subtitle: 'Spicy level, cuisines, and dietary needs',
  },
  {
    icon: 'notifications-none' as const,
    title: 'Notifications',
    subtitle: 'Recipe drops, saves, and reminder alerts',
  },
];

const supportItems = [
  {
    icon: 'info-outline' as const,
    title: 'About Savorly',
    subtitle: 'Learn more about the app',
    action: () => router.push('/modal'),
  },
  {
    icon: 'security' as const,
    title: 'Privacy',
    subtitle: 'Manage account and data settings',
  },
  {
    icon: 'help-outline' as const,
    title: 'Help center',
    subtitle: 'FAQs and support options',
  },
];

export function SideMenu({ visible, onClose }: SideMenuProps) {
  const { signOut } = useAuth();
  const { savedCount } = useRecipes();
  const [smartSuggestions, setSmartSuggestions] = useState(true);
  const [pushAlerts, setPushAlerts] = useState(false);
  const translateX = useRef(new Animated.Value(-360)).current;
  const panelWidth = 360;

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

        <Animated.View style={[styles.panel, { transform: [{ translateX }] }]} {...closeSwipeResponder.panHandlers}>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.topRow}>
              <Text style={styles.topLabel}>Menu</Text>
              <Pressable style={styles.closeButton} onPress={onClose}>
                <MaterialIcons name="close" size={20} color="#2A1A14" />
              </Pressable>
            </View>

            <View style={styles.heroCard}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>JS</Text>
              </View>

              <View style={styles.heroBody}>
                <Text style={styles.eyebrow}>Your menu</Text>
                <Text style={styles.name}>Jean Santos</Text>
                <Text style={styles.handle}>@jeansavorly</Text>
                <Text style={styles.bio}>Saving comfort food, quick lunches, and desserts worth repeating.</Text>
              </View>

              <Pressable style={styles.editPill}>
                <Text style={styles.editPillText}>Edit</Text>
              </Pressable>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{savedCount}</Text>
                <Text style={styles.statLabel}>Saved recipes</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>7</Text>
                <Text style={styles.statLabel}>Collections</Text>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Account</Text>
              <View style={styles.listCard}>
                {accountItems.map((item, index) => (
                  <Pressable
                    key={item.title}
                    style={[styles.listRow, index < accountItems.length - 1 ? styles.rowBorder : undefined]}>
                    <View style={styles.leadingIcon}>
                      <MaterialIcons name={item.icon} size={22} color="#A24D2C" />
                    </View>
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={22} color="#AA9A91" />
                  </Pressable>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Preferences</Text>
              <View style={styles.preferenceCard}>
                <View style={styles.preferenceRow}>
                  <View style={styles.preferenceText}>
                    <Text style={styles.rowTitle}>Smart suggestions</Text>
                    <Text style={styles.rowSubtitle}>Recommend dishes based on what you save and search.</Text>
                  </View>
                  <Switch
                    trackColor={{ false: '#E8D9CE', true: '#E28A64' }}
                    thumbColor={smartSuggestions ? '#C7512D' : '#FFF8F2'}
                    value={smartSuggestions}
                    onValueChange={setSmartSuggestions}
                  />
                </View>

                <View style={[styles.preferenceRow, styles.rowBorder]}>
                  <View style={styles.preferenceText}>
                    <Text style={styles.rowTitle}>Push alerts</Text>
                    <Text style={styles.rowSubtitle}>Get notified when new recipe collections arrive.</Text>
                  </View>
                  <Switch
                    trackColor={{ false: '#E8D9CE', true: '#E28A64' }}
                    thumbColor={pushAlerts ? '#C7512D' : '#FFF8F2'}
                    value={pushAlerts}
                    onValueChange={setPushAlerts}
                  />
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Support</Text>
              <View style={styles.listCard}>
                {supportItems.map((item, index) => (
                  <Pressable
                    key={item.title}
                    style={[styles.listRow, index < supportItems.length - 1 ? styles.rowBorder : undefined]}
                    onPress={() => {
                      item.action?.();
                      onClose();
                    }}>
                    <View style={styles.leadingIconMuted}>
                      <MaterialIcons name={item.icon} size={22} color="#6E625D" />
                    </View>
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle}>{item.title}</Text>
                      <Text style={styles.rowSubtitle}>{item.subtitle}</Text>
                    </View>
                    <MaterialIcons name="chevron-right" size={22} color="#AA9A91" />
                  </Pressable>
                ))}
              </View>
            </View>

            <Pressable
              style={styles.logoutButton}
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
    width: '86%',
    maxWidth: 360,
    height: '100%',
    backgroundColor: '#FBF4ED',
    paddingTop: 54,
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
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#C7512D',
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
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingVertical: 18,
    paddingHorizontal: 12,
  },
  statNumber: {
    color: '#261712',
    fontSize: 24,
    fontWeight: '900',
  },
  statLabel: {
    marginTop: 4,
    color: '#7B6C63',
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 24,
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
