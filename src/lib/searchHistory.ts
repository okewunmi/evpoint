import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'recent_searches';
const MAX_ITEMS = 8;

export async function getRecentSearches(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function addRecentSearch(term: string) {
  const current = await getRecentSearches();
  const updated = [term, ...current.filter((t) => t !== term)].slice(0, MAX_ITEMS);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

export async function removeRecentSearch(term: string) {
  const current = await getRecentSearches();
  const updated = current.filter((t) => t !== term);
  await AsyncStorage.setItem(KEY, JSON.stringify(updated));
}

export async function clearRecentSearches() {
  await AsyncStorage.removeItem(KEY);
}