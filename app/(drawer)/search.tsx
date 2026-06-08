import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import axios from 'axios';
import { BASE_URL } from '@/constants/config';
import ProductCard from '@/components/ui/ProductCard';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function SearchScreen() {
  const { q } = useLocalSearchParams<{ q: string }>();
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (q) {
      performSearch();
    }
  }, [q]);

  const performSearch = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get(`${BASE_URL}/variants/search`, {
        params: { search: q, limit: 50 },
      });
      if (data && data.data && data.data.results) {
        setResults(data.data.results);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => `₹${price.toLocaleString()}`;

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Searching for "{q}"...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: `Search: ${q}`, headerShown: true }} />
      
      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => {
          const isOutOfStock = item.stocks <= 0 || !item.isActive;
          return (
            <ProductCard
              _id={item.productId?._id || ''}
              variantId={item._id}
              image={item.coverImage?.url || ''}
              title={item.title}
              price={formatPrice(item.price)}
              oldPrice={item.mrp > item.price ? formatPrice(item.mrp) : undefined}
              discount={item.discount > 0 ? `${item.discount}%` : undefined}
              categoryName={item.productId?.categoryId?.name || ''}
              rating={item.productId?.rating || 0}
              isOutOfStock={isOutOfStock}
              slug={item.slug}
            />
          );
        }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <IconSymbol name="magnifyingglass" size={60} color="#e5e7eb" />
            <Text style={styles.emptyText}>No products found for "{q}"</Text>
            <TouchableOpacity style={styles.shopBtn} onPress={() => router.push('/(drawer)/(tabs)')}>
              <Text style={styles.shopBtnText}>Browse Collections</Text>
            </TouchableOpacity>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  center: {
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
  listContent: {
    padding: 10,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 100,
    gap: 16,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  shopBtn: {
    backgroundColor: '#111827',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shopBtnText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
