import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as SecureStore from '@/utils/storage';
import { BASE_URL } from '@/constants/config';

// Handles variantId that may be a string, an object { _id: string }, or { $oid: string }
function extractVariantId(vid: any): string {
  if (!vid) return '';
  if (typeof vid === 'string') return vid;
  if (typeof vid === 'object') {
    return String(vid._id || vid.$oid || vid.id || '');
  }
  return String(vid);
}

export interface CartItem {
  variantId: string;
  quantity: number;
  product: {
    _id: string;
    title: string;
    image: string;
    price: number;
    mrp?: number;
    discount?: number;
    categoryName?: string;
    stocks?: number;
  };
}

interface CartState {
  items: CartItem[];
  loading: boolean;
  isDirty: boolean; // true if local changes are not yet synced to backend
  lastSyncedAt: number | null;
  _hasHydrated: boolean;
  
  // Toast State
  toast: {
    message: string;
    visible: boolean;
  };
  showToast: (message: string) => void;
  hideToast: () => void;
  
  // Actions
  setHasHydrated: (state: boolean) => void;
  addToCart: (variantId: string, product: CartItem['product']) => void;
  removeFromCart: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => Promise<void>;
  
  // Backend Sync
  syncToBackend: () => Promise<void>;
  fetchCart: () => Promise<void>;
  mergeCart: (backendItems: CartItem[]) => void;
  fetchAndMerge: () => Promise<void>;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      isDirty: false,
      lastSyncedAt: null,
      _hasHydrated: false,
      toast: {
        message: '',
        visible: false,
      },

      showToast: (message) => {
        set({ toast: { message, visible: true } });
        setTimeout(() => {
           if (get().toast.message === message) {
             set({ toast: { ...get().toast, visible: false } });
           }
        }, 3000);
      },

      hideToast: () => set({ toast: { ...get().toast, visible: false } }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),

      addToCart: (variantId, product) => {
        const vidStr = extractVariantId(variantId);
        const { items } = get();
        const existingItem = items.find((item) => extractVariantId(item.variantId) === vidStr);

        let newItems;
        if (existingItem) {
          newItems = items.map((item) =>
            extractVariantId(item.variantId) === vidStr
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
        } else {
          newItems = [...items, { variantId: vidStr, quantity: 1, product }];
        }
        
        set({ items: newItems, isDirty: true });
        get().showToast(`Added ${product.title} to cart`);
      },

      removeFromCart: (variantId) => {
        const vidStr = extractVariantId(variantId);
        const itemToRemove = get().items.find(i => extractVariantId(i.variantId) === vidStr);
        set({
          items: get().items.filter((item) => extractVariantId(item.variantId) !== vidStr),
          isDirty: true,
        });
        if (itemToRemove) {
          get().showToast(`Removed from cart`);
        }
      },

      updateQuantity: (variantId, quantity) => {
        const vidStr = extractVariantId(variantId);
        if (quantity <= 0) {
          get().removeFromCart(vidStr);
          return;
        }
        set({
          items: get().items.map((item) =>
            extractVariantId(item.variantId) === vidStr ? { ...item, quantity } : item
          ),
          isDirty: true,
        });
      },

      clearCart: async () => {
        set({ items: [], isDirty: false });
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) return;

        try {
          await axios.delete(`${BASE_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } catch (error) {
          console.error('Failed to clear cart on backend:', error);
        }
      },

      syncToBackend: async () => {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token || !get()._hasHydrated) return;

        const payload = get().items.map(i => ({
          variantId: extractVariantId(i.variantId),
          quantity: i.quantity,
        }));

        try {
          await axios.put(`${BASE_URL}/cart/sync`, { items: payload }, {
            headers: { Authorization: `Bearer ${token}` },
          });
          set({ lastSyncedAt: Date.now(), isDirty: false });
        } catch (error) {
          console.error('Cart sync failed:', error);
        }
      },

      fetchCart: async () => {
        if (get().isDirty) return; // Don't overwrite local changes

        const token = await SecureStore.getItemAsync('userToken');
        if (!token) return;

        set({ loading: true });
        try {
          const { data } = await axios.get(`${BASE_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (data && data.data && data.data.items) {
            const backendItems = data.data.items.map((item: any) => ({
              variantId: extractVariantId(item.variantId),
              quantity: item.quantity,
              product: {
                _id: item.variantId?.productId?._id || '',
                title: item.variantId?.title || 'Product',
                image: item.variantId?.coverImage?.url || '',
                price: item.variantId?.price || 0,
                mrp: item.variantId?.mrp,
                discount: item.variantId?.discount,
                categoryName: item.variantId?.productId?.categoryId?.name || '',
                stocks: item.variantId?.stocks,
              },
            }));
            set({ items: backendItems, isDirty: false });
          }
        } catch (error) {
          console.error('Fetch cart failed:', error);
        } finally {
          set({ loading: false });
        }
      },

      mergeCart: (backendItems) => {
        const localItems = get().items;
        const mergedMap = new Map<string, CartItem>();

        backendItems.forEach(item => {
          mergedMap.set(item.variantId, { ...item });
        });

        localItems.forEach(item => {
          const vidStr = extractVariantId(item.variantId);
          const existing = mergedMap.get(vidStr);
          if (existing) {
            mergedMap.set(vidStr, {
              ...existing,
              quantity: Math.max(existing.quantity, item.quantity),
            });
          } else {
            mergedMap.set(vidStr, item);
          }
        });

        set({ items: Array.from(mergedMap.values()), isDirty: true });
      },

      fetchAndMerge: async () => {
        const token = await SecureStore.getItemAsync('userToken');
        if (!token) return;

        set({ loading: true });
        try {
          const { data } = await axios.get(`${BASE_URL}/cart`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (data && data.data && data.data.items) {
            const backendItems = data.data.items.map((item: any) => ({
              variantId: extractVariantId(item.variantId),
              quantity: item.quantity,
              product: {
                _id: item.variantId?.productId?._id || '',
                title: item.variantId?.title || 'Product',
                image: item.variantId?.coverImage?.url || '',
                price: item.variantId?.price || 0,
                mrp: item.variantId?.mrp,
                discount: item.variantId?.discount,
                categoryName: item.variantId?.productId?.categoryId?.name || '',
                stocks: item.variantId?.stocks,
              },
            }));
            get().mergeCart(backendItems);
          }
        } catch (error) {
          console.error('Fetch and merge failed:', error);
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'pahadi-cart-storage-v3',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ 
        items: state.items, 
        isDirty: state.isDirty,
        lastSyncedAt: state.lastSyncedAt 
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
