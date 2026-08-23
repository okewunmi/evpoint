import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react'
type Props = {
  visible: boolean;
  onEnable: () => void;
  onCancel: () => void;
};

export default function EnableLocationModal({ visible, onEnable, onCancel }: Props) {
  const buttonColor = useThemeColor({}, 'button');
  const cardBg = useThemeColor({}, 'card');

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <ThemedView style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: buttonColor }]}>
            <Ionicons name="location" size={44} color="#fff" />
          </View>
          <ThemedText style={[styles.title, { color: buttonColor }]}>Enable Location</ThemedText>
          <ThemedText style={styles.subtitle}>
            We need access to your location to find EV charging stations around you.
          </ThemedText>
          <Pressable style={[styles.enableBtn, { backgroundColor: buttonColor }]} onPress={onEnable}>
            <ThemedText style={styles.enableBtnText}>Enable Location</ThemedText>
          </Pressable>
          <Pressable style={[styles.cancelBtn, { backgroundColor: cardBg }]} onPress={onCancel}>
            <ThemedText style={{ color: buttonColor, fontWeight: '600' }}>Cancel</ThemedText>
          </Pressable>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', borderRadius: 24, padding: 28, alignItems: 'center' },
  iconCircle: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: '700', marginBottom: 12 },
  subtitle: { textAlign: 'center', opacity: 0.7, marginBottom: 24, lineHeight: 22 },
  enableBtn: { width: '100%', borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginBottom: 10 },
  enableBtnText: { color: '#fff', fontWeight: '600' },
  cancelBtn: { width: '100%', borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
});