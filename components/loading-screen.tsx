import { ActivityIndicator, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { BrandMark } from '@/components/brand-mark';

export function LoadingScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.backgroundOrbLarge} />
      <View style={styles.backgroundOrbSmall} />

      <View style={styles.content}>
        <BrandMark />

        <Text style={styles.brand}>Savorly</Text>
        <Text style={styles.tagline}>Save dishes worth craving again.</Text>

        <View style={styles.footer}>
          <ActivityIndicator size="small" color="#C7512D" />
          <Text style={styles.loadingCopy}>Preparing your food board...</Text>
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
  brand: {
    marginTop: 26,
    color: '#22130D',
    fontSize: 36,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  tagline: {
    marginTop: 10,
    color: '#715F56',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    maxWidth: 250,
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  loadingCopy: {
    marginTop: 12,
    color: '#A34E2D',
    fontSize: 14,
    fontWeight: '600',
  },
});
