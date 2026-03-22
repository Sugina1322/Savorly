import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';

export function LoadingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundOrbLarge} />
      <View style={styles.backgroundOrbSmall} />

      <View style={styles.content}>
        <BrandMark />
        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#C7512D" />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FDF5EE',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  backgroundOrbLarge: {
    position: 'absolute',
    top: 110,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#F4D7BF',
    opacity: 0.7,
  },
  backgroundOrbSmall: {
    position: 'absolute',
    bottom: 120,
    left: -30,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#F7E5D8',
  },
  footer: {
    marginTop: 20,
    alignItems: 'center',
  },
});
