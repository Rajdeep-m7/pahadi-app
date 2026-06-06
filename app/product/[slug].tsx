import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import axios from 'axios';
import { BASE_URL } from '@/constants/config';
import ProductPageContent from '@/components/product/ProductPageContent';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ProductScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [productData, setProductData] = useState<any>(null);
  const [similarProducts, setSimilarProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Fetch variant and product details
        const variantRes = await axios.get(`${BASE_URL}/variants/slug/${slug}`);
        if (variantRes.data && variantRes.data.data) {
          const data = variantRes.data.data;
          setProductData(data);

          // 2. Fetch similar products using the productId
          const productId = data.currentVariant.productId?._id;
          if (productId) {
            const similarRes = await axios.get(`${BASE_URL}/products/${productId}/similar`);
            if (similarRes.data && similarRes.data.data) {
              setSimilarProducts(similarRes.data.data);
            }
          }
        } else {
          setError('Product not found.');
        }
      } catch (err) {
        console.error('Error fetching product data:', err);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchData();
  }, [slug]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Loading details...</Text>
      </View>
    );
  }

  if (error || !productData) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error || 'Something went wrong.'}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
           <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <Stack.Screen 
        options={{ 
          title: 'Product Details', 
          headerShown: true,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginLeft: 10 }}>
              <IconSymbol name="chevron.left" size={24} color="#111827" />
            </TouchableOpacity>
          )
        }} 
      />
      <ProductPageContent productData={productData} similarProducts={similarProducts} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  backBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#111827',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  }
});
