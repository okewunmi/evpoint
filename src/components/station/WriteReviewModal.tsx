import React, { useState } from 'react';
import { Modal, Pressable, TextInput, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { createReview } from '@/lib/supabase';

type Props = {
  visible: boolean;
  stationId: string;
  onClose: () => void;
  onSubmitted: () => void;
};

export default function WriteReviewModal({ visible, stationId, onClose, onSubmitted }: Props) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const buttonColor = useThemeColor({}, 'button');
  const borderColor = useThemeColor({ light: '#eee', dark: '#2A2D36' }, 'icon');

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert('Please select a star rating');
      return;
    }
    if (!user) return;

    setSubmitting(true);
    const { error } = await createReview(stationId, user.id, rating, comment.trim());
    setSubmitting(false);

    if (error) {
      Alert.alert('Something went wrong', error.message);
      return;
    }

    setRating(0);
    setComment('');
    onSubmitted();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={{ width: '100%' }} onPress={(e) => e.stopPropagation()}>
          <ThemedView style={styles.sheet}>
            <ThemedText type="title" style={styles.title}>Write a Review</ThemedText>
            <ThemedView style={[styles.divider, { backgroundColor: borderColor }]} />

            <ThemedText style={styles.label}>Give it a star</ThemedText>
            <ThemedView style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((i) => (
                <Pressable key={i} onPress={() => setRating(i)}>
                  <Ionicons name={i <= rating ? 'star' : 'star-outline'} size={40} color="#F5A623" />
                </Pressable>
              ))}
            </ThemedView>

            <ThemedText style={styles.label}>Comment</ThemedText>
            <TextInput
              multiline
              value={comment}
              onChangeText={setComment}
              placeholder="Share your experience"
              placeholderTextColor="#999"
              style={[styles.input, { borderColor }]}
            />

            <Pressable style={[styles.submitBtn, { backgroundColor: buttonColor }]} onPress={handleSubmit} disabled={submitting}>
              <ThemedText style={styles.submitBtnText}>{submitting ? 'Submitting…' : 'Submit'}</ThemedText>
            </Pressable>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  title: { textAlign: 'center', fontSize: 20 },
  divider: { height: 1, marginVertical: 16 },
  label: { fontWeight: '600', textAlign: 'center', marginBottom: 12 },
  starsRow: { flexDirection: 'row', justifyContent: 'center', gap: 10, marginBottom: 20 },
  input: { borderBottomWidth: 1, minHeight: 70, textAlignVertical: 'top', fontSize: 15, paddingVertical: 8, marginBottom: 10 },
  submitBtn: { borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#fff', fontWeight: '600' },
});