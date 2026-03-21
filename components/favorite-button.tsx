import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { GestureResponderEvent, Pressable, StyleSheet } from 'react-native';

type FavoriteButtonProps = {
  active: boolean;
  onPress: () => void;
  variant?: 'light' | 'dark';
};

export function FavoriteButton({ active, onPress, variant = 'light' }: FavoriteButtonProps) {
  const dark = variant === 'dark';

  return (
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
        color={active ? '#C7512D' : dark ? '#FFF8F2' : '#3F2B22'}
      />
    </Pressable>
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
