import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router, Stack } from 'expo-router';
import { useWishlistStore } from '@/store/wishlistStore';
import ProductCard from '@/components/ui/ProductCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';

export default function WishlistScreen() {
  const { items, _hasHydrated, setHasHydrated } = useWishlistStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Check if hydrated on mount
    if (useWishlistStore.persist.hasHydrated()) {
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

  if (!isReady && !_hasHydrated) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f59e0b" />
        <Text style={styles.loadingText}>Loading wishlist...</Text>
      </SafeAreaView>
    );
  }

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.emptyContainer}>
        <Stack.Screen options={{ title: 'Wishlist', headerShown: true }} />
        <IconSymbol name="heart" size={100} color="#e5e7eb" />
        <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
        <Text style={styles.emptySubtitle}>
          Save items you love to your wishlist and they will appear here.
        </Text>
        <TouchableOpacity
          style={styles.shopButton}
          onPress={() => router.push('/(drawer)/(tabs)')}
        >
          <Text style={styles.shopButtonText}>Explore Products</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ title: 'My Wishlist', headerShown: true }} />
      
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontFamily: Fonts.rounded }]}>
          Saved Items ({items.length})
        </Text>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.variantId}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item }) => (
          <ProductCard
            _id={item._id}
            variantId={item.variantId}
            image={item.image}
            title={item.title}
            price={item.price}
            oldPrice={item.oldPrice}
            discount={item.discount}
            categoryName={item.categoryName}
            rating={item.rating}
            isOutOfStock={item.isOutOfStock}
            slug={item.slug}
          />
        )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '600',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  listContent: {
    padding: 10,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
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
