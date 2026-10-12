import React, { useEffect } from 'react';
import { Stack, router, useSegments } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { StoreProvider, useStore } from '../src/store/sadhanaStore';
import { ErrorBoundary } from '../src/components/ErrorBoundary';

// Keep the splash visible until the store has hydrated (hidden in
// `SplashGate` once `hydrated` flips true).
SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen unavailable (e.g. web) — the app works without it.
});

/** Hides the splash screen as soon as persisted state has loaded. */
function SplashGate() {
  const { hydrated } = useStore();
  useEffect(() => {
    if (hydrated) {
      SplashScreen.hideAsync().catch(() => {
        // Already hidden or unavailable — safe to ignore.
      });
    }
  }, [hydrated]);
  return null;
}

/**
 * Redirects first-time users to onboarding once hydration completes.
 * `here` is a plain string (so stale generated route types can't break the
 * build) and re-fires on every navigation — without it, the Android back
 * button could pop onboarding back to the tabs and strand an un-onboarded
 * user there, since [hydrated, onboarded] alone never refire.
 */
function OnboardingGate() {
  const { state, hydrated } = useStore();
  const segments = useSegments();
  const here = segments.join('/');
  const onboarded = state.onboarded;

  useEffect(() => {
    if (!hydrated) return;
    if (!onboarded && !here.includes('onboarding')) {
      router.replace('/onboarding' as unknown as '/');
    }
  }, [hydrated, onboarded, here]);

  return null;
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <StoreProvider>
          <StatusBar style="auto" />
          <SplashGate />
          <OnboardingGate />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="onboarding" />
            <Stack.Screen
              name="learn/[id]"
              options={{
                presentation: 'card',
                animation: 'slide_from_right',
              }}
            />
          </Stack>
        </StoreProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
