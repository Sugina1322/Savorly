import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useEffect, useRef } from 'react';
import { Animated, GestureResponderEvent, Pressable, StyleSheet } from 'react-native';

import { useSettings } from '@/components/settings-provider';

type FavoriteButtonProps = {
  active: boolean;
  onPress: () => void;
  variant?: 'light' | 'dark';
};

export function FavoriteButton({ active, onPress, variant = 'light' }: FavoriteButtonProps) {
  const dark = variant === 'dark';
  const { theme } = useSettings();
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: active ? 1.14 : 0.94,
        useNativeDriver: true,
        speed: 18,
        bounciness: 10,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 8,
      }),
    ]).start();
  }, [active, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Pressable
        onPress={(event: GestureResponderEvent) => {
          event.stopPropagation();
          onPress();
        }}
        hitSlop={10}
        style={[
          styles.button,
          dark ? styles.buttonDark : styles.buttonLight,
          active && (dark ? styles.buttonDarkActive : styles.buttonLightActive),
        ]}>
        <MaterialIcons
          name={active ? 'favorite' : 'favorite-border'}
          size={18}
          color={active ? theme.accent : dark ? '#FFF8F2' : '#3F2B22'}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonLight: {
    backgroundColor: 'rgba(255, 248, 242, 0.96)',
  },
  buttonLightActive: {
    backgroundColor: '#FFF1EA',
  },
  buttonDark: {
    backgroundColor: 'rgba(35, 21, 15, 0.7)',
  },
  buttonDarkActive: {
    backgroundColor: 'rgba(255, 248, 242, 0.96)',
  },
});
