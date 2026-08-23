import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();
  return { data, error };
}

export async function upsertProfile(
  userId: string,
  fields: Partial<{
    full_name: string;
    email: string;
    gender: string;
    date_of_birth: string;
    avatar_url: string;
  }>
) {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...fields, updated_at: new Date().toISOString() })
    .select()
    .single();
  return { data, error };
}

export function isProfileComplete(
  profile: {
    full_name?: string | null;
    email?: string | null;
    gender?: string | null;
    date_of_birth?: string | null;
  } | null
) {
  if (!profile) return false;
  return Boolean(profile.full_name && profile.email && profile.gender && profile.date_of_birth);
}

export async function getBrands() {
  const { data, error } = await supabase.from('vehicle_brands').select('*').order('name');
  return { data, error };
}

export async function getModels(brandId: string) {
  const { data, error } = await supabase.from('vehicle_models').select('*').eq('brand_id', brandId).order('name');
  return { data, error };
}

export async function getTrims(modelId: string) {
  const { data, error } = await supabase.from('vehicle_trims').select('*').eq('model_id', modelId).order('name');
  return { data, error };
}

export async function addUserVehicle(userId: string, brand: string, model: string, trim: string | null) {
  const { data, error } = await supabase
    .from('user_vehicles')
    .insert({ user_id: userId, brand_name: brand, model_name: model, trim_name: trim })
    .select()
    .single();
  return { data, error };
}