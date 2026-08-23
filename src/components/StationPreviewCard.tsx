import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

type Props = {
  station: {
    id: string;
    name: string;
    address: string;
    city: string;
    status: string;
    rating: number;
    review_count: number;
  };
  distanceKm?: number;
  etaMin?: number;
  onClose: () => void;
};

export default function StationPreviewCard({ station, distanceKm, etaMin, onClose }: Props) {
  const buttonColor = useThemeColor({}, 'button');
  const isAvailable = station.status === 'available';

  return (
    <ThemedView style={styles.card}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <ThemedText style={styles.name}>{station.name}</ThemedText>
          <ThemedText style={styles.address}>{station.city}, {station.address}</ThemedText>
        </View>
        <Pressable style={[styles.directionBtn, { backgroundColor: buttonColor }]}>
          <Ionicons name="navigate" size={18} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.ratingRow}>
        <ThemedText style={styles.rating}>{station.rating}</ThemedText>
        {[1, 2, 3, 4, 5].map((i) => (
          <Ionicons
            key={i}
            name={i <= Math.round(station.rating) ? 'star' : 'star-outline'}
            size={14}
            color="#F5A623"
          />
        ))}
        <ThemedText style={styles.reviewCount}>({station.review_count} reviews)</ThemedText>
      </View>

      <View style={styles.metaRow}>
        <View style={[styles.statusPill, { backgroundColor: isAvailable ? buttonColor : '#E53935' }]}>
          <ThemedText style={styles.statusText}>{isAvailable ? 'Available' : 'In Use'}</ThemedText>
        </View>
        {distanceKm != null && (
          <View style={styles.metaItem}>
            <Ionicons name="location-outline" size={14} />
            <ThemedText style={styles.metaText}>{distanceKm.toFixed(1)} km</ThemedText>
          </View>
        )}
        {etaMin != null && (
          <View style={styles.metaItem}>
            <Ionicons name="car-outline" size={14} />
            <ThemedText style={styles.metaText}>{etaMin} mins</ThemedText>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <Pressable
          style={[styles.viewBtn, { borderColor: buttonColor }]}
          onPress={() => router.push({ pathname: '/station/[id]', params: { id: station.id } })}
        >
          <ThemedText style={{ color: buttonColor, fontWeight: '600' }}>View</ThemedText>
        </Pressable>
        <Pressable style={[styles.bookBtn, { backgroundColor: buttonColor }]}>
          <ThemedText style={styles.bookBtnText}>Book</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 30 },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  name: { fontSize: 18, fontWeight: '700' },
  address: { opacity: 0.6, marginTop: 2 },
  directionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  rating: { fontWeight: '700', marginRight: 4 },
  reviewCount: { opacity: 0.6, marginLeft: 6, fontSize: 13 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  viewBtn: { flex: 1, borderWidth: 1.5, borderRadius: 30, paddingVertical: 14, alignItems: 'center' },
  bookBtn: { flex: 1, borderRadius: 30, paddingVertical: 14, alignItems: 'center' },
  bookBtnText: { color: '#fff', fontWeight: '600' },
});