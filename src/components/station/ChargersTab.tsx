import { View, StyleSheet } from 'react-native';
import React, { useState, useEffect } from 'react';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getStationChargers } from '@/lib/supabase';
import { Pressable } from 'react-native';

export default function ChargersTab({ stationId }: { stationId: string }) {
  const [chargers, setChargers] = useState<any[]>([]);
  const cardBg = useThemeColor({}, 'card');
  const buttonColor = useThemeColor({}, 'button');

  useEffect(() => {
    getStationChargers(stationId).then(({ data }) => setChargers(data ?? []));
  }, [stationId]);

  return (
    <View style={{ gap: 14 }}>
      {chargers.map((c) => {
        const available = c.status === 'available';
        return (
          <ThemedView key={c.id} style={[styles.card, { backgroundColor: cardBg, borderLeftColor: buttonColor }]}>
            <View style={styles.row}>
              <ThemedText style={{ opacity: 0.6 }}>{c.hours}</ThemedText>
              <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: available ? buttonColor : '#E53935' }]} />
                <ThemedText style={{ color: available ? buttonColor : '#E53935', fontWeight: '600' }}>
                  {available ? 'Available' : 'In Use'}
                </ThemedText>
              </View>
            </View>
            <View style={styles.specRow}>
              <ThemedText style={styles.connectorLabel}>{c.connector_type} · {c.power_type}</ThemedText>
              <View>
                <ThemedText style={{ opacity: 0.6, fontSize: 12 }}>Max. power</ThemedText>
                <ThemedText style={styles.kw}>{c.max_kw} kW</ThemedText>
              </View>
            </View>
            <Pressable style={[styles.bookBtn, { backgroundColor: buttonColor }]}>
              <ThemedText style={styles.bookBtnText}>Book</ThemedText>
            </Pressable>
          </ThemedView>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, borderLeftWidth: 4, padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  specRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  connectorLabel: { fontWeight: '600' },
  kw: { fontSize: 22, fontWeight: '700' },
  bookBtn: { borderRadius: 30, paddingVertical: 14, alignItems: 'center' },
  bookBtnText: { color: '#fff', fontWeight: '600' },
});