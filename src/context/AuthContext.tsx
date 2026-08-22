import React, { createContext, useContext, useEffect, useState } from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from '@/lib/supabase';
import type { Session, User } from '@supabase/supabase-js';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

// GoogleSignin.configure({
//   webClientId: 'YOUR_WEB_CLIENT_ID.apps.googleusercontent.com', // from Google Cloud Console
// });

WebBrowser.maybeCompleteAuthSession();

type AuthContextType = {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  // const signInWithGoogle = async () => {
  //   const redirectUrl = Linking.createURL('auth/callback');

  //   const { data, error } = await supabase.auth.signInWithOAuth({
  //     provider: 'google',
  //     options: {
  //       redirectTo: redirectUrl,
  //       skipBrowserRedirect: true,
  //     },
  //   });

  //   if (error || !data?.url) {
  //     return { error: error ?? new Error('No OAuth URL returned') };
  //   }

  //   const result = await WebBrowser.openAuthSessionAsync(data.url, redirectUrl);

  //   if (result.type === 'success' && result.url) {
  //     const url = new URL(result.url);
  //     const params = new URLSearchParams(url.hash.replace('#', '') || url.search);
  //     const access_token = params.get('access_token');
  //     const refresh_token = params.get('refresh_token');

  //     if (access_token && refresh_token) {
  //       const { error: sessionError } = await supabase.auth.setSession({
  //         access_token,
  //         refresh_token,
  //       });
  //       return { error: sessionError };
  //     }
  //   }

  //   return { error: new Error('Google sign-in was cancelled or failed') };
  // };

  const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();

    const idToken = response.data?.idToken;
    if (!idToken) {
      return { error: new Error('No ID token returned from Google') };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: idToken,
    });

    return { error };
  } catch (err: any) {
    return { error: err };
  }
};

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, user: session?.user ?? null, loading, signIn, signUp, signInWithGoogle, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}