import React, { useState } from 'react';
import { TextInput, Pressable, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';

export default function SignUpScreen() {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Password too short', 'Use at least 6 characters.');
      return;
    }

    setSubmitting(true);
    const { error } = await signUp(email, password);
    setSubmitting(false);

    if (error) {
      Alert.alert('Sign up failed', error.message);
      return;
    }

    // Supabase requires email confirmation by default — no session yet.
    setEmailSent(true);
  };

  if (emailSent) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <ThemedText type="title" style={{ marginBottom: 12, textAlign: 'center' }}>
          Check your email
        </ThemedText>
        <ThemedText style={{ textAlign: 'center', marginBottom: 24 }}>
          We sent a confirmation link to {email}. Confirm your email, then sign in.
        </ThemedText>
        <Link href="/(auth)/sign-in">
          <ThemedText type="link">Back to Sign In</ThemedText>
        </Link>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <ThemedText type="title" style={{ marginBottom: 24 }}>Create Account</ThemedText>

      <TextInput
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 }}
      />
      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12 }}
      />
      <TextInput
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        style={{ borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 20 }}
      />

      <Pressable onPress={handleSignUp} disabled={submitting} style={{ backgroundColor: '#0a7ea4', padding: 14, borderRadius: 8, alignItems: 'center' }}>
        <ThemedText style={{ color: '#fff' }}>{submitting ? 'Creating account…' : 'Sign Up'}</ThemedText>
      </Pressable>

      <Link href="/(auth)/sign-in" style={{ marginTop: 16, textAlign: 'center' }}>
        <ThemedText type="link">Already have an account? Sign in</ThemedText>
      </Link>
    </ThemedView>
  );
}