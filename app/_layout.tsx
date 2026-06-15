import { Stack, router, Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';
import { useCartSync } from '@/hooks/useCartSync';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import * as SecureStore from '@/utils/storage';
import { registerForPushNotificationsAsync } from '@/utils/notifications';
import axios from 'axios';
import { BASE_URL } from '@/constants/config';

// Configure how notifications should display (FCM handles this natively)

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

  useEffect(() => {
    // Handle foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('[FCM] Foreground message received:', JSON.stringify(remoteMessage));
    });

    // Handle notification clicks when app is in background
    messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('[FCM] Notification opened from background:', remoteMessage.data);
      const data = remoteMessage.data;
      if (data && data.url && typeof data.url === 'string') {
        router.push(data.url as Href);
      }
    });

    // Handle notification clicks when app is in quit state
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        const data = remoteMessage?.data;
        if (remoteMessage && data && data.url && typeof data.url === 'string') {
          console.log('[FCM] Notification opened from quit state:', data);
          setTimeout(() => {
            router.push(data.url as Href);
          }, 1000);
        }
      });

    return unsubscribe;
  }, [isReady]);

  useCartSync();

  // Payment Recovery Logic
  useEffect(() => {
    const checkPendingOrder = async () => {
      if (!authInitialized || !isAuthenticated) return;

      try {
        const pendingOrderId = await SecureStore.getItemAsync('pending_verification_order_id');
        if (pendingOrderId) {
          console.log('[Recovery] Found pending order:', pendingOrderId);
          
          const token = await SecureStore.getItemAsync('userToken');
          const { data } = await axios.get(`${BASE_URL}/orders/me/${pendingOrderId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (data && data.data && data.data.orderStatus === 'processing') {
            console.log('[Recovery] Order was successful! Navigating to success...');
            await SecureStore.deleteItemAsync('pending_verification_order_id');
            
            const cartStore = useCartStore.getState();
            cartStore.clearCart();
            cartStore.removeCoupon();
            
            setTimeout(() => {
              router.replace({
                pathname: '/success',
                params: { orderId: pendingOrderId }
              } as any);
            }, 1000);
          } else {
            console.log('[Recovery] Order still pending or failed. Status:', data?.data?.orderStatus);
          }
        }
      } catch (error) {
        console.error('[Recovery] Failed to check pending order:', error);
      }
    };

    if (authInitialized && isReady) {
      checkPendingOrder();
    }
  }, [authInitialized, isAuthenticated, isReady]);

  useEffect(() => {
    // Initialize Auth first
    initializeAuth();
    
    // Onboarding disabled by user request - set ready immediately
    setIsReady(true);
  }, []);

  useEffect(() => {
    // Only fetch from backend once EVERYTHING is ready
    if (cartHydrated && wishlistHydrated && authInitialized) {
      console.log('App ready: Hydrated and Authenticated. Syncing data...');
      initializeCart();
      fetchWishlist();
      setIsReady(true);

      // Register device push token when authenticated
      if (isAuthenticated) {
        registerForPushNotificationsAsync();
      }
    }
  }, [cartHydrated, wishlistHydrated, authInitialized, isAuthenticated]);

  if (!isReady || !authInitialized || !cartHydrated || !wishlistHydrated) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
        <Stack initialRouteName="(drawer)">
          <Stack.Screen name="(drawer)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="profile" options={{ headerShown: false }} />
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
});
