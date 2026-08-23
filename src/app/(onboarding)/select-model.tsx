import React, { useState, useEffect } from 'react';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getModels } from '@/lib/supabase';

export default function SelectModelScreen() {
  const { brandId, brandName } = useLocalSearchParams<{ brandId: string; brandName: string }>();
  const [models, setModels] = useState<{ id: string; name: string }[]>([]);
  const borderColor = useThemeColor({ light: '#E0E0E0', dark: '#3A3D46' }, 'icon');

  useEffect(() => {
    if (brandId) getModels(brandId).then(({ data }) => setModels(data ?? []));
  }, [brandId]);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerRow}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} />
        </Pressable>
        <ThemedText type="title" style={styles.heading}>Select Model</ThemedText>
      </ThemedView>

      <FlatList
        data={models}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { borderBottomColor: borderColor }]}
            onPress={() => router.push({
              pathname: '/(onboarding)/select-trim',
              params: { modelId: item.id, modelName: item.name, brandName },
            })}
          >
            <ThemedText style={styles.rowText}>{item.name}</ThemedText>
            <Ionicons name="chevron-forward" size={20} />
          </Pressable>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  heading: { fontSize: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  rowText: { fontSize: 16 },
});