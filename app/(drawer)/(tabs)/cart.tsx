import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { useCartStore } from '@/store/cartStore';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import * as SecureStore from 'expo-secure-store';

export default function CartScreen() {
  const { items, updateQuantity, removeFromCart, clearCart, _hasHydrated, setHasHydrated, appliedCoupon, removeCoupon } = useCartStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Synchronous check for hydration in Zustand
    if (useCartStore.persist.hasHydrated()) {
      setHasHydrated(true);
      setIsReady(true);
    } else {
      // Small delay fallback
      const timer = setTimeout(() => {
        setIsReady(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, []);

  // Sync isReady with store's hydrated state
  useEffect(() => {
    if (_hasHydrated) {
      setIsReady(true);
    }
  }, [_hasHydrated]);

  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const totalTax = items.reduce((acc, item) => {
    if (!item.product.effectiveTax || item.product.effectiveTax.length === 0) return acc;
    const itemPrice = item.product.price || 0;
    const itemTax = item.product.effectiveTax.reduce((tAcc, slab) => {
      return tAcc + (itemPrice * (slab.slab / 100));
    }, 0);
    return acc + (itemTax * item.quantity);
  }, 0);

  const discountAmount = appliedCoupon?.calculatedDiscount || 0;
  const totalAmount = Math.round(subtotal + totalTax - discountAmount);

  const handleCheckout = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    if (!token) {
      Alert.alert(
        'Login Required',
        'Please login to proceed with your order.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Login', 
            onPress: () => router.push({
              pathname: '/(auth)/login',
              params: { redirectTo: '/checkout' }
            }) 
          },
        ]
      );
      return;
    }
    router.push('/checkout');
  };

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

  // Wait for hydration or fallback timer
  if (!isReady && !_hasHydrated) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading cart...</Text>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <IconSymbol name="cart" size={100} color="#e5e7eb" />
        <Text style={styles.emptyTitle}>Your cart is empty</Text>
        <Text style={styles.emptySubtitle}>
          Looks like you haven&apos;t added anything to your cart yet.
        </Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/(drawer)/(tabs)')}
        >
          <Text style={styles.shopButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontFamily: Fonts.rounded }]}>
          My Cart ({items.length})
        </Text>
        <TouchableOpacity onPress={() => clearCart()}>
          <Text style={styles.clearText}>Clear All</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.cartList} showsVerticalScrollIndicator={false}>
        {items.map((item) => (
          <View key={item.variantId} style={styles.cartItem}>
            <TouchableOpacity 
              style={styles.itemTouchable}
              onPress={() => item.product.slug && router.push(`/product/${item.product.slug}`)}
              activeOpacity={0.7}
            >
              <Image
                source={{ uri: item.product.image }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {item.product.title}
                  </Text>
                  <TouchableOpacity onPress={() => removeFromCart(item.variantId)}>
                    <IconSymbol name="trash.fill" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemCategory}>{item.product.categoryName}</Text>

                {/* Tax Display */}
                <View style={styles.taxBadgeContainer}>
                  {item.product.effectiveTax && item.product.effectiveTax.length > 0 ? (
                    item.product.effectiveTax.map((slab, idx) => (
                      <View key={idx} style={styles.taxBadge}>
                        <Text style={styles.taxText}>
                          {slab.name} {slab.slab}%
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View style={[styles.taxBadge, styles.zeroTaxBadge]}>
                      <Text style={[styles.taxText, styles.zeroTaxText]}>TAX 0%</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.priceRow}>
                  <Text style={styles.itemPrice}>
                    {formatPrice(item.product.price)}
                  </Text>
                  
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.qtyButton}
                      onPress={() => updateQuantity(item.variantId, item.quantity - 1)}
                    >
                      <IconSymbol name="minus" size={14} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={[
                        styles.qtyButton,
                        item.quantity >= (item.product.stocks || 999) && styles.qtyButtonDisabled
                      ]}
                      onPress={() => updateQuantity(item.variantId, item.quantity + 1)}
                      disabled={item.quantity >= (item.product.stocks || 999)}
                    >
                      <IconSymbol 
                        name="plus" 
                        size={14} 
                        color={item.quantity >= (item.product.stocks || 999) ? '#9ca3af' : '#000'} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Subtotal</Text>
          <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Estimated Tax</Text>
          <Text style={styles.summaryValue}>{formatPrice(Math.round(totalTax))}</Text>
        </View>
        {discountAmount > 0 && (
          <View style={styles.summaryRow}>
            <View style={styles.discountLabelRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.couponCodeText}>({appliedCoupon?.code})</Text>
              <TouchableOpacity onPress={() => removeCoupon()}>
                <IconSymbol name="xmark.circle.fill" size={14} color="#ef4444" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.summaryValue, { color: '#16a34a' }]}>-{formatPrice(Math.round(discountAmount))}</Text>
          </View>
        )}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Shipping</Text>
          <Text style={[styles.summaryValue, { color: '#16a34a' }]}>FREE</Text>
        </View>
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(totalAmount)}</Text>
        </View>

        <TouchableOpacity style={styles.checkoutButton} onPress={handleCheckout}>
          <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
          <IconSymbol name="chevron.right" size={16} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6b7280',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  clearText: {
    fontSize: 14,
    color: '#ef4444',
    fontWeight: '600',
  },
  cartList: {
    flex: 1,
    padding: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  itemTouchable: {
    flexDirection: 'row',
    flex: 1,
  },
  itemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#5f4339',
    flex: 1,
    marginRight: 8,
  },
  itemCategory: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  taxBadgeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginTop: 4,
  },
  taxBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  taxText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#b98b5f',
    textTransform: 'uppercase',
  },
  zeroTaxBadge: {
    backgroundColor: '#f9fafb',
    borderColor: '#f3f4f6',
  },
  zeroTaxText: {
    color: '#9ca3af',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#5f4339',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 10,
    paddingHorizontal: 4,
  },
  qtyButton: {
    padding: 8,
    backgroundColor: '#e5e7eb', // Light background
    borderRadius: 8,
    marginVertical: 4,
  },
  qtyButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000', // Strictly black as requested
    paddingHorizontal: 12,
  },
  footer: {
    backgroundColor: '#fff',
    padding: 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  discountLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  couponCodeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#16a34a',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    overflow: 'hidden',
  },
  totalRow: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    marginBottom: 24,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#5f4339',
  },
  checkoutButton: {
    backgroundColor: '#b98b5f',
    flexDirection: 'row',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginTop: 24,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 32,
  },
  shopButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
