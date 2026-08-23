import React, { useState, useEffect } from 'react';
import { TextInput, FlatList, Pressable, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getTrims } from '@/lib/supabase';

export default function SelectTrimScreen() {
  const { modelId, modelName, brandName } = useLocalSearchParams<{ modelId: string; modelName: string; brandName: string }>();
  const [trims, setTrims] = useState<{ id: string; name: string }[]>([]);
  const [search, setSearch] = useState('');
  const borderColor = useThemeColor({ light: '#E0E0E0', dark: '#3A3D46' }, 'icon');
  const cardBg = useThemeColor({}, 'card');

  useEffect(() => {
    if (modelId) getTrims(modelId).then(({ data }) => setTrims(data ?? []));
  }, [modelId]);

  const filtered = trims.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.headerRow}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} />
        </Pressable>
        <ThemedText type="title" style={styles.heading}>Trim</ThemedText>
      </ThemedView>

      <TextInput
        placeholder="Search"
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
        style={[styles.search, { backgroundColor: cardBg }]}
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            style={[styles.row, { borderBottomColor: borderColor }]}
            onPress={() => router.push({
              pathname: '/(onboarding)/confirm-vehicle',
              params: { brandName, modelName, trimName: item.name },
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
  search: { borderRadius: 30, paddingHorizontal: 18, paddingVertical: 14, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1 },
  rowText: { fontSize: 16 },
});