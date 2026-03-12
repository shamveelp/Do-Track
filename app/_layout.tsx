import { AuthProvider, useAuth } from '@/context/auth-context';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const firstSegment = segments[0] as string | undefined;
    const inProtectedGroup = firstSegment === '(tabs)' || firstSegment === 'add-transaction';
    const isSplash = firstSegment === undefined;
    const isPublicAuthPage = ['onboarding', 'login', 'signup', 'otp'].includes(firstSegment || '');

    if (session) {
      if (isSplash || isPublicAuthPage) {
        router.replace('/(tabs)');
      }
    } else {
      if (inProtectedGroup) {
        router.replace('/onboarding');
      } else if (isSplash) {
        router.replace('/onboarding');
      }
    }
  }, [session, loading, segments]);

  return <>{children}</>;
}

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGuard>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="otp" />
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="add-transaction" options={{ presentation: 'fullScreenModal' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </Stack>
        </AuthGuard>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}
