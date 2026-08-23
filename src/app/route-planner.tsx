import React, { useState } from 'react';
import { TextInput, Pressable, StyleSheet, View, FlatList } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { searchStations } from '@/lib/supabase';

export default function RoutePlannerScreen() {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [activeField, setActiveField] = useState<'from' | 'to' | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const buttonColor = useThemeColor({}, 'button');
  const borderColor = useThemeColor({ light: '#eee', dark: '#2A2D36' }, 'icon');

  const handleChange = async (text: string, field: 'from' | 'to') => {
    if (field === 'from') setFrom(text);
    else setTo(text);
    setActiveField(field);

    if (text.trim().length > 0) {
      const { data } = await searchStations(text.trim());
      setSuggestions(data ?? []);
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (name: string) => {
    if (activeField === 'from') setFrom(name);
    else setTo(name);
    setSuggestions([]);
    setActiveField(null);
  };

  const handleSearch = () => {
    if (!from.trim() || !to.trim()) return;
    router.push({ pathname: '/route-result', params: { from, to } });
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Route Search</ThemedText>
      </View>

      <ThemedText style={styles.label}>From</ThemedText>
      <View style={[styles.inputRow, { borderColor }]}>
        <TextInput
          value={from}
          onChangeText={(t) => handleChange(t, 'from')}
          placeholder="Choose Starting Point"
          placeholderTextColor="#999"
          style={styles.input}
        />
        <Ionicons name="location" size={20} color={buttonColor} />
      </View>

      <ThemedText style={styles.label}>To</ThemedText>
      <View style={[styles.inputRow, { borderColor }]}>
        <TextInput
          value={to}
          onChangeText={(t) => handleChange(t, 'to')}
          placeholder="Choose Destination"
          placeholderTextColor="#999"
          style={styles.input}
        />
        <Ionicons name="location" size={20} color={buttonColor} />
      </View>

      {suggestions.length > 0 && (
        <FlatList
          data={suggestions}
          keyExtractor={(item) => item.id}
          style={{ marginTop: 10 }}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.suggestionRow, { borderBottomColor: borderColor }]}
              onPress={() => handleSelectSuggestion(item.name)}
            >
              <View style={[styles.pin, { backgroundColor: item.status === 'available' ? buttonColor : '#E53935' }]}>
                <Ionicons name="flash" size={16} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: '700' }}>{item.name}</ThemedText>
                <ThemedText style={{ opacity: 0.6, fontSize: 12 }}>{item.city}, {item.address}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} />
            </Pressable>
          )}
        />
      )}

      <Pressable
        style={[styles.searchBtn, { backgroundColor: buttonColor }, (!from || !to) && { opacity: 0.5 }]}
        onPress={handleSearch}
        disabled={!from || !to}
      >
        <ThemedText style={styles.searchBtnText}>Search</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 30 },
  headerTitle: { fontSize: 22 },
  label: { fontWeight: '600', marginBottom: 8, marginTop: 16 },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, paddingBottom: 10 },
  input: { flex: 1, fontSize: 16 },
  suggestionRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12, borderBottomWidth: 1 },
  pin: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  searchBtn: { borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  searchBtnText: { color: '#fff', fontWeight: '600' },
});