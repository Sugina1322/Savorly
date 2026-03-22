import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { supabase } from '@/utils/supabase';

function getFirstParam(value: string | string[] | undefined) {
  return typeof value === 'string' ? value : value?.[0];
}

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams<{
    code?: string | string[];
    access_token?: string | string[];
    refresh_token?: string | string[];
  }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPreparing, setIsPreparing] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);
  const hasPreparedSession = useRef(false);

  useEffect(() => {
    if (hasPreparedSession.current) {
      return;
    }

    hasPreparedSession.current = true;

    const code = getFirstParam(params.code);
    const accessToken = getFirstParam(params.access_token);
    const refreshToken = getFirstParam(params.refresh_token);

    async function prepareRecoverySession() {
      setErrorMessage(null);

      try {
        if (code) {
          const { error } = await supabase.auth.exchangeCodeForSession(code);

          if (error) {
            throw error;
          }
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            throw error;
          }
        } else {
          throw new Error('This recovery link is missing the session details needed to reset your password.');
        }

        setIsReady(true);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to open password recovery right now.');
      } finally {
        setIsPreparing(false);
      }
    }

    void prepareRecoverySession();
  }, [params.access_token, params.code, params.refresh_token]);

  async function handleUpdatePassword() {
    setErrorMessage(null);
    setInfoMessage(null);

    if (password.length < 8) {
      setErrorMessage('Choose a password with at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        throw error;
      }

      setInfoMessage('Password updated. You can head back into the app with your new password.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update your password right now.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.shell}>
          <Pressable style={styles.backButton} onPress={() => router.replace('/sign-in')}>
            <MaterialIcons name="arrow-back" size={20} color="#251712" />
            <Text style={styles.backText}>Back to sign in</Text>
          </Pressable>

          <View style={styles.header}>
            <Text style={styles.title}>Reset your password</Text>
            <Text style={styles.subtitle}>Open the recovery link from your email, then set a new password here.</Text>
          </View>

          <View style={styles.card}>
            {isPreparing ? (
              <Text style={styles.statusText}>Preparing your secure reset session...</Text>
            ) : null}

            {!isPreparing && isReady ? (
              <>
                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>New password</Text>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter a new password"
                    placeholderTextColor="#9C8B82"
                    secureTextEntry
                    style={styles.input}
                  />
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.label}>Confirm password</Text>
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Confirm your new password"
                    placeholderTextColor="#9C8B82"
                    secureTextEntry
                    style={styles.input}
                  />
                </View>

                {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
                {infoMessage ? <Text style={styles.infoText}>{infoMessage}</Text> : null}

                <Pressable style={[styles.primaryButton, isSubmitting && styles.buttonDisabled]} onPress={handleUpdatePassword} disabled={isSubmitting}>
                  <Text style={styles.primaryButtonText}>{isSubmitting ? 'Updating password...' : 'Update password'}</Text>
                </Pressable>
              </>
            ) : null}

            {!isPreparing && !isReady && errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
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
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 40,
  },
  shell: {
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
  fieldGroup: {
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
  statusText: {
    color: '#6D5D55',
    fontSize: 14,
    lineHeight: 20,
  },
  errorText: {
    marginTop: 4,
    color: '#B1382F',
    fontSize: 13,
    fontWeight: '600',
  },
  infoText: {
    marginTop: 4,
    color: '#2F6C54',
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 14,
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
});
