import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavThemeProvider } from 'expo-router/react-navigation';
import { Stack } from 'expo-router';
import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider as AppThemeProvider } from '@/context/ThemeContext';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <NavThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="+not-found" />
      </Stack>
    </NavThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AuthProvider>
        <RootLayoutNav />
      </AuthProvider>
    </AppThemeProvider>
  );
}