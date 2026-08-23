import React from 'react';
import { Pressable, Image, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export default function AddVehiclePrompt() {
  const buttonColor = useThemeColor({}, 'button');
  const cardBg = useThemeColor({}, 'card');

  return (
    <ThemedView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={26} />
      </Pressable>

      <ThemedText type="title" style={styles.heading}>
        Personalize your experience by adding a vehicle 🚗
      </ThemedText>
      <ThemedText style={styles.subtext}>
        Your vehicle is used to determine compatible charging stations.
      </ThemedText>

      <Image
        source={require('@/assets/images/add-vehicle-illustration.png')}
        style={styles.illustration}
        resizeMode="contain"
      />

      <ThemedView style={styles.buttonRow}>
        <Pressable style={[styles.laterBtn, { backgroundColor: cardBg }]} onPress={() => router.replace('/(tabs)')}>
          <ThemedText style={{ color: buttonColor, fontWeight: '600' }}>Add Later</ThemedText>
        </Pressable>
        <Pressable style={[styles.addBtn, { backgroundColor: buttonColor }]} onPress={() => router.push('/(onboarding)/select-brand')}>
          <ThemedText style={styles.addBtnText}>Add Vehicle</ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 20 },
  heading: { fontSize: 28, lineHeight: 36, marginBottom: 16 },
  subtext: { opacity: 0.7, marginBottom: 24, lineHeight: 22 },
  illustration: { width: '100%', height: 260, marginBottom: 'auto' },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  laterBtn: { flex: 1, borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  addBtn: { flex: 1, borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600' },
});