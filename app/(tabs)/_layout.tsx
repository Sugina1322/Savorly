import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Tabs } from 'expo-router';
import { useMemo, useState } from 'react';
import { PanResponder, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { useSettings } from '@/components/settings-provider';
import { SideMenu } from '@/components/side-menu';

export default function TabLayout() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { theme } = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isCompact = width < 390;
  const isWide = width >= 430;
  const tabBarHeight = (isCompact ? 58 : 64) + Math.max(insets.bottom, 8);
  const iconSize = isCompact ? 20 : isWide ? 25 : 22;

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

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarActiveTintColor: theme.accent,
          tabBarInactiveTintColor: '#8E8A84',
          tabBarHideOnKeyboard: true,
          tabBarStyle: {
            height: tabBarHeight,
            paddingTop: isCompact ? 6 : 8,
            paddingBottom: Math.max(insets.bottom, isCompact ? 8 : 10),
            paddingHorizontal: isWide ? 18 : 10,
            backgroundColor: theme.tabBarBackground,
            borderTopColor: theme.tabBarBorder,
          },
          tabBarItemStyle: {
            borderRadius: 14,
          },
          tabBarIconStyle: {
            marginBottom: isCompact ? 1 : 2,
          },
          tabBarLabelStyle: {
            fontSize: isCompact ? 11 : 12,
            fontWeight: '600',
          },
        }}>
        <Tabs.Screen
          name="discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color }) => <MaterialIcons name="restaurant-menu" size={iconSize} color={color} />,
          }}
        />
        <Tabs.Screen
          name="search"
          options={{
            title: 'Search',
            tabBarIcon: ({ color }) => <MaterialIcons name="search" size={iconSize} color={color} />,
          }}
        />
        <Tabs.Screen
          name="saved"
          options={{
            title: 'Saved',
            tabBarIcon: ({ color }) => <MaterialIcons name="favorite-border" size={iconSize} color={color} />,
          }}
        />
      </Tabs>

      <View style={styles.edgeSwipeZone} {...edgeSwipeResponder.panHandlers} />

      <SideMenu visible={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  edgeSwipeZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 24,
    backgroundColor: 'transparent',
  },
});
