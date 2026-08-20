import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useSystemColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme-preference';

type ThemeContextType = {
  preference: ThemePreference;
  theme: ResolvedTheme;
  setPreference: (pref: ThemePreference) => void;
  loading: boolean;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [preference, setPreferenceState] = useState<ThemePreference>('system');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setPreferenceState(stored);
      }
      setLoading(false);
    });
  }, []);

  const setPreference = (pref: ThemePreference) => {
    setPreferenceState(pref);
    AsyncStorage.setItem(STORAGE_KEY, pref);
    // Optional: sync to Supabase profile once that table exists
    // supabase.from('profiles').update({ theme_preference: pref }).eq('id', userId);
  };

  const theme: ResolvedTheme = preference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : preference;

  return (
    <ThemeContext.Provider value={{ preference, theme, setPreference, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useAppTheme must be used within a ThemeProvider');
  return context;
}