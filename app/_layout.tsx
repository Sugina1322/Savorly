import { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '@/utils/webcrypto';

import { AuthProvider } from '@/components/auth-provider';
import { LoadingScreen } from '@/components/loading-screen';
import { RecipesProvider } from '@/components/recipes-provider';
import { SettingsProvider } from '@/components/settings-provider';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [isBooting, setIsBooting] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setIsBooting(false);
    }, 1800);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <SettingsProvider>
        <AuthProvider>
          <RecipesProvider>
            {isBooting ? (
              <LoadingScreen />
            ) : (
            <Stack>
              <Stack.Screen name="index" options={{ headerShown: false }} />
              <Stack.Screen name="auth/callback" options={{ headerShown: false }} />
              <Stack.Screen name="account-setup" options={{ headerShown: false }} />
              <Stack.Screen name="sign-in" options={{ headerShown: false }} />
              <Stack.Screen name="sign-up" options={{ headerShown: false }} />
              <Stack.Screen name="edit-profile" options={{ headerShown: false }} />
              <Stack.Screen name="taste-profile" options={{ headerShown: false }} />
              <Stack.Screen name="settings" options={{ headerShown: false }} />
              <Stack.Screen name="add-recipe" options={{ headerShown: false }} />
              <Stack.Screen name="landing" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="recipe/[id]"
                options={{
                  headerShown: false,
                  presentation: 'card',
                }}
              />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'About Savorly' }} />
            </Stack>
            )}
          </RecipesProvider>
        </AuthProvider>
      </SettingsProvider>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
