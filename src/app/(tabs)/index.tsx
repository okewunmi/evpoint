import { ActivityIndicator } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Chase, Circle, Bounce, Wave, Wander } from 'react-native-animated-spinkit';
import React from 'react';
// import ReactLoading from 'react-loading';

export default function MapScreen() {
  const loadingColor = useThemeColor({}, 'loading');

  return (
    <ThemedView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ThemedText type="title">EV Charge Map</ThemedText>
      {/* <Chase size={48} color={loadingColor} style={{ marginTop: 40 }} /> */}

    </ThemedView>
  );
}
