import React, { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { Chase } from 'react-native-animated-spinkit';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { View, StyleSheet } from 'react-native';

export default function SplashScreen() {
  const { session, loading } = useAuth();
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  const loadingColor = useThemeColor({}, 'loading');

  useEffect(() => {
    const timer = setTimeout(() => setMinTimeElapsed(true), 9000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (minTimeElapsed && !loading) {
      router.replace(session ? '/(tabs)' : '/(auth)/sign-in');
    }
  }, [minTimeElapsed, loading, session]);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.logoGroup}>
        <Ionicons name="location" size={130} color={loadingColor} style={styles.icon} />
        <ThemedText type="title">EVPoint</ThemedText>
      </View>
      <Chase size={48} color={loadingColor} style={styles.spinner} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoGroup: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  icon: {
    marginTop: 240,
  },
  spinner: {
    marginTop: 200,
  },
});