import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import Animated, { FadeInDown, FadeInUp, withSpring, useAnimatedStyle, useSharedValue, withDelay } from 'react-native-reanimated';

export default function SuccessPage() {
  const { orderId } = useLocalSearchParams();
  const scale = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(100, withSpring(1, { damping: 12, stiffness: 100 }));
  }, []);

  const animatedIconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handleViewOrder = () => {
    if (orderId) {
      router.replace({
        pathname: '/profile/orders/[id]',
        params: { id: orderId }
      } as any);
    } else {
      router.replace('/profile/orders');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, animatedIconStyle]}>
          <IconSymbol name="checkmark.circle.fill" size={100} color="#10b981" />
        </Animated.View>
        
        <Animated.Text entering={FadeInUp.delay(300)} style={styles.title}>
          Order Placed!
        </Animated.Text>
        
        <Animated.Text entering={FadeInUp.delay(400)} style={styles.subtitle}>
          Your payment was successful and your order has been placed. You will receive an update shortly.
        </Animated.Text>

        {orderId && (
          <Animated.View entering={FadeInUp.delay(450)} style={styles.orderCard}>
            <Text style={styles.orderLabel}>ORDER NUMBER</Text>
            <Text style={styles.orderValue}>#{orderId}</Text>
            <View style={styles.statusBadge}>
              <IconSymbol name="shippingbox.fill" size={14} color="#059669" />
              <Text style={styles.statusText}>Confirmed & Processing</Text>
            </View>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.delay(500)} style={styles.buttonContainer}>
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleViewOrder}
          >
            <Text style={styles.primaryButtonText}>
              {orderId ? 'View Order Details' : 'View My Orders'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton} 
            onPress={() => router.replace('/')}
          >
            <Text style={styles.secondaryButtonText}>Continue Shopping</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  orderCard: {
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    alignItems: 'center',
    marginBottom: 40,
  },
  orderLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9ca3af',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  orderValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    width: '100%',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#059669',
    textTransform: 'uppercase',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#111827',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '600',
  },
});
