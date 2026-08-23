import { View, Pressable, StyleSheet, Modal } from 'react-native';
import React, { useState } from 'react';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const CHECK_IN_TYPES = [
  { key: 'charging_now', label: 'Charging Now', icon: 'battery-charging', color: '#01B763' },
  { key: 'waiting', label: 'Waiting', icon: 'time', color: '#3B4A6B' },
  { key: 'successfully_charged', label: 'Successfully Charged', icon: 'add-circle', color: '#01B763' },
  { key: 'could_not_charge', label: 'Could Not Charge', icon: 'remove-circle', color: '#E53935' },
  { key: 'comment', label: 'Leave a Comment', icon: 'chatbubble', color: '#2196F3' },
] as const;

export default function CheckInsTab({ stationId }: { stationId: string }) {
  const [showSheet, setShowSheet] = useState(false);
  const cardBg = useThemeColor({}, 'card');
  const buttonColor = useThemeColor({}, 'button');

  return (
    <View>
      <Pressable style={[styles.checkInBtn, { backgroundColor: buttonColor }]} onPress={() => setShowSheet(true)}>
        <ThemedText style={styles.checkInBtnText}>Check In</ThemedText>
      </Pressable>

      <Modal visible={showSheet} transparent animationType="slide">
        <Pressable style={styles.overlay} onPress={() => setShowSheet(false)}>
          <ThemedView style={styles.sheet}>
            <ThemedText type="title" style={styles.sheetTitle}>Check-in</ThemedText>
            <View style={{ gap: 12 }}>
              {CHECK_IN_TYPES.map((type) => (
                <Pressable
                  key={type.key}
                  style={[styles.optionRow, { backgroundColor: cardBg }]}
                  onPress={() => {
                    setShowSheet(false);
                    router.push({ pathname: '/station/check-in-form', params: { stationId, type: type.key, label: type.label } });
                  }}
                >
                  <View style={[styles.optionIcon, { backgroundColor: type.color }]}>
                    <Ionicons name={type.icon as any} size={18} color="#fff" />
                  </View>
                  <ThemedText style={styles.optionLabel}>{type.label}</ThemedText>
                  <Ionicons name="chevron-forward" size={20} />
                </Pressable>
              ))}
            </View>
          </ThemedView>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  checkInBtn: { borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginBottom: 20 },
  checkInBtnText: { color: '#fff', fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  sheetTitle: { textAlign: 'center', fontSize: 20, marginBottom: 20 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 14 },
  optionIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  optionLabel: { flex: 1, fontWeight: '600' },
});