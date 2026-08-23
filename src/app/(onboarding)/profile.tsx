import React, { useState } from 'react';
import { TextInput, Pressable, Image, StyleSheet, Alert, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';
import { useThemeColor } from '@/hooks/useThemeColor';
import { upsertProfile } from '@/lib/supabase';

const GENDERS = ['Male', 'Female', 'Other'];

export default function ProfileStep() {
  const { user } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [gender, setGender] = useState<string | null>(null);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [dob, setDob] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const buttonColor = useThemeColor({}, 'button');
  const borderColor = useThemeColor({ light: '#E0E0E0', dark: '#3A3D46' }, 'icon');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled) setAvatarUri(result.assets[0].uri);
  };

  const handleContinue = async () => {
    if (!fullName.trim() || !email.trim() || !gender || !dob.trim()) {
      Alert.alert('Please fill in all fields');
      return;
    }
    if (!user) return;

    setSubmitting(true);
    // Note: avatar upload to Supabase Storage is a separate step — see note below
    const { error } = await upsertProfile(user.id, {
      full_name: fullName.trim(),
      email: email.trim(),
      gender,
      date_of_birth: dob.trim(),
    } as any);
    setSubmitting(false);

    if (error) {
      Alert.alert('Something went wrong', error.message);
      return;
    }
    router.push('/(onboarding)/add-vehicle');
  };

  return (
    <ThemedView style={styles.container}>
      <Pressable onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={26} />
      </Pressable>

      <ThemedText type="title" style={styles.heading}>Complete your profile 📋</ThemedText>
      <ThemedText style={styles.subtext}>
        Don't worry, only you can see your personal data. No one else will be able to see it.
      </ThemedText>

      <Pressable style={styles.avatarWrap} onPress={pickImage}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatar} />
        ) : (
          <ThemedView style={[styles.avatar, styles.avatarPlaceholder, { borderColor }]}>
            <Ionicons name="person" size={40} color={borderColor} />
          </ThemedView>
        )}
        <View style={[styles.editBadge, { backgroundColor: buttonColor }]}>
          <Ionicons name="pencil" size={14} color="#fff" />
        </View>
      </Pressable>

      <ThemedText style={styles.label}>Full Name</ThemedText>
      <TextInput value={fullName} onChangeText={setFullName} style={[styles.input, { borderColor }]} placeholder="Your name" placeholderTextColor="#999" />

      <ThemedText style={styles.label}>Email</ThemedText>
      <TextInput value={email} onChangeText={setEmail} style={[styles.input, { borderColor }]} keyboardType="email-address" autoCapitalize="none" />

      <ThemedText style={styles.label}>Gender</ThemedText>
      <Pressable onPress={() => setShowGenderPicker(!showGenderPicker)} style={[styles.input, { borderColor }, styles.selectRow]}>
        <ThemedText>{gender ?? 'Select gender'}</ThemedText>
        <Ionicons name="chevron-down" size={18} />
      </Pressable>
      {showGenderPicker && (
        <View style={[styles.dropdown, { borderColor }]}>
          {GENDERS.map((g) => (
            <Pressable key={g} onPress={() => { setGender(g); setShowGenderPicker(false); }} style={styles.dropdownItem}>
              <ThemedText>{g}</ThemedText>
            </Pressable>
          ))}
        </View>
      )}

      <ThemedText style={styles.label}>Date of Birth</ThemedText>
      <TextInput value={dob} onChangeText={setDob} style={[styles.input, { borderColor }]} placeholder="MM/DD/YYYY" placeholderTextColor="#999" />

      <Pressable style={[styles.button, { backgroundColor: buttonColor }]} onPress={handleContinue} disabled={submitting}>
        <ThemedText style={styles.buttonText}>{submitting ? 'Saving…' : 'Continue'}</ThemedText>
      </Pressable>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60 },
  backBtn: { marginBottom: 20 },
  heading: { fontSize: 26, marginBottom: 12 },
  subtext: { opacity: 0.7, marginBottom: 20, lineHeight: 20 },
  avatarWrap: { alignSelf: 'center', marginBottom: 24 },
  avatar: { width: 110, height: 110, borderRadius: 55 },
  avatarPlaceholder: { alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  editBadge: { position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  label: { fontWeight: '600', marginBottom: 6, marginTop: 12 },
  input: { borderBottomWidth: 1, paddingVertical: 10, fontSize: 16 },
  selectRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdown: { borderWidth: 1, borderRadius: 8, marginTop: 4 },
  dropdownItem: { padding: 12 },
  button: { borderRadius: 30, paddingVertical: 16, alignItems: 'center', marginTop: 32 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});