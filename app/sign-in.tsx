import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';
import { getProtectedRouteNotice, resolveProtectedAuthPath } from '@/utils/auth-gate';

export default function SignInScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ redirectTo?: string | string[] }>();
  const { signIn, resetPassword, signInWithProvider, isAccountReady, isConfigured, user } = useAuth();
  const isCompact = width < 380 || height < 760;
  const redirectTo = resolveProtectedAuthPath(params.redirectTo);
  const redirectNotice = getProtectedRouteNotice(redirectTo);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const openAuthCallback = useCallback(() => {
    if (redirectTo) {
      router.replace({
        pathname: '/auth/callback',
        params: { redirectTo },
      });
      return;
    }

    router.replace('/auth/callback');
  }, [redirectTo]);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (isAccountReady) {
      router.replace(redirectTo ?? '/landing');
      return;
    }

    openAuthCallback();
  }, [isAccountReady, openAuthCallback, redirectTo, user]);

  async function handleSignIn() {
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      openAuthCallback();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleFacebookSignIn() {
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      await signInWithProvider('facebook');
      openAuthCallback();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in with Facebook right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      await signInWithProvider('google');
      openAuthCallback();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to sign in with Google right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResetPassword() {
    setErrorMessage(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      await resetPassword(email);
      setInfoMessage('Password reset email sent. Open the link in your inbox to choose a new password.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to send a password reset email right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 12) + 8,
            paddingHorizontal: isCompact ? 16 : 18,
          },
        ]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.contentWrap}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={20} color="#251712" />
            <Text style={styles.backText}>Back</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={[styles.title, isCompact && styles.titleCompact]}>Sign in</Text>
            <Text style={styles.subtitle}>Pick up where your saved recipes, searches, and cravings left off.</Text>
          </View>

          <View style={[styles.card, isCompact && styles.cardCompact]}>
            {redirectNotice ? (
              <View style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>{redirectNotice.title}</Text>
                <Text style={styles.noticeCopy}>{redirectNotice.copy}</Text>
              </View>
            ) : null}

            {!isConfigured ? (
              <View style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>Supabase not configured</Text>
                <Text style={styles.noticeCopy}>
                  Add your `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` before testing sign in.
                </Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor="#9C8B82"
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.passwordHeader}>
                <Text style={styles.label}>Password</Text>
                <Pressable onPress={handleResetPassword} disabled={isSubmitting}>
                  <Text style={[styles.helperAction, isSubmitting && styles.buttonDisabled]}>Forgot password?</Text>
                </Pressable>
              </View>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="#9C8B82"
                  secureTextEntry={!showPassword}
                  style={styles.passwordInput}
                />
                <Pressable onPress={() => setShowPassword((value) => !value)}>
                  <MaterialIcons
                    name={showPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#7D6B62"
                  />
                </Pressable>
              </View>
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
            {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}

            <Pressable style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]} onPress={handleSignIn} disabled={isSubmitting}>
              <Text style={styles.primaryButtonText}>{isSubmitting ? 'Signing in...' : 'Continue'}</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialColumn}>
              <Pressable style={[styles.socialButton, isSubmitting && styles.buttonDisabled]} onPress={handleGoogleSignIn} disabled={isSubmitting}>
                <MaterialIcons name="mail-outline" size={18} color="#2A1A14" />
                <Text style={styles.socialLabel}>Google</Text>
              </Pressable>
              <Pressable style={[styles.socialButton, isSubmitting && styles.buttonDisabled]} onPress={handleFacebookSignIn} disabled={isSubmitting}>
                <MaterialIcons name="facebook" size={18} color="#2A1A14" />
                <Text style={styles.socialLabel}>Facebook</Text>
              </Pressable>
            </View>

            <Pressable style={styles.footerRow} onPress={() => router.push('/sign-up')}>
              <Text style={styles.footerCopy}>No account yet?</Text>
              <Text style={styles.footerAction}>Create one</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FCF5EE',
  },
  content: {
    paddingBottom: 40,
    flexGrow: 1,
  },
  contentWrap: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#FFF8F2',
    borderWidth: 1,
    borderColor: '#F0DDD0',
  },
  backText: {
    color: '#251712',
    fontSize: 14,
    fontWeight: '700',
  },
  header: {
    marginTop: 18,
    marginBottom: 20,
  },
  title: {
    color: '#251712',
    fontSize: 30,
    fontWeight: '900',
  },
  titleCompact: {
    fontSize: 27,
  },
  subtitle: {
    marginTop: 8,
    color: '#6D5D55',
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderWidth: 1,
    borderColor: '#F0DDD0',
  },
  cardCompact: {
    padding: 18,
  },
  fieldGroup: {
    marginTop: 6,
    marginBottom: 14,
  },
  label: {
    color: '#37241D',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#EEDBCF',
    borderRadius: 18,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#251712',
    fontSize: 15,
  },
  passwordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  helperAction: {
    color: '#B44E2B',
    fontSize: 13,
    fontWeight: '700',
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EEDBCF',
    borderRadius: 18,
    backgroundColor: '#FFF9F5',
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    color: '#251712',
    fontSize: 15,
  },
  primaryButton: {
    marginTop: 10,
    borderRadius: 18,
    backgroundColor: '#C7512D',
    alignItems: 'center',
    paddingVertical: 15,
  },
  primaryButtonText: {
    color: '#FFF8F2',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  noticeCard: {
    marginBottom: 14,
    borderRadius: 18,
    backgroundColor: '#FFF4EC',
    borderWidth: 1,
    borderColor: '#F2D6C4',
    padding: 14,
  },
  noticeTitle: {
    color: '#8F4526',
    fontSize: 14,
    fontWeight: '800',
  },
  noticeCopy: {
    marginTop: 4,
    color: '#7A5A4B',
    fontSize: 13,
    lineHeight: 18,
  },
  errorText: {
    marginTop: 2,
    marginBottom: 8,
    color: '#B1382F',
    fontSize: 13,
    fontWeight: '600',
  },
  infoText: {
    marginTop: 2,
    marginBottom: 8,
    color: '#2F6C54',
    fontSize: 13,
    fontWeight: '600',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 22,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#F0DDD0',
  },
  dividerText: {
    color: '#8A7B73',
    fontSize: 12,
    fontWeight: '700',
  },
  socialColumn: {
    gap: 10,
    marginTop: 18,
  },
  socialButton: {
    borderRadius: 18,
    backgroundColor: '#FFF9F5',
    borderWidth: 1,
    borderColor: '#EEDBCF',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 14,
  },
  socialLabel: {
    color: '#2A1A14',
    fontSize: 14,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
    paddingVertical: 4,
  },
  footerCopy: {
    color: '#7A6A62',
    fontSize: 14,
  },
  footerAction: {
    color: '#B44E2B',
    fontSize: 14,
    fontWeight: '800',
  },
});
