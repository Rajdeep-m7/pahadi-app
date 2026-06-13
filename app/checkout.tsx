import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  AppState,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { router, Stack } from 'expo-router';
import axios from 'axios';
import * as SecureStore from '@/utils/storage';
import { BASE_URL, RAZORPAY_KEY_ID } from '@/constants/config';
import { useCartStore } from '@/store/cartStore';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuthStore } from '@/store/authStore';

interface Address {
  _id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  isDefault: boolean;
}

export default function CheckoutScreen() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'google_pay' | 'phonepe' | 'paytm'>('razorpay');

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && processing) {
        console.log('App resumed, resetting processing state.');
        setProcessing(false);
      }
    });

    return () => {
      subscription.remove();
    };
  }, [processing]);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    const token = await SecureStore.getItemAsync('userToken');
    try {
      const { data } = await axios.get(`${BASE_URL}/addresses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (data && data.data) {
        setAddresses(data.data);
        const defaultAddr = data.data.find((a: Address) => a.isDefault);
        if (defaultAddr) {
          setSelectedAddressId(defaultAddr._id);
        } else if (data.data.length > 0) {
          setSelectedAddressId(data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const subtotal = items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      Alert.alert('Error', 'Please select a shipping address.');
      return;
    }

    setProcessing(true);
    const token = await SecureStore.getItemAsync('userToken');
    const selectedAddress = addresses.find(a => a._id === selectedAddressId);

    try {
      // 1. Create Order on Backend
      const orderPayload = {
        shippingAddress: selectedAddress,
        items: items.map(item => ({
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        isCartCheckout: true,
      };

      const orderRes = await axios.post(`${BASE_URL}/orders`, orderPayload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const orderId = orderRes.data.data.orderId;

      // 2. Initiate Payment
      const paymentRes = await axios.post(`${BASE_URL}/payments/initiate`, { orderId }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { gatewayOrderId, amount, currency } = paymentRes.data.data;

      // 3. Open Native Razorpay Checkout
      const options: any = {
        description: `Order #${orderId.substring(0, 8)}`,
        image: 'https://pahadiapp.com/logo.png', // Replace with your logo
        currency: currency,
        key: RAZORPAY_KEY_ID,
        amount: amount * 100, // Amount in paise
        name: 'Pahadi Collections',
        order_id: gatewayOrderId,
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
          name: user?.name || ''
        },
        theme: { color: '#b98b5f' }
      };

      // Handle Direct UPI Intent
      if (paymentMethod !== 'razorpay') {
        options.method = 'upi';
        options.prefill.method = 'upi';
        
        if (paymentMethod === 'google_pay') {
          options.upi_app_package_name = Platform.OS === 'android' 
            ? 'com.google.android.apps.nbu.paisa.user' 
            : 'tez';
        } else if (paymentMethod === 'phonepe') {
          options.upi_app_package_name = Platform.OS === 'android' 
            ? 'com.phonepe.app' 
            : 'phonepe';
        } else if (paymentMethod === 'paytm') {
          options.upi_app_package_name = Platform.OS === 'android' 
            ? 'net.one97.paytm' 
            : 'paytmmp';
        }
        
        // Critical for bypassing UI in some SDK versions
        options['_[flow]'] = 'intent';
      }

      try {
        // Save pending order ID for recovery in case app is killed
        await SecureStore.setItemAsync('pending_verification_order_id', orderId);
        
        const data = await RazorpayCheckout.open(options);
        
        // 4. Verify Payment on Backend
        try {
          const verifyRes = await axios.post(`${BASE_URL}/payments/verify`, {
            razorpayOrderId: data.razorpay_order_id,
            razorpayPaymentId: data.razorpay_payment_id,
            razorpaySignature: data.razorpay_signature,
          }, {
            headers: { Authorization: `Bearer ${token}` },
          });

          console.log('Payment verification response:', verifyRes.data);
          
          // Clear recovery ID on success
          await SecureStore.deleteItemAsync('pending_verification_order_id');
          
          clearCart();
          
          // Small delay before navigation to ensure modal is fully dismissed
          setTimeout(() => {
            router.replace('/success');
          }, 800);
          
        } catch (verifyErr: any) {
          console.error('Payment verification failed:', verifyErr);
          Alert.alert('Payment Error', 'Your payment was successful but verification failed. Please contact support with your Payment ID.');
        }
      } catch (error: any) {
        // Clear recovery ID on cancel/fail
        await SecureStore.deleteItemAsync('pending_verification_order_id');
        
        // Handle failure (code 2 is user cancel)
        console.log(`Razorpay Error: ${error.code} | ${error.description}`);
        
        if (error.code === 2) {
          Alert.alert('Payment Cancelled', 'The payment process was cancelled.');
        } else {
          Alert.alert('Payment Failed', error.description || 'The transaction was cancelled or failed.');
        }
      }

    } catch (err: any) {
      console.error('Checkout error:', err);
      Alert.alert('Error', err.response?.data?.message || 'Failed to initiate checkout.');
    } finally {
      setProcessing(false);
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString()}`;

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#b98b5f" />
        <Text style={styles.loadingText}>Loading checkout details...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'Checkout', headerShown: true }} />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Address Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            <TouchableOpacity onPress={() => router.push('/profile/addresses')}>
              <Text style={styles.actionText}>Change</Text>
            </TouchableOpacity>
          </View>
          
          {addresses.length === 0 ? (
            <TouchableOpacity 
              style={styles.emptyAddress}
              onPress={() => router.push('/profile/addresses')}
            >
              <IconSymbol name="plus.circle" size={24} color="#b98b5f" />
              <Text style={styles.addAddressText}>Add Shipping Address</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.selectedAddressCard}>
              {addresses.map((addr) => (
                <TouchableOpacity 
                  key={addr._id}
                  style={[
                    styles.addressItem,
                    selectedAddressId === addr._id && styles.selectedAddressItem
                  ]}
                  onPress={() => setSelectedAddressId(addr._id)}
                >
                  <View style={styles.addressRadio}>
                    <View style={[
                      styles.radioOuter,
                      selectedAddressId === addr._id && styles.radioOuterActive
                    ]}>
                      {selectedAddressId === addr._id && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <View style={styles.addressDetails}>
                    <Text style={styles.addressName}>{addr.fullName}</Text>
                    <Text style={styles.addressText} numberOfLines={2}>
                      {addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}
                    </Text>
                    <Text style={styles.addressPhone}>{addr.phone}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          <View style={styles.orderSummary}>
            {items.map((item) => (
              <View key={item.variantId} style={styles.summaryItem}>
                <Image source={{ uri: item.product.image }} style={styles.itemThumb} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemTitle} numberOfLines={1}>{item.product.title}</Text>
                  <Text style={styles.itemPrice}>
                    {item.quantity} x {formatPrice(item.product.price)}
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {formatPrice(item.product.price * item.quantity)}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Payment Method Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethodsContainer}>
            <TouchableOpacity 
              style={[
                styles.methodCard,
                paymentMethod === 'razorpay' && styles.selectedMethodCard
              ]}
              onPress={() => setPaymentMethod('razorpay')}
            >
              <View style={styles.methodLeft}>
                <View style={[
                  styles.radioOuter,
                  paymentMethod === 'razorpay' && styles.radioOuterActive
                ]}>
                  {paymentMethod === 'razorpay' && <View style={styles.radioInner} />}
                </View>
                <View style={styles.methodIconPlaceholder}>
                  <IconSymbol name="creditcard.fill" size={16} color="#6b7280" />
                </View>
                <Text style={styles.methodText}>All Methods (Cards, UPI, NB)</Text>
              </View>
              <View style={styles.brandIcons}>
                <Image source={{ uri: 'https://img.icons8.com/color/48/visa.png' }} style={styles.miniBrandIcon} />
                <Image source={{ uri: 'https://img.icons8.com/color/48/mastercard.png' }} style={styles.miniBrandIcon} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.methodCard,
                paymentMethod === 'google_pay' && styles.selectedMethodCard
              ]}
              onPress={() => setPaymentMethod('google_pay')}
            >
              <View style={styles.methodLeft}>
                <View style={[
                  styles.radioOuter,
                  paymentMethod === 'google_pay' && styles.radioOuterActive
                ]}>
                  {paymentMethod === 'google_pay' && <View style={styles.radioInner} />}
                </View>
                <Image 
                  source={{ uri: 'https://img.icons8.com/color/48/google-pay.png' }} 
                  style={styles.methodBrandIcon} 
                />
                <Text style={styles.methodText}>Google Pay</Text>
              </View>
              <Text style={styles.fastTag}>FAST</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.methodCard,
                paymentMethod === 'phonepe' && styles.selectedMethodCard
              ]}
              onPress={() => setPaymentMethod('phonepe')}
            >
              <View style={styles.methodLeft}>
                <View style={[
                  styles.radioOuter,
                  paymentMethod === 'phonepe' && styles.radioOuterActive
                ]}>
                  {paymentMethod === 'phonepe' && <View style={styles.radioInner} />}
                </View>
                <Image 
                  source={{ uri: 'https://img.icons8.com/color/48/phone-pe.png' }} 
                  style={styles.methodBrandIcon} 
                />
                <Text style={styles.methodText}>PhonePe</Text>
              </View>
              <Text style={styles.fastTag}>FAST</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[
                styles.methodCard,
                paymentMethod === 'paytm' && styles.selectedMethodCard
              ]}
              onPress={() => setPaymentMethod('paytm')}
            >
              <View style={styles.methodLeft}>
                <View style={[
                  styles.radioOuter,
                  paymentMethod === 'paytm' && styles.radioOuterActive
                ]}>
                  {paymentMethod === 'paytm' && <View style={styles.radioInner} />}
                </View>
                <Image 
                  source={{ uri: 'https://img.icons8.com/color/48/paytm.png' }} 
                  style={styles.methodBrandIcon} 
                />
                <Text style={styles.methodText}>Paytm</Text>
              </View>
              <Text style={styles.fastTag}>FAST</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Payment Summary */}
        <View style={styles.section}>
          <View style={styles.paymentSummary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={[styles.summaryValue, { color: '#16a34a' }]}>FREE</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Grand Total</Text>
              <Text style={styles.totalValue}>{formatPrice(subtotal)}</Text>
            </View>
          </View>
        </View>
        
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.payButton, processing && styles.disabledButton]} 
          onPress={handlePlaceOrder}
          disabled={processing}
        >
          {processing ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={styles.payButtonText}>Pay {formatPrice(subtotal)}</Text>
              <IconSymbol name="lock.fill" size={14} color="#fff" />
            </>
          )}
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
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  actionText: {
    fontSize: 14,
    color: '#b98b5f',
    fontWeight: '600',
  },
  emptyAddress: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e5e7eb',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addAddressText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#b98b5f',
  },
  selectedAddressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  addressItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedAddressItem: {
    backgroundColor: '#fffbeb',
  },
  addressRadio: {
    marginRight: 12,
    paddingTop: 2,
  },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: '#b98b5f',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#b98b5f',
  },
  addressDetails: {
    flex: 1,
  },
  addressName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  addressText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  addressPhone: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginTop: 4,
  },
  orderSummary: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f9fafb',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  itemPrice: {
    fontSize: 12,
    color: '#6b7280',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  paymentSummary: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
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
  divider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 12,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: '#b98b5f',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  payButton: {
    backgroundColor: '#b98b5f',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  payButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  paymentMethodsContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
    marginTop: 8,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectedMethodCard: {
    backgroundColor: '#fffbeb',
    borderColor: '#b98b5f',
  },
  methodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodText: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
  },
  methodBrandIcon: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
  },
  methodIconPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandIcons: {
    flexDirection: 'row',
    gap: 6,
  },
  miniBrandIcon: {
    width: 24,
    height: 16,
    resizeMode: 'contain',
  },
  fastTag: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#b98b5f',
    backgroundColor: '#fef3c7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: 'hidden',
  },
});
