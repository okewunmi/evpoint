
import React from 'react';
import { useState, useEffect } from 'react';
import { View, Pressable, StyleSheet, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getStationReviews, getReviewBreakdown } from '@/lib/supabase';
import WriteReviewModal from './WriteReviewModal';

type Review = {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: { full_name: string; avatar_url: string | null } | null;
};

export default function ReviewsTab({ stationId, stationRating, reviewCount }: { stationId: string; stationRating: number; reviewCount: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [breakdown, setBreakdown] = useState([0, 0, 0, 0, 0]);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [showWriteModal, setShowWriteModal] = useState(false);

  const buttonColor = useThemeColor({}, 'button');
  const borderColor = useThemeColor({ light: '#eee', dark: '#2A2D36' }, 'icon');

  const load = () => {
    getStationReviews(stationId, sortBy).then(({ data }) => setReviews((data as any) ?? []));
    getReviewBreakdown(stationId).then(({ breakdown }) => setBreakdown(breakdown));
  };

  useEffect(() => {
    load();
  }, [stationId, sortBy]);

  const totalReviews = breakdown.reduce((a, b) => a + b, 0);

  return (
    <View>
      <View style={styles.summaryRow}>
        <View style={styles.summaryLeft}>
          <ThemedText style={styles.bigRating}>{stationRating}</ThemedText>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Ionicons key={i} name={i <= Math.round(stationRating) ? 'star' : 'star-outline'} size={16} color="#F5A623" />
            ))}
          </View>
          <ThemedText style={styles.reviewCount}>({reviewCount} reviews)</ThemedText>
        </View>

        <View style={styles.summaryRight}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = breakdown[star - 1];
            const pct = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            return (
              <View key={star} style={styles.barRow}>
                <ThemedText style={styles.barLabel}>{star}</ThemedText>
                <View style={[styles.barTrack, { backgroundColor: borderColor }]}>
                  <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: buttonColor }]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={[styles.sortRow, { borderBottomColor: borderColor }]}>
        <ThemedText style={{ fontWeight: '600' }}>Sort by</ThemedText>
        <Pressable
          style={styles.sortBtn}
          onPress={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
        >
          <ThemedText style={{ color: buttonColor, fontWeight: '600' }}>
            {sortBy === 'newest' ? 'Newest' : 'Oldest'}
          </ThemedText>
          <Ionicons name="swap-vertical" size={16} color={buttonColor} />
        </Pressable>
      </View>

      <View style={{ gap: 18, marginTop: 16 }}>
        {reviews.map((review) => (
          <View key={review.id} style={[styles.reviewItem, { borderBottomColor: borderColor }]}>
            <View style={styles.reviewHeader}>
              {review.profiles?.avatar_url ? (
                <Image source={{ uri: review.profiles.avatar_url }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, styles.avatarPlaceholder, { backgroundColor: buttonColor }]}>
                  <ThemedText style={{ color: '#fff', fontWeight: '700' }}>
                    {review.profiles?.full_name?.[0]?.toUpperCase() ?? '?'}
                  </ThemedText>
                </View>
              )}
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: '700' }}>{review.profiles?.full_name ?? 'Anonymous'}</ThemedText>
                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Ionicons key={i} name={i <= review.rating ? 'star' : 'star-outline'} size={12} color="#F5A623" />
                  ))}
                  <ThemedText style={styles.smallText}> ({review.rating})</ThemedText>
                </View>
              </View>
              <ThemedText style={styles.dateText}>
                {new Date(review.created_at).toLocaleDateString()}
              </ThemedText>
            </View>
            <ThemedText style={styles.commentText}>{review.comment}</ThemedText>
          </View>
        ))}
      </View>

      <Pressable style={[styles.writeBtn, { backgroundColor: buttonColor }]} onPress={() => setShowWriteModal(true)}>
        <ThemedText style={styles.writeBtnText}>Write a Review</ThemedText>
      </Pressable>

      <WriteReviewModal
        visible={showWriteModal}
        stationId={stationId}
        onClose={() => setShowWriteModal(false)}
        onSubmitted={() => {
          setShowWriteModal(false);
          load();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row', gap: 20, marginBottom: 20 },
  summaryLeft: { alignItems: 'center', justifyContent: 'center' },
  bigRating: { fontSize: 40, fontWeight: '700' },
  starsRow: { flexDirection: 'row', gap: 2, marginVertical: 4 },
  reviewCount: { opacity: 0.6, fontSize: 12 },
  summaryRight: { flex: 1, justifyContent: 'center', gap: 6 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { width: 12, fontSize: 12 },
  barTrack: { flex: 1, height: 6, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  sortRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  reviewItem: { paddingBottom: 16, borderBottomWidth: 1 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  avatar: { width: 36, height: 36, borderRadius: 18 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  smallText: { fontSize: 12, opacity: 0.6 },
  dateText: { fontSize: 11, opacity: 0.5 },
  commentText: { opacity: 0.8, lineHeight: 20 },
  writeBtn: { borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginTop: 20, marginBottom: 10 },
  writeBtnText: { color: '#fff', fontWeight: '600' },
});