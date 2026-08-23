import React, { useState } from 'react';
import { TextInput, Pressable, StyleSheet, Alert, Image, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { createCheckIn } from '@/lib/supabase';

export default function CheckInFormScreen() {
  const { stationId, type, label } = useLocalSearchParams<{ stationId: string; type: string; label: string }>();
  const { user } = useAuth();
  const [comment, setComment] = useState('');
  const [maxKw, setMaxKw] = useState('');
  const [waitDuration, setWaitDuration] = useState('1 hour');
  const [problemType, setProblemType] = useState('Could Not Activate');
  const [submitting, setSubmitting] = useState(false);

  const buttonColor = useThemeColor({}, 'button');
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({ light: '#eee', dark: '#2A2D36' }, 'icon');

  const needsMaxKw = type === 'charging_now' || type === 'successfully_charged';
  const needsWaitDuration = type === 'waiting';
  const needsProblemType = type === 'could_not_charge';

  const handleSubmit = async () => {
    if (!user || !stationId) return;
    setSubmitting(true);
    const { error } = await createCheckIn({
      station_id: stationId,
      user_id: user.id,
      check_in_type: type,
      comment: comment.trim() || undefined,
      max_kw: needsMaxKw ? Number(maxKw) : undefined,
      wait_duration: needsWaitDuration ? waitDuration : undefined,
      problem_type: needsProblemType ? problemType : undefined,
    });
    setSubmitting(false);

    if (error) {
      Alert.alert('Something went wrong', error.message);
      return;
    }
    router.back();
    router.back();
  };

  return (
    <ThemedView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={26} />
      </Pressable>
      <ThemedText type="title" style={styles.heading}>{label}</ThemedText>

      <ThemedText style={styles.label}>Vehicle</ThemedText>
      <View style={[styles.vehicleCard, { backgroundColor: cardBg }]}>
        <Image source={require('@/assets/images/car-icon.png')} style={styles.carIcon} />
        <View style={{ flex: 1 }}>
          <ThemedText style={{ fontWeight: '700' }}>Tesla</ThemedText>
          <ThemedText style={{ opacity: 0.6 }}>Model S · 40</ThemedText>
        </View>
        <ThemedText style={{ color: buttonColor, fontWeight: '600' }}>Change</ThemedText>
      </View>

      <ThemedText style={styles.label}>Comment</ThemedText>
      <TextInput
        multiline
        value={comment}
        onChangeText={setComment}
        style={[styles.commentInput, { borderColor }]}
        placeholder="Share details about your experience"
        placeholderTextColor="#999"
      />

      {needsMaxKw && (
        <>
          <ThemedText style={styles.label}>Max kW</ThemedText>
          <TextInput
            value={maxKw}
            onChangeText={setMaxKw}
            keyboardType="numeric"
            style={[styles.input, { borderColor }]}
          />
        </>
      )}

      {needsWaitDuration && (
        <>
          <ThemedText style={styles.label}>I'll be here for</ThemedText>
          <TextInput value={waitDuration} onChangeText={setWaitDuration} style={[styles.input, { borderColor }]} />
        </>
      )}

      {needsProblemType && (
        <>
          <ThemedText style={styles.label}>Problem</ThemedText>
          <TextInput value={problemType} onChangeText={setProblemType} style={[styles.input, { borderColor }]} />
        </>
      )}

      <Pressable style={[styles.submitBtn, { backgroundColor: buttonColor }]} onPress={handleSubmit} disabled={submitting}>
        <ThemedText style={styles.submitBtnText}>{submitting ? 'Submitting…' : 'Submit'}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 20 },
  heading: { fontSize: 26, marginBottom: 24 },
  label: { fontWeight: '600', marginBottom: 8, marginTop: 16 },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 14, padding: 14 },
  carIcon: { width: 40, height: 40 },
  commentInput: { borderBottomWidth: 1, paddingVertical: 10, fontSize: 15, minHeight: 80, textAlignVertical: 'top' },
  input: { borderBottomWidth: 1, paddingVertical: 10, fontSize: 15 },
  submitBtn: { borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginTop: 40 },
  submitBtnText: { color: '#fff', fontWeight: '600' },
});