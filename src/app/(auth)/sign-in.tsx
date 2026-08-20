import React, { useState } from 'react';
import { TextInput, Pressable, Alert } from 'react-native';
import { Link, router } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/context/AuthContext';

export default function SignInScreen() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async () => {
    setSubmitting(true);
    const { error } = await signIn(email, password);
    setSubmitting(false);

    if (error) {
      Alert.alert('Sign in failed', error.message);
      return;
    }
    router.replace('/(tabs)');
  };

  return (
    <ThemedView style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <ThemedText type="title" style={{ marginBottom: 24 }}>Sign In</ThemedText>

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
        style={{ borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 20 }}
      />

      <Pressable onPress={handleSignIn} disabled={submitting} style={{ backgroundColor: '#0a7ea4', padding: 14, borderRadius: 8, alignItems: 'center' }}>
        <ThemedText style={{ color: '#fff' }}>{submitting ? 'Signing in…' : 'Sign In'}</ThemedText>
      </Pressable>

      <Link href="/(auth)/sign-up" style={{ marginTop: 16, textAlign: 'center' }}>
        <ThemedText type="link">Don't have an account? Sign up</ThemedText>
      </Link>
    </ThemedView>
  );
}