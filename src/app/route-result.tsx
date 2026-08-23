import { StyleSheet, Pressable, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import React from 'react';

export default function RouteResultScreen() {
  const { from, to } = useLocalSearchParams<{ from: string; to: string }>();
  const { coords } = useLocationPermission();
  const buttonColor = useThemeColor({}, 'button');

  // Placeholder destination — replace with real geocoded coords once station/place lookup is wired in
  const destination = { latitude: (coords?.latitude ?? 40.66) + 0.01, longitude: (coords?.longitude ?? -73.97) + 0.01 };
  const origin = coords ?? { latitude: 40.66, longitude: -73.97 };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Route Search</ThemedText>
      </View>

      <MapView
        style={styles.map}
        initialRegion={{ ...origin, latitudeDelta: 0.03, longitudeDelta: 0.03 }}
      >
        <Marker coordinate={origin} />
        <Marker coordinate={destination}>
          <View style={[styles.pin, { backgroundColor: buttonColor }]}>
            <Ionicons name="flash" size={16} color="#fff" />
          </View>
        </Marker>
        <Polyline coordinates={[origin, destination]} strokeColor={buttonColor} strokeWidth={4} />
      </MapView>

      <View style={[styles.distancePill, { backgroundColor: buttonColor }]}>
        <ThemedText style={styles.distanceText}>1.6 km (5 mins)</ThemedText>
      </View>

      <Pressable
        style={[styles.startBtn, { backgroundColor: buttonColor }]}
        onPress={() => router.push({ pathname: '/route-active', params: { from, to } })}
      >
        <ThemedText style={styles.startBtnText}>Start</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 60, paddingHorizontal: 24, marginBottom: 16 },
  headerTitle: { fontSize: 22 },
  map: { flex: 1 },
  pin: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  distancePill: { position: 'absolute', top: 150, alignSelf: 'center', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  distanceText: { color: '#fff', fontWeight: '700' },
  startBtn: { margin: 20, borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  startBtnText: { color: '#fff', fontWeight: '600' },
});