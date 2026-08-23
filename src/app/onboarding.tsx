import React, { useRef, useState } from 'react';
import { View, FlatList, Pressable, Image, StyleSheet, useWindowDimensions, ViewToken } from 'react-native';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

const SLIDES = [
  {
    id: '1',
    title: 'Easily find EV charging stations around you',
    subtitle: 'Locate nearby charging points in real time, wherever you are.',
    image: require('@/assets/images/onboarding-1.png'),
  },
  {
    id: '2',
    title: 'Check availability before you arrive',
    subtitle: 'See which stations are open, busy, or out of service instantly.',
    image: require('@/assets/images/onboarding-2.png'),
  },
  {
    id: '3',
    title: 'Plan your route with confidence',
    subtitle: 'Get directions and save your favorite stations for quick access.',
    image: require('@/assets/images/onboarding-3.png'),
  },
];

export default function OnboardingScreen() {
  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const buttonColor = useThemeColor({}, 'button');
  const cardBg = useThemeColor({}, 'card');
  const dotInactive = useThemeColor({ light: '#E0E0E0', dark: '#3A3D46' }, 'icon');

  const finishOnboarding = async () => {
    await AsyncStorage.setItem('hasSeenOnboarding', 'true');
    router.replace('/(auth)/sign-in');
  };

  const handleNext = () => {
    if (activeIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      finishOnboarding();
    }
  };

  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    if (viewableItems[0]) setActiveIndex(viewableItems[0].index ?? 0);
  }).current;

  return (
    <ThemedView style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
        renderItem={({ item }) => (
          <View style={{ width }}>
            <Image source={item.image} style={styles.illustration} resizeMode="contain" />
            <ThemedText type="title" style={styles.title}>{item.title}</ThemedText>
            <ThemedText style={styles.subtitle}>{item.subtitle}</ThemedText>
          </View>
        )}
      />

      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === activeIndex ? buttonColor : dotInactive },
              i === activeIndex && styles.dotActive,
            ]}
          />
        ))}
      </View>

      <View style={styles.buttonRow}>
        <Pressable style={[styles.skipBtn, { backgroundColor: cardBg }]} onPress={finishOnboarding}>
          <ThemedText style={{ color: buttonColor, fontWeight: '600' }}>Skip</ThemedText>
        </Pressable>
        <Pressable style={[styles.nextBtn, { backgroundColor: buttonColor }]} onPress={handleNext}>
          <ThemedText style={styles.nextBtnText}>
            {activeIndex === SLIDES.length - 1 ? 'Get Started' : 'Next'}
          </ThemedText>
        </Pressable>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  illustration: { width: '100%', height: 380, marginBottom: 24 },
  title: { fontSize: 26, textAlign: 'center', paddingHorizontal: 24, marginBottom: 12, lineHeight: 32 },
  subtitle: { textAlign: 'center', paddingHorizontal: 32, opacity: 0.6, lineHeight: 22 },
  dotsRow: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginVertical: 24 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  buttonRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 24, paddingBottom: 40 },
  skipBtn: { flex: 1, borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  nextBtn: { flex: 1, borderRadius: 30, paddingVertical: 16, alignItems: 'center' },
  nextBtnText: { color: '#fff', fontWeight: '600' },
});