import React, { useState, useRef, useEffect } from 'react';
import { View, TextInput, Pressable, StyleSheet, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { supabase, getProfile, isProfileComplete } from '@/lib/supabase';

export default function EnterCodeScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const { verifyOtp, sendOtp } = useAuth();
  const [digits, setDigits] = useState(['', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(48);
  const inputRef = useRef<TextInput>(null);

  const buttonColor = useThemeColor({}, 'button');
  const borderColor = useThemeColor({ light: '#E0E0E0', dark: '#3A3D46' }, 'icon');
  const cardBg = useThemeColor({}, 'card');
  const textColor = useThemeColor({}, 'text');

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const maskedEmail = email ? email.replace(/(.{2}).+(@.+)/, '$1•••$2') : '';

  const handleChange = (text: string) => {
    const clean = text.replace(/[^0-9]/g, '').slice(0, 4);
    const next = ['', '', '', ''];
    for (let i = 0; i < clean.length; i++) next[i] = clean[i];
    setDigits(next);

    if (clean.length === 4) {
      handleVerify(clean);
    }
  };

  const handleVerify = async (code: string) => {
    setSubmitting(true);
    const { error } = await verifyOtp(email, code);

    if (error) {
      setSubmitting(false);
      Alert.alert('Verification failed', error.message);
      setDigits(['', '', '', '']);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    setSubmitting(false);

    if (!user) {
      router.replace('/(tabs)');
      return;
    }

    const { data: profile } = await getProfile(user.id);

    if (isProfileComplete(profile)) {
      router.replace('/(tabs)');
    } else {
      router.replace('/(onboarding)/profile');
    }
  };

  const handleResend = async () => {
    const { error } = await sendOtp(email);
    if (!error) setCountdown(48);
  };

  const currentValue = digits.join('');

  return (
    <ThemedView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={26} color={textColor} />
      </Pressable>

      <ThemedText type="title" style={styles.heading}>OTP code verification 🔒</ThemedText>
      <ThemedText style={styles.subtext}>
        We have sent an OTP code to {maskedEmail}. Enter the OTP code below to continue.
      </ThemedText>

      <Pressable style={styles.boxRow} onPress={() => inputRef.current?.focus()}>
        {[0, 1, 2, 3].map((i) => (
          <View
            key={i}
            style={[
              styles.box,
              { backgroundColor: cardBg },
              currentValue.length === i && { borderWidth: 2, borderColor: buttonColor },
            ]}
          >
            <ThemedText style={styles.boxText}>{digits[i]}</ThemedText>
          </View>
        ))}
      </Pressable>

      <TextInput
        ref={inputRef}
        value={currentValue}
        onChangeText={handleChange}
        keyboardType="number-pad"
        maxLength={4}
        style={styles.hiddenInput}
        autoFocus
      />

      <ThemedText style={styles.resendLabel}>Didn't receive email?</ThemedText>
      <ThemedText style={styles.resendTimer}>
        {countdown > 0 ? (
          <>You can resend code in <ThemedText style={{ color: buttonColor }}>{countdown}</ThemedText> s</>
        ) : (
          <ThemedText style={{ color: buttonColor }} onPress={handleResend}>Resend code</ThemedText>
        )}
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 24 },
  heading: { fontSize: 28, marginBottom: 16 },
  subtext: { opacity: 0.7, marginBottom: 32, lineHeight: 22 },
  boxRow: { flexDirection: 'row', gap: 14, marginBottom: 32 },
  box: { width: 60, height: 60, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  boxText: { fontSize: 24, fontWeight: '700' },
  hiddenInput: { position: 'absolute', opacity: 0, height: 0 },
  resendLabel: { textAlign: 'center', marginBottom: 8 },
  resendTimer: { textAlign: 'center' },
});