import { StyleSheet, Pressable, View } from 'react-native';
import { router } from 'expo-router';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useLocationPermission } from '@/hooks/useLocationPermission';
import { Image } from 'react-native';
import React from 'react';

export default function RouteActiveScreen() {
  const { coords } = useLocationPermission();
  const buttonColor = useThemeColor({}, 'button');

  const destination = { latitude: (coords?.latitude ?? 40.66) + 0.01, longitude: (coords?.longitude ?? -73.97) + 0.01 };
  const origin = coords ?? { latitude: 40.66, longitude: -73.97 };

  return (
    <View style={styles.container}>
      <MapView style={StyleSheet.absoluteFill} initialRegion={{ ...origin, latitudeDelta: 0.03, longitudeDelta: 0.03 }}>
        <Marker coordinate={origin}>
          <Image source={require('@/assets/images/car-top-icon.png')} style={styles.carIcon} />
        </Marker>
        <Marker coordinate={destination}>
          <View style={[styles.pin, { backgroundColor: buttonColor }]}>
            <Ionicons name="flash" size={16} color="#fff" />
          </View>
        </Marker>
        <Polyline coordinates={[origin, destination]} strokeColor={buttonColor} strokeWidth={5} />
      </MapView>

      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Ionicons name="chevron-back" size={26} />
      </Pressable>

      <Pressable style={[styles.recenterBtn, { backgroundColor: buttonColor }]}>
        <Ionicons name="locate" size={20} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  carIcon: { width: 44, height: 44, resizeMode: 'contain' },
  pin: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  backBtn: { position: 'absolute', top: 50, left: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  recenterBtn: { position: 'absolute', bottom: 40, right: 16, width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center' },
});