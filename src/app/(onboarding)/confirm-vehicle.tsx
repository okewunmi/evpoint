
import React, { useState } from 'react';
import { Pressable, Image, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { addUserVehicle } from '@/lib/supabase';

export default function ConfirmVehicleScreen() {
  const { brandName, modelName, trimName } = useLocalSearchParams<{ brandName: string; modelName: string; trimName: string }>();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const buttonColor = useThemeColor({}, 'button');
  const cardBg = useThemeColor({}, 'card');
  const borderColor = useThemeColor({ light: '#E0E0E0', dark: '#3A3D46' }, 'icon');

  const handleAdd = async () => {
    if (!user) return;
    setSubmitting(true);
    const { error } = await addUserVehicle(user.id, brandName, modelName, trimName);
    setSubmitting(false);

    if (error) {
      Alert.alert('Something went wrong', error.message);
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={26} />
      </Pressable>

      <Image
        source={require('@/assets/images/add-vehicle-illustration.png')}
        style={styles.illustration}
        resizeMode="contain"
      />

      <ThemedView style={[styles.card, { backgroundColor: cardBg }]}>
        <ThemedView style={[styles.cardRow, { borderBottomColor: borderColor }]}>
          <ThemedText>{brandName}</ThemedText>
        </ThemedView>
        <ThemedView style={[styles.cardRow, { borderBottomColor: borderColor }]}>
          <ThemedText>{modelName}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.cardRow}>
          <ThemedText>{trimName}</ThemedText>
        </ThemedView>
      </ThemedView>

      <Pressable style={[styles.button, { backgroundColor: buttonColor }]} onPress={handleAdd} disabled={submitting}>
        <ThemedText style={styles.buttonText}>{submitting ? 'Adding…' : 'Add this Vehicle'}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 20 },
  illustration: { width: '100%', height: 260, marginBottom: 32 },
  card: { borderRadius: 16, marginBottom: 32 },
  cardRow: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1, alignItems: 'center' },
  button: { borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});