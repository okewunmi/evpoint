import React, { useState } from 'react';
import { ScrollView, Pressable, Switch, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const CHARGER_TYPES = ['CCS1 · DC', 'CCS2 · DC', 'CHAdeMO · DC', 'Tesla (Plug) · AC/DC', 'J1772 (Type 1) · AC', 'Mennekes (Type 2) · AC'];
const REVIEW_TIERS = ['4.5 and above', '4.0 - 4.5', '3.5 - 4.0', '3.0 - 3.5'];

export default function FilterScreen() {
  const [useCurrentLocation, setUseCurrentLocation] = useState(true);
  const [selectedChargers, setSelectedChargers] = useState<string[]>(['CCS1 · DC', 'CCS2 · DC', 'Tesla (Plug) · AC/DC']);
  const [access, setAccess] = useState<'available' | 'in_use'>('available');
  const [cost, setCost] = useState<'fee' | 'free'>('fee');
  const [reviewTier, setReviewTier] = useState('4.5 and above');
  const [traffic, setTraffic] = useState(true);

  const buttonColor = useThemeColor({}, 'button');
  const cardBg = useThemeColor({}, 'card');

  const toggleCharger = (type: string) => {
    setSelectedChargers((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };

  const handleApply = () => {
    // Pass filters back via params or a shared state/store as needed
    router.back();
  };

  const handleReset = () => {
    setSelectedChargers([]);
    setAccess('available');
    setCost('fee');
    setReviewTier('4.5 and above');
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Ionicons name="close" size={26} />
        </Pressable>
        <ThemedText type="title" style={styles.headerTitle}>Filter</ThemedText>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <ThemedText style={styles.sectionTitle}>Location</ThemedText>
          <View style={styles.rowBetween}>
            <ThemedText>Use My Current Location</ThemedText>
            <Switch value={useCurrentLocation} onValueChange={setUseCurrentLocation} trackColor={{ true: buttonColor }} />
          </View>
        </View>

        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <ThemedText style={styles.sectionTitle}>Charger Type</ThemedText>
          {CHARGER_TYPES.map((type) => (
            <Pressable key={type} style={styles.rowBetween} onPress={() => toggleCharger(type)}>
              <ThemedText>{type}</ThemedText>
              <View style={[styles.checkbox, selectedChargers.includes(type) && { backgroundColor: buttonColor, borderColor: buttonColor }]}>
                {selectedChargers.includes(type) && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <ThemedText style={styles.sectionTitle}>Access</ThemedText>
          {(['available', 'in_use'] as const).map((val) => (
            <Pressable key={val} style={styles.rowBetween} onPress={() => setAccess(val)}>
              <View style={styles.radioLabel}>
                <View style={[styles.pinIcon, { backgroundColor: val === 'available' ? buttonColor : '#E53935' }]}>
                  <Ionicons name="flash" size={14} color="#fff" />
                </View>
                <ThemedText>{val === 'available' ? 'Available Stations' : 'In Use Stations'}</ThemedText>
              </View>
              <View style={[styles.radio, access === val && { borderColor: buttonColor }]}>
                {access === val && <View style={[styles.radioDot, { backgroundColor: buttonColor }]} />}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <ThemedText style={styles.sectionTitle}>Cost</ThemedText>
          {(['fee', 'free'] as const).map((val) => (
            <Pressable key={val} style={styles.rowBetween} onPress={() => setCost(val)}>
              <ThemedText>{val === 'fee' ? 'Requires Fee' : 'Free'}</ThemedText>
              <View style={[styles.radio, cost === val && { borderColor: buttonColor }]}>
                {cost === val && <View style={[styles.radioDot, { backgroundColor: buttonColor }]} />}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <ThemedText style={styles.sectionTitle}>Reviews</ThemedText>
          {REVIEW_TIERS.map((tier) => (
            <Pressable key={tier} style={styles.rowBetween} onPress={() => setReviewTier(tier)}>
              <ThemedText>{tier}</ThemedText>
              <View style={[styles.radio, reviewTier === tier && { borderColor: buttonColor }]}>
                {reviewTier === tier && <View style={[styles.radioDot, { backgroundColor: buttonColor }]} />}
              </View>
            </Pressable>
          ))}
        </View>

        <View style={[styles.section, { backgroundColor: cardBg }]}>
          <ThemedText style={styles.sectionTitle}>Map</ThemedText>
          <View style={styles.rowBetween}>
            <ThemedText>Traffic</ThemedText>
            <Switch value={traffic} onValueChange={setTraffic} trackColor={{ true: buttonColor }} />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable style={[styles.resetBtn, { backgroundColor: cardBg }]} onPress={handleReset}>
          <ThemedText style={{ color: buttonColor, fontWeight: '600' }}>Reset Filter</ThemedText>
        </Pressable>
        <Pressable style={[styles.applyBtn, { backgroundColor: buttonColor }]} onPress={handleApply}>
          <ThemedText style={styles.applyBtnText}>Apply</ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60, paddingHorizontal: 16 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 20 },
  headerTitle: { fontSize: 22 },
  section: { borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontWeight: '700', marginBottom: 12 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8 },
  checkbox: { width: 22, height: 22, borderRadius: 6, borderWidth: 1.5, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' },
  radioDot: { width: 12, height: 12, borderRadius: 6 },
  radioLabel: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  pinIcon: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  footer: { flexDirection: 'row', gap: 12, paddingVertical: 16 },
  resetBtn: { flex: 1, borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  applyBtn: { flex: 1, borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '600' },
});