
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useState, useEffect } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { getStationReviews } from '@/lib/supabase';

export default function ReviewsTab({ stationId }: { stationId: string }) {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    getStationReviews(stationId).then(({ data }) => setReviews(data ?? []));
  }, [stationId]);

  return (
    <View style={{ gap: 16 }}>
      {reviews.length === 0 && <ThemedText style={{ opacity: 0.6 }}>No reviews yet.</ThemedText>}
      {reviews.map((r) => (
        <View key={r.id}>
          <ThemedText style={{ fontWeight: '700' }}>Rating: {r.rating}/5</ThemedText>
          <ThemedText style={{ opacity: 0.7 }}>{r.comment}</ThemedText>
        </View>
      ))}
    </View>
  );
}