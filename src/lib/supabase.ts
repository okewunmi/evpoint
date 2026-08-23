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

// export async function getStationReviews(stationId: string) {
//   const { data, error } = await supabase
//     .from('reviews')
//     .select('*')
//     .eq('station_id', stationId)
//     .order('created_at', { ascending: false });
//   return { data, error };
// }

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

export async function getStationReviews(stationId: string, sortBy: 'newest' | 'oldest' = 'newest') {
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('station_id', stationId)
    .order('created_at', { ascending: sortBy === 'oldest' });
  return { data, error };
}

export async function getReviewBreakdown(stationId: string) {
  const { data, error } = await supabase.from('reviews').select('rating').eq('station_id', stationId);
  if (error || !data) return { breakdown: [0, 0, 0, 0, 0], error };

  const breakdown = [0, 0, 0, 0, 0]; // index 0 = 1-star, index 4 = 5-star
  data.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) breakdown[r.rating - 1]++;
  });
  return { breakdown, error: null };
}

export async function createReview(stationId: string, userId: string, rating: number, comment: string) {
  const { data, error } = await supabase
    .from('reviews')
    .insert({ station_id: stationId, user_id: userId, rating, comment })
    .select()
    .single();

  if (!error) {
    // Recalculate and update station's aggregate rating/count
    const { data: allReviews } = await supabase.from('reviews').select('rating').eq('station_id', stationId);
    if (allReviews && allReviews.length > 0) {
      const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
      await supabase
        .from('stations')
        .update({ rating: Math.round(avg * 10) / 10, review_count: allReviews.length })
        .eq('id', stationId);
    }
  }

  return { data, error };
} 

export async function searchStations(query: string) {
  const { data, error } = await supabase
    .from('stations')
    .select('*')
    .ilike('name', `%${query}%`)
    .limit(30);
  return { data, error };
}

export async function getFilteredStations(filters: {
  status?: 'available' | 'in_use';
  minRating?: number;
}) {
  let q = supabase.from('stations').select('*');
  if (filters.status) q = q.eq('status', filters.status);
  if (filters.minRating) q = q.gte('rating', filters.minRating);
  const { data, error } = await q;
  return { data, error };
}

export async function getFavoriteStations(userId: string) {
  const { data, error } = await supabase
    .from('favorites')
    .select('station_id, stations(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error || !data) return { data: [], error };

  // Get charger counts for each station
  const stations = data.map((f: any) => f.stations).filter(Boolean);
  const stationsWithChargerCount = await Promise.all(
    stations.map(async (station: any) => {
      const { count } = await supabase
        .from('chargers')
        .select('*', { count: 'exact', head: true })
        .eq('station_id', station.id);
      return { ...station, charger_count: count ?? 0 };
    })
  );

  return { data: stationsWithChargerCount, error: null };
}