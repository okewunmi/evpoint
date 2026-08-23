import React, { useState, useEffect } from 'react';
import { TextInput, Pressable, FlatList, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { searchStations } from '@/lib/supabase';
import { getRecentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } from '@/lib/searchHistory';

type Station = { id: string; name: string; address: string; city: string; status: string };

export default function SearchScreen() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Station[] | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const [searched, setSearched] = useState(false);

  const buttonColor = useThemeColor({}, 'button');
  const borderColor = useThemeColor({ light: '#eee', dark: '#2A2D36' }, 'icon');

  useEffect(() => {
    getRecentSearches().then(setRecent);
  }, []);

  const runSearch = async (term: string) => {
    if (!term.trim()) {
      setResults(null);
      setSearched(false);
      return;
    }
    const { data } = await searchStations(term.trim());
    setResults(data ?? []);
    setSearched(true);
  };

  const handleSubmit = async () => {
    if (!query.trim()) return;
    await addRecentSearch(query.trim());
    setRecent(await getRecentSearches());
    runSearch(query);
  };

  const handleRecentTap = (term: string) => {
    setQuery(term);
    runSearch(term);
  };

  const handleRemoveRecent = async (term: string) => {
    await removeRecentSearch(term);
    setRecent(await getRecentSearches());
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.searchRow}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={26} />
        </Pressable>
        <View style={[styles.searchBox, { borderColor: buttonColor }]}>
          <Ionicons name="search" size={20} color="#999" />
          <TextInput
            autoFocus
            value={query}
            onChangeText={(text) => {
              setQuery(text);
              if (!text) {
                setResults(null);
                setSearched(false);
              }
            }}
            onSubmitEditing={handleSubmit}
            placeholder="Search station"
            placeholderTextColor="#999"
            style={styles.searchInput}
          />
        </View>
        <Pressable style={[styles.filterBtn, { backgroundColor: '#f2f2f2' }]} onPress={() => router.push('/filter')}>
          <Ionicons name="options-outline" size={22} color={buttonColor} />
        </Pressable>
      </View>

      {!searched && (
        <>
          <View style={styles.historyHeader}>
            <ThemedText style={{ fontWeight: '700' }}>Previous Search</ThemedText>
            {recent.length > 0 && (
              <Pressable
                onPress={async () => {
                  await clearRecentSearches();
                  setRecent([]);
                }}
              >
                <Ionicons name="close" size={20} />
              </Pressable>
            )}
          </View>
          <FlatList
            data={recent}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <View style={[styles.historyRow, { borderBottomColor: borderColor }]}>
                <Pressable style={{ flex: 1 }} onPress={() => handleRecentTap(item)}>
                  <ThemedText style={{ opacity: 0.6 }}>{item}</ThemedText>
                </Pressable>
                <Pressable onPress={() => handleRemoveRecent(item)}>
                  <Ionicons name="close" size={18} color="#999" />
                </Pressable>
              </View>
            )}
          />
        </>
      )}

      {searched && results !== null && results.length === 0 && (
        <View style={styles.notFoundWrap}>
          <View style={[styles.notFoundIcon, { backgroundColor: buttonColor }]}>
            <Ionicons name="sad-outline" size={70} color="#fff" />
          </View>
          <ThemedText type="title" style={styles.notFoundTitle}>Not Found</ThemedText>
          <ThemedText style={styles.notFoundText}>
            We're sorry, the keyword you were looking for could not be found. Please search with another keywords.
          </ThemedText>
        </View>
      )}

      {searched && results !== null && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Pressable
              style={[styles.resultRow, { borderBottomColor: borderColor }]}
              onPress={() => router.push({ pathname: '/station/[id]', params: { id: item.id } })}
            >
              <View style={[styles.pin, { backgroundColor: item.status === 'available' ? buttonColor : '#E53935' }]}>
                <Ionicons name="flash" size={18} color="#fff" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={{ fontWeight: '700' }}>{item.name}</ThemedText>
                <ThemedText style={{ opacity: 0.6, fontSize: 13 }}>{item.city}, {item.address}</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={20} />
            </Pressable>
          )}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 20 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderRadius: 16, paddingHorizontal: 14 },
  searchInput: { flex: 1, paddingVertical: 12, marginLeft: 8, fontSize: 15 },
  filterBtn: { width: 46, height: 46, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  historyRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1 },
  notFoundWrap: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  notFoundIcon: { width: 120, height: 120, borderRadius: 60, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  notFoundTitle: { fontSize: 22, marginBottom: 12 },
  notFoundText: { textAlign: 'center', opacity: 0.6, lineHeight: 22 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1 },
  pin: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});