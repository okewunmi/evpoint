import React, { useState, useEffect } from 'react';
import { ScrollView, Pressable, Image, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import {
  getStationDetail, getStationHours, getStationAmenities,
  isFavorited, toggleFavorite,
} from '@/lib/supabase';
import ChargersTab from '@/components/station/ChargersTab';
import CheckInsTab from '@/components/station/CheckInsTab';
import ReviewsTab from '@/components/station/ReviewsTab';
// import ReviewsTab from '@/components/station/ReviewsTab';

const TABS = ['Info', 'Chargers', 'Check-ins', 'Reviews'] as const;

export default function StationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [station, setStation] = useState<any>(null);
  const [hours, setHours] = useState<any[]>([]);
  const [amenities, setAmenities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>('Info');
  const [favorited, setFavorited] = useState(false);

  const buttonColor = useThemeColor({}, 'button');
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({ light: '#eee', dark: '#2A2D36' }, 'icon');

  useEffect(() => {
    if (!id) return;
    getStationDetail(id).then(({ data }) => setStation(data));
    getStationHours(id).then(({ data }) => setHours(data ?? []));
    getStationAmenities(id).then(({ data }) => setAmenities(data ?? []));
    if (user) isFavorited(user.id, id).then(setFavorited);
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user || !id) return;
    await toggleFavorite(user.id, id, favorited);
    setFavorited(!favorited);
  };

  if (!station) {
    return <ThemedView style={{ flex: 1 }} />;
  }

  const isAvailable = station.status === 'available';

  return (
    <ThemedView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View>
          <Image source={{ uri: station.image_url }} style={styles.headerImage} />
          <Pressable style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color="#fff" />
          </Pressable>
          <View style={styles.headerIcons}>
            <Pressable style={styles.iconCircle} onPress={handleToggleFavorite}>
              <Ionicons name={favorited ? 'bookmark' : 'bookmark-outline'} size={20} color="#fff" />
            </Pressable>
            <Pressable style={styles.iconCircle}>
              <Ionicons name="paper-plane-outline" size={20} color="#fff" />
            </Pressable>
          </View>
        </View>

        <View style={styles.content}>
          <ThemedText style={styles.name}>{station.name}</ThemedText>
          <ThemedText style={styles.address}>{station.city}, {station.address}</ThemedText>

          <View style={styles.ratingRow}>
            <ThemedText style={styles.ratingNum}>{station.rating}</ThemedText>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons key={i} name={i <= Math.round(station.rating) ? 'star' : 'star-outline'} size={14} color="#F5A623" />
            ))}
            <ThemedText style={styles.reviewCount}>({station.review_count} reviews)</ThemedText>
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

          <View style={styles.actionRow}>
            <Pressable style={[styles.directionBtn, { backgroundColor: buttonColor }]}>
              <Ionicons name="navigate" size={16} color="#fff" />
              <ThemedText style={styles.directionBtnText}>Get Direction</ThemedText>
            </Pressable>
            <Pressable style={[styles.routeBtn, { borderColor: buttonColor }]}>
              <ThemedText style={{ color: buttonColor, fontWeight: '600' }}>Route Planner</ThemedText>
            </Pressable>
          </View>

          <View style={[styles.tabRow, { borderBottomColor: borderColor }]}>
            {TABS.map((tab) => (
              <Pressable key={tab} onPress={() => setActiveTab(tab)} style={styles.tabItem}>
                <ThemedText style={[styles.tabText, activeTab === tab && { color: buttonColor, fontWeight: '700' }]}>
                  {tab}
                </ThemedText>
                {activeTab === tab && <View style={[styles.tabUnderline, { backgroundColor: buttonColor }]} />}
              </Pressable>
            ))}
          </View>

          {activeTab === 'Info' && (
            <View style={styles.tabContent}>
              <ThemedText style={styles.sectionTitle}>About</ThemedText>
              <ThemedText style={styles.aboutText}>{station.about}</ThemedText>

              <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
                <View style={[styles.infoRow, { borderBottomColor: borderColor }]}>
                  <ThemedText style={{ opacity: 0.6 }}>Parking</ThemedText>
                  <ThemedText style={{ fontWeight: '600' }}>{station.parking_type}</ThemedText>
                </View>
                <View style={styles.infoRow}>
                  <ThemedText style={{ opacity: 0.6 }}>Cost</ThemedText>
                  <ThemedText style={{ fontWeight: '600' }}>{station.cost_info}</ThemedText>
                </View>
              </View>

              {hours.length > 0 && (
                <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
                  <View style={styles.hoursHeader}>
                    <Ionicons name="time-outline" size={16} color={buttonColor} />
                    <ThemedText style={{ color: buttonColor, fontWeight: '600' }}>
                      {station.open_24_hours ? 'Open 24 hours' : 'Hours'}
                    </ThemedText>
                  </View>
                  {hours.map((h) => (
                    <View key={h.id} style={[styles.infoRow, { borderBottomColor: borderColor }]}>
                      <ThemedText>{h.day_of_week}</ThemedText>
                      <ThemedText style={{ fontWeight: '600' }}>{h.open_time} - {h.close_time}</ThemedText>
                    </View>
                  ))}
                </View>
              )}

              {amenities.length > 0 && (
                <View style={[styles.infoCard, { backgroundColor: cardBg }]}>
                  <ThemedText style={styles.sectionTitle}>Amenities</ThemedText>
                  <View style={styles.amenitiesGrid}>
                    {amenities.map((a) => (
                      <View key={a.id} style={styles.amenityItem}>
                        <ThemedText>{a.amenity}</ThemedText>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <ThemedText style={styles.sectionTitle}>Location</ThemedText>
              <View style={styles.locationRow}>
                <Ionicons name="location" size={16} color={buttonColor} />
                <ThemedText>{station.city}, {station.address}</ThemedText>
              </View>
            </View>
          )}

          {activeTab === 'Chargers' && <ChargersTab stationId={id} />}
          {activeTab === 'Check-ins' && <CheckInsTab stationId={id} />}
          {activeTab === 'Reviews' && <ReviewsTab stationId={id} />}
        </View>
      </ScrollView>

      <View style={[styles.bookBar, { backgroundColor: cardBg }]}>
        <Pressable style={[styles.iconOnlyBtn, { borderColor }]}>
          <Ionicons name="car-outline" size={20} />
        </Pressable>
        <Pressable style={[styles.bookBtn, { backgroundColor: buttonColor }]}>
          <ThemedText style={styles.bookBtnText}>Book</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerImage: { width: '100%', height: 260 },
  backBtn: { position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  headerIcons: { position: 'absolute', top: 50, right: 16, flexDirection: 'row', gap: 10 },
  iconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.4)', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  name: { fontSize: 22, fontWeight: '700' },
  address: { opacity: 0.6, marginTop: 4 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 10 },
  ratingNum: { fontWeight: '700', marginRight: 4 },
  reviewCount: { opacity: 0.6, marginLeft: 6, fontSize: 13 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 10 },
  statusPill: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  directionBtn: { flex: 1, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 30, paddingVertical: 14 },
  directionBtnText: { color: '#fff', fontWeight: '600' },
  routeBtn: { flex: 1, borderWidth: 1.5, borderRadius: 30, paddingVertical: 14, alignItems: 'center' },
  tabRow: { flexDirection: 'row', marginTop: 22, borderBottomWidth: 1 },
  tabItem: { marginRight: 24, paddingBottom: 10 },
  tabText: { opacity: 0.5, fontSize: 14 },
  tabUnderline: { height: 2, marginTop: 8, borderRadius: 1 },
  tabContent: { marginTop: 18 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
  aboutText: { opacity: 0.7, lineHeight: 20, marginBottom: 16 },
  infoCard: { borderRadius: 16, marginBottom: 16, padding: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 12, borderBottomWidth: 1 },
  hoursHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: 12 },
  amenitiesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, padding: 12 },
  amenityItem: { width: '45%' },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  bookBar: { flexDirection: 'row', gap: 12, padding: 16, borderTopWidth: 1 },
  iconOnlyBtn: { width: 52, height: 52, borderRadius: 16, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  bookBtn: { flex: 1, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  bookBtnText: { color: '#fff', fontWeight: '600' },
});