import { Stack, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useCartSync } from '@/hooks/useCartSync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '@/utils/notifications';

// Configure how notifications should display when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldSetBadge: false,
  }),
});

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
  const fetchWishlist = useWishlistStore((state) => state.fetchWishlist);
  const initializeAuth = useAuthStore((state) => state.initialize);
  const authInitialized = useAuthStore((state) => state.isInitialized);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  
  const [isReady, setIsReady] = useState(false);

  useCartSync();

  useEffect(() => {
    // Initialize Auth first
    initializeAuth();
    
    // Check onboarding status
    const checkOnboarding = async () => {
      try {
        const hasSeen = await AsyncStorage.getItem('hasSeenOnboarding');
        if (!hasSeen) {
          // Add a small delay to ensure router is ready
          setTimeout(() => {
            router.replace('/onboarding');
          }, 100);
        }
      } catch (e) {
        console.error('Failed to check onboarding status', e);
      } finally {
        setIsReady(true);
      }
    };
    
    checkOnboarding();
  }, []);

  useEffect(() => {
    // Only fetch from backend once EVERYTHING is ready
    if (cartHydrated && wishlistHydrated && authInitialized && isReady) {
      console.log('App ready: Hydrated and Authenticated. Syncing data...');
      initializeCart();
      fetchWishlist();

      // Register device push token when authenticated
      if (isAuthenticated) {
        registerForPushNotificationsAsync();
      }
    }
  }, [cartHydrated, wishlistHydrated, authInitialized, isReady, isAuthenticated]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack>
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="legal" options={{ headerShown: false }} />
          <Stack.Screen name="checkout" options={{ title: 'Checkout' }} />
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
