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

export async function getNearbyStations() {
  const { data, error } = await supabase.from('stations').select('*');
  return { data, error };
}

export async function getStationDetail(stationId: string) {
  const { data, error } = await supabase.from('stations').select('*').eq('id', stationId).single();
  return { data, error };
}

export async function getStationChargers(stationId: string) {
  const { data, error } = await supabase.from('chargers').select('*').eq('station_id', stationId);
  return { data, error };
}

export async function getStationCheckIns(stationId: string) {
  const { data, error } = await supabase
    .from('check_ins')
    .select('*')
    .eq('station_id', stationId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function getStationReviews(stationId: string) {
  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('station_id', stationId)
    .order('created_at', { ascending: false });
  return { data, error };
}

export async function createCheckIn(fields: {
  station_id: string;
  user_id: string;
  check_in_type: string;
  comment?: string;
  max_kw?: number;
  wait_duration?: string;
  problem_type?: string;
}) {
  const { data, error } = await supabase.from('check_ins').insert(fields).select().single();
  return { data, error };
}

export function getDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function getStationHours(stationId: string) {
  const { data, error } = await supabase.from('station_hours').select('*').eq('station_id', stationId);
  return { data, error };
}

export async function getStationAmenities(stationId: string) {
  const { data, error } = await supabase.from('station_amenities').select('*').eq('station_id', stationId);
  return { data, error };
}

export async function toggleFavorite(userId: string, stationId: string, isFavorited: boolean) {
  if (isFavorited) {
    const { error } = await supabase.from('favorites').delete().eq('user_id', userId).eq('station_id', stationId);
    return { error };
  }
  const { error } = await supabase.from('favorites').insert({ user_id: userId, station_id: stationId });
  return { error };
}

export async function isFavorited(userId: string, stationId: string) {
  const { data } = await supabase.from('favorites').select('id').eq('user_id', userId).eq('station_id', stationId).maybeSingle();
  return !!data;
}