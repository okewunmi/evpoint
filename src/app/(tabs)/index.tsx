import React, { useState, useEffect, useRef } from 'react';
import { TextInput, Pressable, StyleSheet, View, FlatList, Image } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getNearbyStations } from '@/lib/supabase';
import { getDistanceKm } from '@/lib/geo';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import EnableLocationModal from '@/components/EnableLocationModal';
import StationPreviewCard from '@/components/StationPreviewCard';

type Station = {
  id: string;
  name: string;
  address: string;
  city: string;
  status: string;
  latitude: number;
  longitude: number;
  rating: number;
  review_count: number;
};

const DEFAULT_REGION = { latitude: 40.6602, longitude: -73.9776, latitudeDelta: 0.05, longitudeDelta: 0.05 };

export default function HomeScreen() {
  const [stations, setStations] = useState<Station[]>([]);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const mapRef = useRef<MapView>(null);

  const { showModal, setShowModal, coords, requestPermission } = useLocationPermission();

  const cardBg = useThemeColor({}, 'card');
  const buttonColor = useThemeColor({}, 'button');
  const borderColor = useThemeColor({ light: '#eee', dark: '#2A2D36' }, 'icon');

  useEffect(() => {
    getNearbyStations().then(({ data }) => setStations(data ?? []));
  }, []);

  const filtered = stations.filter((s) => s.name.toLowerCase().includes(search.toLowerCase()));

  const region = coords
    ? { latitude: coords.latitude, longitude: coords.longitude, latitudeDelta: 0.05, longitudeDelta: 0.05 }
    : DEFAULT_REGION;

  const recenterMap = () => {
    if (coords && mapRef.current) {
      mapRef.current.animateToRegion({ ...coords, latitudeDelta: 0.02, longitudeDelta: 0.02 });
    }
  };

  return (
    <ThemedView style={styles.container}>
      {viewMode === 'map' ? (
        <>
          <MapView ref={mapRef} style={StyleSheet.absoluteFill} initialRegion={region}>
            {coords && (
              <Marker coordinate={coords}>
                <View style={styles.userAvatarWrap}>
                  <Image source={require('@/assets/images/default-avatar.png')} style={styles.userAvatar} />
                </View>
              </Marker>
            )}
            {filtered.map((station) => (
              <Marker
                key={station.id}
                coordinate={{ latitude: station.latitude, longitude: station.longitude }}
                onPress={() => setSelectedStation(station)}
              >
                <View
                  style={[
                    styles.pin,
                    { backgroundColor: station.status === 'available' ? buttonColor : '#E53935' },
                  ]}
                >
                  <Ionicons name="flash" size={16} color="#fff" />
                </View>
              </Marker>
            ))}
          </MapView>

          <View style={styles.searchOverlay}>
            <View style={[styles.searchBox, { backgroundColor: cardBg }]}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                placeholder="Search station"
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>
            <Pressable style={[styles.iconBtn, { backgroundColor: cardBg }]}>
              <Ionicons name="options-outline" size={22} color={buttonColor} />
            </Pressable>
          </View>

          <View style={styles.mapControls}>
            <Pressable style={[styles.controlBtn, { backgroundColor: buttonColor }]} onPress={() => setViewMode('list')}>
              <Ionicons name="list" size={20} color="#fff" />
            </Pressable>
            <Pressable style={[styles.controlBtn, { backgroundColor: buttonColor }]}>
              <Ionicons name="git-network-outline" size={20} color="#fff" />
            </Pressable>
            <Pressable style={[styles.controlBtn, { backgroundColor: buttonColor }]} onPress={recenterMap}>
              <Ionicons name="locate" size={20} color="#fff" />
            </Pressable>
          </View>

          {selectedStation && (
            <View style={styles.previewWrap}>
              <StationPreviewCard
                station={selectedStation}
                distanceKm={coords ? getDistanceKm(coords.latitude, coords.longitude, selectedStation.latitude, selectedStation.longitude) : undefined}
                etaMin={7}
                onClose={() => setSelectedStation(null)}
              />
            </View>
          )}
        </>
      ) : (
        <View style={styles.listContainer}>
          <View style={styles.searchRow}>
            <View style={[styles.searchBox, { backgroundColor: cardBg, flex: 1 }]}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                placeholder="Search station"
                placeholderTextColor="#999"
                value={search}
                onChangeText={setSearch}
                style={styles.searchInput}
              />
            </View>
            <Pressable style={[styles.iconBtn, { backgroundColor: cardBg }]} onPress={() => setViewMode('map')}>
              <Ionicons name="map-outline" size={22} color={buttonColor} />
            </Pressable>
          </View>

          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.row, { borderBottomColor: borderColor }]}
                onPress={() => router.push({ pathname: '/station/[id]', params: { id: item.id } })}
              >
                <View style={[styles.rowPin, { backgroundColor: item.status === 'available' ? buttonColor : '#E53935' }]}>
                  <Ionicons name="flash" size={18} color="#fff" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.stationName}>{item.name}</ThemedText>
                  <ThemedText style={styles.stationAddress}>{item.city}, {item.address}</ThemedText>
                </View>
                <Ionicons name="chevron-forward" size={20} />
              </Pressable>
            )}
          />
        </View>
      )}

      <EnableLocationModal visible={showModal} onEnable={requestPermission} onCancel={() => setShowModal(false)} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  searchOverlay: { position: 'absolute', top: 60, left: 16, right: 16, flexDirection: 'row', gap: 10 },
  searchRow: { flexDirection: 'row', gap: 10, paddingTop: 60, paddingHorizontal: 16, marginBottom: 16 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 14 },
  searchInput: { flex: 1, paddingVertical: 14, marginLeft: 8, fontSize: 15 },
  iconBtn: { width: 52, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  pin: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  userAvatarWrap: { width: 46, height: 46, borderRadius: 23, borderWidth: 3, borderColor: '#fff', overflow: 'hidden' },
  userAvatar: { width: '100%', height: '100%' },
  mapControls: { position: 'absolute', bottom: 100, right: 16, gap: 10 },
  controlBtn: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
  previewWrap: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  listContainer: { flex: 1, paddingHorizontal: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  rowPin: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  stationName: { fontWeight: '700', fontSize: 15 },
  stationAddress: { opacity: 0.6, fontSize: 13, marginTop: 2 },
});