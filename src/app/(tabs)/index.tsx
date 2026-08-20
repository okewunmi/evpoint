import { ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
// import ReactLoading from 'react-loading';

export default function MapScreen() {
   const tint = useThemeColor({}, 'tint');
   
  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText type="title">EV Charge Map</ThemedText>
      <ActivityIndicator size="large" color={tint} style={{ marginTop: 16 }} />
    </ThemedView>
  );
}
