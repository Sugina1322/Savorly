import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/components/auth-provider';

export default function SignUpScreen() {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { signUp, isConfigured } = useAuth();
  const isCompact = width < 380 || height < 760;
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSignUp() {
    setErrorMessage(null);

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      await signUp({ name, email, password });
      router.replace('/landing');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create your account right now.');
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
            <Text style={[styles.title, isCompact && styles.titleCompact]}>Create account</Text>
            <Text style={styles.subtitle}>
              Save favorites, track your own recipes, and keep all your best kitchen ideas in one place.
            </Text>
          </View>

          <View style={[styles.card, isCompact && styles.cardCompact]}>
            {!isConfigured ? (
              <View style={styles.noticeCard}>
                <Text style={styles.noticeTitle}>Supabase not configured</Text>
                <Text style={styles.noticeCopy}>
                  Add your `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` before testing sign up.
                </Text>
              </View>
            ) : null}

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Name</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#9C8B82"
                style={styles.input}
              />
            </View>

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
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Create a password"
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

            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Confirm password</Text>
              <View style={styles.passwordWrap}>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="Confirm your password"
                  placeholderTextColor="#9C8B82"
                  secureTextEntry={!showConfirmPassword}
                  style={styles.passwordInput}
                />
                <Pressable onPress={() => setShowConfirmPassword((value) => !value)}>
                  <MaterialIcons
                    name={showConfirmPassword ? 'visibility-off' : 'visibility'}
                    size={20}
                    color="#7D6B62"
                  />
                </Pressable>
              </View>
            </View>

            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

            <Pressable style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]} onPress={handleSignUp} disabled={isSubmitting}>
              <Text style={styles.primaryButtonText}>{isSubmitting ? 'Creating account...' : 'Create account'}</Text>
            </Pressable>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            <View style={styles.socialColumn}>
              <Pressable style={styles.socialButton}>
                <MaterialIcons name="mail-outline" size={18} color="#2A1A14" />
                <Text style={styles.socialLabel}>Google</Text>
              </Pressable>
              <Pressable style={styles.socialButton}>
                <MaterialIcons name="code" size={18} color="#2A1A14" />
                <Text style={styles.socialLabel}>GitHub</Text>
              </Pressable>
            </View>

            <Pressable style={styles.footerRow} onPress={() => router.replace('/sign-in')}>
              <Text style={styles.footerCopy}>Already have an account?</Text>
              <Text style={styles.footerAction}>Sign in</Text>
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
    flexGrow: 1,
    paddingBottom: 40,
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
