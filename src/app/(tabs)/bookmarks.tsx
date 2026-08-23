import React, { useState, useEffect, useCallback } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getFavoriteStations } from '@/lib/supabase';

type SavedStation = {
  id: string;
  name: string;
  address: string;
  city: string;
  status: string;
  rating: number;
  review_count: number;
  charger_count: number;
};

const CHARGER_ICONS = ['flash-outline', 'battery-charging-outline', 'flash-outline', 'flash-outline', 'battery-charging-outline', 'flash-outline'] as const;

export default function BookmarksScreen() {
  const { user } = useAuth();
  const [stations, setStations] = useState<SavedStation[]>([]);
  const [loading, setLoading] = useState(true);

  const buttonColor = useThemeColor({}, 'button');
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({ light: '#eee', dark: '#2A2D36' }, 'icon');

  const load = useCallback(() => {
    if (!user) return;
    setLoading(true);
    getFavoriteStations(user.id).then(({ data }) => {
      setStations((data as any) ?? []);
      setLoading(false);
    });
  }, [user]);

  // Reload every time the tab is focused, so unbookmarking on the detail screen reflects here
  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.headerIcon, { backgroundColor: buttonColor }]}>
            <Ionicons name="bookmark" size={18} color="#fff" />
          </View>
          <ThemedText type="title" style={styles.headerTitle}>Saved</ThemedText>
        </View>
        <Pressable onPress={() => router.push('/search')}>
          <Ionicons name="search" size={24} />
        </Pressable>
      </View>

      {!loading && stations.length === 0 && (
        <View style={styles.emptyWrap}>
          <Ionicons name="bookmark-outline" size={60} color={borderColor} />
          <ThemedText style={styles.emptyTitle}>No saved stations yet</ThemedText>
          <ThemedText style={styles.emptyText}>
            Tap the bookmark icon on any station to save it here for quick access.
          </ThemedText>
        </View>
      )}

      <FlatList
        data={stations}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20, gap: 16 }}
        renderItem={({ item }) => {
          const isAvailable = item.status === 'available';
          return (
            <View style={[styles.card, { backgroundColor: cardBg }]}>
              <View style={styles.cardHeader}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.stationName}>{item.name}</ThemedText>
                  <ThemedText style={styles.stationAddress}>{item.city}, {item.address}</ThemedText>
                </View>
                <Pressable style={[styles.directionBtn, { backgroundColor: buttonColor }]}>
                  <Ionicons name="navigate" size={18} color="#fff" />
                </Pressable>
              </View>

              <View style={styles.ratingRow}>
                <ThemedText style={styles.ratingNum}>{item.rating}</ThemedText>
                {[1, 2, 3, 4, 5].map((i) => (
                  <Ionicons key={i} name={i <= Math.round(item.rating) ? 'star' : 'star-outline'} size={14} color="#F5A623" />
                ))}
                <ThemedText style={styles.reviewCount}>({item.review_count} reviews)</ThemedText>
              </View>

              <View style={styles.metaRow}>
                <View style={[styles.statusPill, { backgroundColor: isAvailable ? buttonColor : '#E53935' }]}>
                  <ThemedText style={styles.statusText}>{isAvailable ? 'Available' : 'In Use'}</ThemedText>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="location-outline" size={14} />
                  <ThemedText style={styles.metaText}>1.6 km</ThemedText>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons name="car-outline" size={14} />
                  <ThemedText style={styles.metaText}>5 mins</ThemedText>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: borderColor }]} />

              <Pressable
                style={styles.chargersRow}
                onPress={() => router.push({ pathname: '/station/[id]', params: { id: item.id, tab: 'Chargers' } })}
              >
                <View style={styles.chargerIcons}>
                  {CHARGER_ICONS.slice(0, Math.min(item.charger_count, 6)).map((icon, i) => (
                    <Ionicons key={i} name={icon} size={20} style={styles.chargerIcon} />
                  ))}
                </View>
                <View style={styles.chargersLink}>
                  <ThemedText style={{ color: buttonColor, fontWeight: '600' }}>{item.charger_count} chargers</ThemedText>
                  <Ionicons name="chevron-forward" size={16} color={buttonColor} />
                </View>
              </Pressable>

              <View style={styles.actionRow}>
                <Pressable
                  style={[styles.viewBtn, { borderColor: buttonColor }]}
                  onPress={() => router.push({ pathname: '/station/[id]', params: { id: item.id } })}
                >
                  <ThemedText style={{ color: buttonColor, fontWeight: '600' }}>View</ThemedText>
                </Pressable>
                <Pressable style={[styles.bookBtn, { backgroundColor: buttonColor }]}>
                  <ThemedText style={styles.bookBtnText}>Book</ThemedText>
                </Pressable>
              </View>
            </View>
          );
        }}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 20 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { fontSize: 24 },
  emptyWrap: { alignItems: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyTitle: { fontWeight: '700', fontSize: 16, marginTop: 16, marginBottom: 8 },
  emptyText: { textAlign: 'center', opacity: 0.6, lineHeight: 20 },
  card: { borderRadius: 20, padding: 18 },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  stationName: { fontSize: 17, fontWeight: '700' },
  stationAddress: { opacity: 0.6, marginTop: 2, fontSize: 13 },
  directionBtn: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 12 },
  ratingNum: { fontWeight: '700', marginRight: 4 },
  reviewCount: { opacity: 0.6, marginLeft: 6, fontSize: 13 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 14 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13 },
  divider: { height: 1, marginBottom: 14 },
  chargersRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  chargerIcons: { flexDirection: 'row', gap: 8 },
  chargerIcon: { opacity: 0.6 },
  chargersLink: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  actionRow: { flexDirection: 'row', gap: 12 },
  viewBtn: { flex: 1, borderWidth: 1.5, borderRadius: 30, paddingVertical: 14, alignItems: 'center' },
  bookBtn: { flex: 1, borderRadius: 30, paddingVertical: 14, alignItems: 'center' },
  bookBtnText: { color: '#fff', fontWeight: '600' },
});