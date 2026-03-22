import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import { resolveProtectedAuthPath } from '@/utils/auth-gate';
import { getOAuthDebugState, getOAuthRedirectUrl } from '@/utils/oauth';

export default function AuthCallbackScreen() {
  const params = useLocalSearchParams<{ redirectTo?: string | string[] }>();
  const { isLoading, user } = useAuth();
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const redirectTo = resolveProtectedAuthPath(params.redirectTo);
  const oauthDebug = getOAuthDebugState();
  const expectedRedirectUrl = getOAuthRedirectUrl();
  const fallbackError =
    hasTimedOut && !user
      ? oauthDebug.error ?? (oauthDebug.lastStep ? `OAuth stopped at: ${oauthDebug.lastStep}` : null)
      : null;

  useEffect(() => {
    const timeout = setTimeout(() => {
      setHasTimedOut(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    if (user) {
      if (redirectTo) {
        router.replace({
          pathname: '/account-setup',
          params: { redirectTo },
        });
        return;
      }

      router.replace('/account-setup');
      return;
    }

    if (!user && hasTimedOut) {
      if (!fallbackError) {
        if (redirectTo) {
          router.replace({
            pathname: '/sign-in',
            params: { redirectTo },
          });
          return;
        }

        router.replace('/sign-in');
      }
    }
  }, [fallbackError, hasTimedOut, isLoading, redirectTo, user]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.content}>
        <ActivityIndicator size="large" color="#C7512D" />
        <Text style={styles.title}>
          {fallbackError ? 'We hit a Google sign-in problem' : user ? 'Google sign-in complete' : 'Finishing sign in...'}
        </Text>
        <Text style={styles.copy}>
          {fallbackError
              ? fallbackError
            : hasTimedOut
              ? 'We could not finish Google sign in. Please try again from the sign-in screen.'
              : user
                ? 'Your Google sign-in worked. We are moving you into account setup now.'
                : 'Please wait while we finish your Google authentication.'}
        </Text>

        {fallbackError && oauthDebug.lastStep ? (
          <Text style={styles.debugText}>Step: {oauthDebug.lastStep}</Text>
        ) : null}

        {fallbackError && expectedRedirectUrl ? (
          <Text style={styles.debugText}>Expected redirect: {expectedRedirectUrl}</Text>
        ) : null}

        {fallbackError && oauthDebug.lastUrl ? (
          <Text style={styles.debugText}>Last URL: {oauthDebug.lastUrl}</Text>
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
  debugText: {
    marginTop: 10,
    color: '#7A5A4B',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
});
