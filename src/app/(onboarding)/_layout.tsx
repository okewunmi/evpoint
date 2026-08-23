import React from 'react';
import { Stack, Redirect } from 'expo-router';
import { ActivityIndicator } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function OnboardingLayout() {
  const { session, loading } = useAuth();
  const tint = useThemeColor({}, 'tint');

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={tint} />
      </ThemedView>
    );
  }

  if (!session) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="profile" />
      <Stack.Screen name="add-vehicle" />
      <Stack.Screen name="select-brand" />
      <Stack.Screen name="select-model" />
      <Stack.Screen name="select-trim" />
      <Stack.Screen name="confirm-vehicle" />
    </Stack>
  );
}