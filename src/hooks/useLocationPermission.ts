import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export function useLocationPermission() {
  const [showModal, setShowModal] = useState(false);
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    (async () => {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({});
        setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
      } else {
        setShowModal(true);
      }
      setChecked(true);
    })();
  }, []);

  const requestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === 'granted') {
      const loc = await Location.getCurrentPositionAsync({});
      setCoords({ latitude: loc.coords.latitude, longitude: loc.coords.longitude });
    }
    setShowModal(false);
  };

  return { showModal, setShowModal, coords, checked, requestPermission };
}