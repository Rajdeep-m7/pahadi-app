import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useCartStore } from '@/store/cartStore';
import { useWishlistStore } from '@/store/wishlistStore';
import { useAuthStore } from '@/store/authStore';

const DEBOUNCE_MS = 1500;

/**
 * useCartSync
 * 
 * Watches cart and wishlist store items and syncs to backend.
 * - Debounces cart syncToBackend by 1.5s when isDirty is true.
 * - Handles fetch and AppState changes for both cart and wishlist.
 * - Handles clear on logout and fetch on login.
 */
export function useCartSync() {
  const items = useCartStore((s) => s.items);
  const isDirty = useCartStore((s) => s.isDirty);
  const syncToBackend = useCartStore((s) => s.syncToBackend);
  const fetchCart = useCartStore((s) => s.fetchCart);
  const fetchAndMergeCart = useCartStore((s) => s.fetchAndMerge);

  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const wishlistIsDirty = useWishlistStore((s) => s.isDirty);
  
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const prevAuthRef = useRef(isAuthenticated);

  // 1. Sync local cart changes to backend with debounce
  useEffect(() => {
    if (!isDirty || !isAuthenticated) return;

    const timer = setTimeout(async () => {
      await syncToBackend();
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [items, isDirty, isAuthenticated, syncToBackend]);

  // 2. Handle Login/Logout transitions
  useEffect(() => {
    if (!prevAuthRef.current && isAuthenticated) {
      // User just logged in - merge local items with account items
      fetchAndMergeCart();
      fetchWishlist();
    } else if (prevAuthRef.current && !isAuthenticated) {
      // User just logged out - clear local data for privacy
      useCartStore.getState().clearCart();
      useWishlistStore.getState().clearWishlist();
    }
    prevAuthRef.current = isAuthenticated;
  }, [isAuthenticated, fetchAndMergeCart, fetchWishlist]);

  // 3. Initial fetch and AppState listener for Foreground refresh
  useEffect(() => {
    // Initial fetch on mount
    if (isAuthenticated) {
      if (!isDirty) fetchCart();
      if (!wishlistIsDirty) fetchWishlist();
    }

    // Listener for app state changes (resume from background)
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isAuthenticated) {
        console.log('App resumed: Refreshing cart and wishlist...');
        if (!isDirty) fetchCart();
        if (!wishlistIsDirty) fetchWishlist();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    
    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, isDirty, wishlistIsDirty, fetchCart, fetchWishlist]);
}
