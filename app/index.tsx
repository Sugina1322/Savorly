import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandMark } from '@/components/brand-mark';
import { useAuth } from '@/components/auth-provider';

export default function AuthWelcomeScreen() {
  const { width, height } = useWindowDimensions();
  const { accountError, isAccountReady, isLoading, isProfileLoading, user } = useAuth();
  const isCompact = width < 380;
  const brandMarkSize = width < 360 ? 124 : width < 430 ? 148 : 164;
  const verticalOffset = height < 760 ? 24 : 48;

  useEffect(() => {
    if (isLoading || isProfileLoading) {
      return;
    }

    if (user && accountError) {
      router.replace('/auth/callback');
      return;
    }

    if (user && isAccountReady) {
      router.replace('/landing');
    }
  }, [accountError, isAccountReady, isLoading, isProfileLoading, user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.shell}>
        <View style={styles.backgroundOrbLarge} />
        <View style={styles.backgroundOrbSmall} />

        <View style={[styles.contentWrap, { paddingTop: verticalOffset }]}>
          <View style={styles.hero}>
            <BrandMark size={brandMarkSize} />
            <Text style={[styles.brand, isCompact && styles.brandCompact]}>Savorly</Text>
            <Text style={[styles.tagline, isCompact && styles.taglineCompact]}>
              We find ways to make home cooking feel easy, inspiring, and worth sharing.
            </Text>
          </View>

          <View style={styles.actions}>
            <View style={styles.actionRow}>
              <Pressable style={[styles.primaryButton, styles.rowButton]} onPress={() => router.push('/sign-in')}>
                <Text style={styles.primaryButtonText}>LOGIN</Text>
              </Pressable>

              <Pressable style={[styles.secondaryButton, styles.rowButton]} onPress={() => router.replace('/landing')}>
                <MaterialIcons name="travel-explore" size={16} color="#5A4337" />
                <Text style={styles.secondaryButtonText}>Guest</Text>
              </Pressable>
            </View>

            <Pressable style={styles.linkRow} onPress={() => router.push('/sign-up')}>
              <Text style={styles.linkCopy}>New here?</Text>
              <Text style={styles.linkAction}>Create an account</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCF5EE',
  },
  shell: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 36,
    paddingBottom: 32,
    backgroundColor: '#FCF5EE',
  },
  contentWrap: {
    flex: 1,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  backgroundOrbLarge: {
    position: 'absolute',
    top: 100,
    right: -44,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: '#F4D7BF',
    opacity: 0.72,
  },
  backgroundOrbSmall: {
    position: 'absolute',
    bottom: 110,
    left: -24,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#F7E5D8',
  },
  hero: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    marginTop: 22,
    color: '#251712',
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandCompact: {
    fontSize: 30,
  },
  tagline: {
    marginTop: 14,
    maxWidth: 300,
    color: '#6C5A51',
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  taglineCompact: {
    fontSize: 15,
    lineHeight: 22,
  },
  actions: {
    marginTop: 36,
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  rowButton: {
    flex: 1,
  },
  primaryButton: {
    borderRadius: 20,
    backgroundColor: '#C7512D',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: '#FFF8F2',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.6,
  },
  secondaryButton: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#EEDBCF',
    backgroundColor: '#FFF8F2',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 15,
  },
  secondaryButtonText: {
    color: '#5A4337',
    fontSize: 14,
    fontWeight: '800',
  },
  linkRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  linkCopy: {
    color: '#7A6A62',
    fontSize: 14,
  },
  linkAction: {
    color: '#B44E2B',
    fontSize: 14,
    fontWeight: '800',
  },
});
