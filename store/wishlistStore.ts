import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCartStore } from './cartStore';

// Handles variantId that may be a string, an object { _id: string }, or { $oid: string }
function extractVariantId(vid: any): string {
  if (!vid) return '';
  if (typeof vid === 'string') return vid;
  if (typeof vid === 'object') {
    return String(vid._id || vid.$oid || vid.id || '');
  }
  return String(vid);
}

export interface WishlistItem {
  _id: string;
  variantId: string;
  title: string;
  image: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  categoryName?: string;
  rating?: number;
  isOutOfStock?: boolean;
  slug?: string;
}

interface WishlistState {
  items: WishlistItem[];
  isDirty: boolean;
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
  addItem: (item: WishlistItem) => void;
  removeItem: (variantId: string) => void;
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (variantId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      isDirty: false,
      _hasHydrated: false,

      setHasHydrated: (state) => set({ _hasHydrated: state }),
      
      addItem: (item) => {
        const vidStr = extractVariantId(item.variantId);
        const { items } = get();
        if (!vidStr) return;
        
        if (!items.find((i) => extractVariantId(i.variantId) === vidStr)) {
          set({ items: [...items, { ...item, variantId: vidStr }], isDirty: true });
          useCartStore.getState().showToast(`Added ${item.title} to wishlist`);
        }
      },

      removeItem: (variantId) => {
        const vidStr = extractVariantId(variantId);
        const { items } = get();
        const itemToRemove = items.find((i) => extractVariantId(i.variantId) === vidStr);
        
        if (itemToRemove) {
          set({ 
            items: items.filter((i) => extractVariantId(i.variantId) !== vidStr),
            isDirty: true 
          });
          useCartStore.getState().showToast(`Removed from wishlist`);
        }
      },

      toggleItem: (item) => {
        const vidStr = extractVariantId(item.variantId);
        const { items } = get();
        const existing = items.find((i) => extractVariantId(i.variantId) === vidStr);
        if (existing) {
          get().removeItem(vidStr);
        } else {
          get().addItem(item);
        }
      },

      isInWishlist: (variantId) => {
        const vidStr = extractVariantId(variantId);
        if (!vidStr) return false;
        return get().items.some((i) => extractVariantId(i.variantId) === vidStr);
      },

      clearWishlist: () => set({ items: [], isDirty: false }),
    }),
    {
      name: 'pahadi-wishlist-storage-v3',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ items: state.items, isDirty: state.isDirty }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
