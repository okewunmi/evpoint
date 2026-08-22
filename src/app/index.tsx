
import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import {  Chase, Circle } from 'react-native-animated-spinkit';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';

export default function SplashScreen() {
  const { session, loading } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  const loadingColor = useThemeColor({}, 'loading');

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minTimeElapsed && !loading) {
      router.replace(session ? '/(tabs)' : '/(auth)/sign-in');
    }
  }, [minTimeElapsed, loading, session]);

  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText type="title">EV Point</ThemedText>
      <Ionicons name="location" size={48} color={loadingColor} style={{ marginTop: 240 }} />
      <Chase size={48} color={loadingColor} style={{ marginTop: 240 }} />
      
    </ThemedView>
  );
}