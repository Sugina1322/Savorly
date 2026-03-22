import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';

export default function AccountSetupScreen() {
  const { accountError, isAccountReady, isLoading, isProfileLoading, refreshAccount, signOut, user } = useAuth();

  useEffect(() => {
    if (isLoading || isProfileLoading) {
      return;
    }

    if (!user) {
      router.replace('/sign-in');
      return;
    }

    if (isAccountReady) {
      router.replace('/landing');
    }
  }, [isAccountReady, isLoading, isProfileLoading, user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#C7512D" />
        <Text style={styles.title}>{accountError ? 'We could not finish your account' : 'Setting up your account...'}</Text>
        <Text style={styles.copy}>
          {accountError
            ? accountError
            : 'Please wait while we create and prepare your Savorly account.'}
        </Text>

        {accountError ? (
          <View style={styles.actions}>
            <Pressable
              style={styles.primaryButton}
              onPress={() => {
                refreshAccount().catch((error: unknown) => {
                  console.warn('Failed to retry account setup', error);
                });
              }}>
              <Text style={styles.primaryButtonText}>Retry setup</Text>
            </Pressable>

            <Pressable
              style={styles.secondaryButton}
              onPress={async () => {
                try {
                  await signOut();
                } catch (error) {
                  console.warn('Failed to sign out after account setup error', error);
                } finally {
                  router.replace('/sign-in');
                }
              }}>
              <Text style={styles.secondaryButtonText}>Back to sign in</Text>
            </Pressable>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCF5EE',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  title: {
    marginTop: 18,
    color: '#251712',
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
  },
  copy: {
    marginTop: 10,
    color: '#6D5D55',
    fontSize: 14,
    lineHeight: 21,
    textAlign: 'center',
  },
  actions: {
    marginTop: 24,
    width: '100%',
    maxWidth: 320,
    gap: 10,
  },
  primaryButton: {
    borderRadius: 18,
    backgroundColor: '#C7512D',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFF8F2',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    borderRadius: 18,
    backgroundColor: '#FFF8F2',
    borderWidth: 1,
    borderColor: '#F0DDD0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: '#5A4337',
    fontSize: 15,
    fontWeight: '800',
  },
});
