import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';

const GlobalToast = () => {
  const toast = useCartStore((state) => state.toast);
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toast?.visible) {
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [toast?.visible, toast?.message]);

  if (!toast?.visible) return null;

  return (
    <Animated.View style={[styles.toastContainer, { opacity }]}>
      <Text style={styles.toastText}>{toast.message}</Text>
    </Animated.View>
  );
};

export const unstable_settings = {
  anchor: '(drawer)',
};

export default function RootLayout() {
  const initializeCart = useCartStore((state) => state.fetchAndMerge);
  const cartHydrated = useCartStore((state) => state._hasHydrated);
  const wishlistHydrated = useWishlistStore((state) => state._hasHydrated);
  const initializeAuth = useAuthStore((state) => state.initialize);
  const authInitialized = useAuthStore((state) => state.isInitialized);

  useEffect(() => {
    // Initialize Auth first
    initializeAuth();
  }, []);

  useEffect(() => {
    // Only fetch from backend once EVERYTHING is ready
    if (cartHydrated && wishlistHydrated && authInitialized) {
      console.log('App ready: Hydrated and Authenticated. Syncing data...');
      initializeCart();
    }
  }, [cartHydrated, wishlistHydrated, authInitialized]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        </Stack>
        <GlobalToast />
        <StatusBar style="auto" />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#111827',
    padding: 16,
    borderRadius: 12,
    zIndex: 9999,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  toastText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
