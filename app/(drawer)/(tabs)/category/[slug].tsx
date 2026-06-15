import React, { useEffect, useState, useMemo } from 'react';
import { View, StyleSheet, ActivityIndicator, FlatList, Text, TouchableOpacity, Modal, ScrollView, SafeAreaView, TextInput } from 'react-native';
import { useLocalSearchParams, Stack, router } from 'expo-router';
import axios from 'axios';
import { BASE_URL } from '@/constants/config';
import ProductCard from '@/components/ui/ProductCard';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useCartStore } from '@/store/cartStore';

interface Product {
  _id: string;
  title: string;
  coverImage?: { url: string };
  displayPrice: number;
  displayMrp?: number;
  displayDiscount?: number;
  default_slug?: string;
  categoryId?: { name: string, _id: string };
  rating?: number;
  isPublished: boolean;
  isActive: boolean;
  stocks?: number;
  variantId?: string;
  effectiveTax?: any;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

type SortOption = 'latest' | 'lowToHigh' | 'highToLow';

export default function CategoryPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState('');

  // Filters & Sorting State
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  
  // Modals
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const addToCart = useCartStore((state) => state.addToCart);

  // Resolve stocks utility (matches Home screen logic)
  // Optimized to use pre-populated backend data if available
  const resolveStocks = async (products: Product[]) => {
    return products.map((prod: any) => {
      let stockValue = 0;
      let variantId = "";
      let effectiveTax = null;

      // If backend pre-populated the variant data (New Optimization)
      if (prod.defaultVariantId && typeof prod.defaultVariantId === 'object') {
        stockValue = prod.defaultVariantId.stocks || 0;
        variantId = prod.defaultVariantId._id || "";
        effectiveTax = prod.effectiveTax || prod.defaultVariantId.effectiveTax || null;
      } 
      // Fallback
      else if (prod.stocks !== undefined) {
        stockValue = prod.stocks;
        variantId = prod.variantId || "";
        effectiveTax = prod.effectiveTax || null;
      }

      return { ...prod, stocks: stockValue, variantId, effectiveTax };
    });
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // 1. Fetch Categories for the Filter Modal
        const catRes = await axios.get(`${BASE_URL}/categories`);
        if (catRes.data?.data) {
          setAllCategories(catRes.data.data.filter((c: Category) => c.slug));
        }

        // 2. Fetch Products for this specific category
        const currentSlug = slug || 'all-jewellery';
        const isAll = currentSlug === 'all-jewellery';
        
        const endpoint = isAll 
          ? `${BASE_URL}/products`
          : `${BASE_URL}/products/category/${currentSlug}`;

        const { data } = await axios.get(endpoint, {
          params: { limit: 500, isPublished: true, isActive: true } // Increased to 500 for local filtering and sorting
        });
        
        if (data && data.data) {
          const rawProducts = data.data.products || [];
          
          if (isAll) {
             setCategoryName('All Jewellery');
          } else if (rawProducts.length > 0) {
             setCategoryName(rawProducts[0].categoryId?.name || 'Category');
          } else {
             // Fallback to name from category list
             const matchedCat = catRes.data?.data?.find((c: Category) => c.slug === currentSlug);
             if (matchedCat) setCategoryName(matchedCat.name);
          }
          
          const productsWithStock = await resolveStocks(rawProducts);
          setProducts(productsWithStock);
        }
      } catch (error: any) {
        console.error("Error fetching category data:", error.message);
        if (error.response) {
          console.error("Axios Response Data:", error.response.data);
          console.error("Axios Response Status:", error.response.status);
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchInitialData();
    }
  }, [slug]);

  // Apply Sort and Filters
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filter by Price
    const min = parseFloat(minPrice);
    const max = parseFloat(maxPrice);

    if (!isNaN(min)) {
      result = result.filter(p => p.displayPrice >= min);
    }
    if (!isNaN(max)) {
      result = result.filter(p => p.displayPrice <= max);
    }

    result.sort((a, b) => {
      if (sortBy === 'lowToHigh') return a.displayPrice - b.displayPrice;
      if (sortBy === 'highToLow') return b.displayPrice - a.displayPrice;
      return 0; 
    });

    return result;
  }, [products, sortBy, minPrice, maxPrice]);

  const formatPrice = (price: number) => `₹${price.toLocaleString()}`;

  const handleAddToCart = (product: Product) => {
    if (!product.variantId) {
      console.warn("Cannot add to cart: variantId missing for product", product.title);
      return;
    }

    addToCart(product.variantId, {
      _id: product._id,
      title: product.title,
      image: product.coverImage?.url || "",
      price: product.displayPrice,
      mrp: product.displayMrp,
      discount: product.displayDiscount,
      categoryName: product.categoryId?.name,
      stocks: product.stocks,
      effectiveTax: (product as any).effectiveTax,
    });
  };

  const sortOptions = [
    { label: 'Latest', value: 'latest' },
    { label: 'Price: Low to High', value: 'lowToHigh' },
    { label: 'Price: High to Low', value: 'highToLow' },
  ];

  const priceFilters = [
    { label: 'Any Price', value: null },
    { label: 'Under ₹5,000', value: 5000 },
    { label: 'Under ₹15,000', value: 15000 },
    { label: 'Under ₹50,000', value: 50000 },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: '', 
          headerShadowVisible: false,
          headerStyle: { backgroundColor: '#fff' },
          headerShown: false
        }} 
      />

      <View style={styles.pageHeader}>
        <Text style={styles.pageTitle}>{categoryName}</Text>
        <Text style={styles.pageSubtitle}>Explore our premium jewellery collection</Text>
      </View>

      {/* Action Bar */}
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.actionBtnBordered} onPress={() => setFilterModalVisible(true)}>
          <IconSymbol name="slider.horizontal.3" size={18} color="#374151" />
          <Text style={styles.actionTextNormal}>Filters</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionBtnBordered} onPress={() => setSortModalVisible(true)}>
          <Text style={styles.actionTextMuted}>Sort by:</Text>
          <Text style={styles.actionTextNormal}>
            {sortOptions.find(o => o.value === sortBy)?.label.split(':')[0]}
          </Text>
          <IconSymbol name="chevron.down" size={16} color="#374151" />
        </TouchableOpacity>
      </View>
      
      {!loading && (
        <View style={styles.masterpiecesContainer}>
          <Text style={styles.masterpiecesText}>
            SHOWING <Text style={styles.masterpiecesCount}>{filteredAndSortedProducts.length}</Text> MASTERPIECES
          </Text>
        </View>
      )}
      
      {loading ? (
        <ActivityIndicator size="large" color="#fe9a00" style={styles.loader} />
      ) : (
        <FlatList
          data={filteredAndSortedProducts}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.columnWrapper}
          renderItem={({ item }) => {
            const isOutOfStock = (item.stocks !== undefined && item.stocks <= 0) || !item.isActive;

            // Calculate discount if missing but mrp > price
            let discountStr = item.displayDiscount ? `${item.displayDiscount}%` : undefined;
            if (!discountStr && item.displayMrp && item.displayMrp > item.displayPrice) {
              const calculated = Math.round(((item.displayMrp - item.displayPrice) / item.displayMrp) * 100);
              if (calculated > 0) discountStr = `${calculated}%`;
            }

            return (
              <ProductCard
                _id={item._id}
                variantId={item.variantId}
                image={item.coverImage?.url || ""}
                title={item.title}
                price={formatPrice(item.displayPrice)}
                oldPrice={item.displayMrp ? formatPrice(item.displayMrp) : undefined}
                discount={discountStr}
                categoryName={item.categoryId?.name}
                rating={item.rating}
                isOutOfStock={isOutOfStock}
                slug={item.default_slug || item._id}
                onAddToCart={() => handleAddToCart(item)}
              />
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No products found matching your criteria.</Text>
          }
        />
      )}

      <Modal visible={sortModalVisible} transparent animationType="fade" onRequestClose={() => setSortModalVisible(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setSortModalVisible(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Sort By</Text>
            {sortOptions.map(option => (
              <TouchableOpacity 
                key={option.value} 
                style={[styles.modalOption, sortBy === option.value && styles.modalOptionActive]}
                onPress={() => {
                  setSortBy(option.value as SortOption);
                  setSortModalVisible(false);
                }}
              >
                <Text style={[styles.modalOptionText, sortBy === option.value && styles.modalOptionTextActive]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={filterModalVisible} animationType="slide" onRequestClose={() => setFilterModalVisible(false)}>
        <SafeAreaView style={styles.filterModalContainer}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filters</Text>
            <TouchableOpacity onPress={() => setFilterModalVisible(false)}>
              <IconSymbol name="xmark" size={24} color="#111827" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.filterBody}>
            <Text style={styles.filterSectionTitle}>Price Range</Text>
            <View style={styles.rangeInputContainer}>
              <View style={styles.rangeInputWrapper}>
                <Text style={styles.rangeInputLabel}>Min</Text>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="₹0"
                  value={minPrice}
                  onChangeText={setMinPrice}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.rangeDivider} />
              <View style={styles.rangeInputWrapper}>
                <Text style={styles.rangeInputLabel}>Max</Text>
                <TextInput
                  style={styles.rangeInput}
                  placeholder="₹100,000"
                  value={maxPrice}
                  onChangeText={setMaxPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={[styles.pillContainer, { marginTop: 15 }]}>
              {priceFilters.map(filter => {
                const isActive = (filter.value === null && minPrice === '' && maxPrice === '') || 
                                (filter.value !== null && maxPrice === filter.value.toString() && minPrice === '');
                return (
                  <TouchableOpacity
                    key={filter.label}
                    style={[styles.pill, isActive && styles.pillActive]}
                    onPress={() => {
                      if (filter.value === null) {
                        setMinPrice('');
                        setMaxPrice('');
                      } else {
                        setMinPrice('');
                        setMaxPrice(filter.value.toString());
                      }
                    }}
                  >
                    <Text style={[styles.pillText, isActive && styles.pillTextActive]}>
                      {filter.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={styles.filterDivider} />

            <Text style={styles.filterSectionTitle}>Collections</Text>
            
            <TouchableOpacity 
              style={styles.categoryFilterRow}
              onPress={() => {
                setFilterModalVisible(false);
                if (slug !== 'all-jewellery') {
                  router.replace(`/category/all-jewellery`);
                }
              }}
            >
              <Text style={[styles.categoryFilterText, (slug === 'all-jewellery' || !slug) && styles.categoryFilterTextActive]}>
                All Jewellery
              </Text>
              {(slug === 'all-jewellery' || !slug) && <IconSymbol name="checkmark" size={16} color="#b98b5f" />}
            </TouchableOpacity>

            {/* Dynamic Categories */}
            {allCategories.map(cat => (
              <TouchableOpacity 
                key={cat._id}
                style={styles.categoryFilterRow}
                onPress={() => {
                  setFilterModalVisible(false);
                  if (cat.slug !== slug) {
                    router.replace(`/category/${cat.slug}`);
                  }
                }}
              >
                <Text style={[styles.categoryFilterText, slug === cat.slug && styles.categoryFilterTextActive]}>
                  {cat.name}
                </Text>
                {slug === cat.slug && <IconSymbol name="checkmark" size={16} color="#b98b5f" />}
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={styles.filterFooter}>
            <TouchableOpacity 
              style={styles.clearBtn} 
              onPress={() => {
                setMinPrice('');
                setMaxPrice('');
                setFilterModalVisible(false);
                router.replace(`/category/all-jewellery`);
              }}
            >
              <Text style={styles.clearBtnText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyBtn} onPress={() => setFilterModalVisible(false)}>
              <Text style={styles.applyBtnText}>Apply</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pageHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    letterSpacing: -0.5,
  },
  pageSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
    marginTop: 4,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingBottom: 15,
    gap: 10,
  },
  actionBtnBordered: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 6,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
  },
  actionTextNormal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionTextMuted: {
    fontSize: 13,
    fontWeight: '500',
    color: '#9ca3af',
  },
  masterpiecesContainer: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  masterpiecesText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  masterpiecesCount: {
    fontWeight: '900',
    color: '#111827',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 10,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#888',
    fontSize: 16,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 48,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 20,
    color: '#111827',
  },
  modalOption: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalOptionActive: {
    backgroundColor: '#fffbeb',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 0,
  },
  modalOptionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
  },
  modalOptionTextActive: {
    color: '#b98b5f',
  },

  // Filter Modal
  filterModalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  filterTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  filterBody: {
    flex: 1,
    padding: 20,
  },
  filterSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  pillContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 10,
  },
  pill: {
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 18,
  },
  pillActive: {
    backgroundColor: '#b98b5f',
    borderColor: '#b98b5f',
  },
  pillText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4b5563',
  },
  pillTextActive: {
    color: '#fff',
  },
  rangeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 5,
  },
  rangeInputWrapper: {
    flex: 1,
  },
  rangeInputLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginLeft: 4,
  },
  rangeInput: {
    backgroundColor: '#f9fafb',
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  rangeDivider: {
    width: 12,
    height: 2,
    backgroundColor: '#e5e7eb',
    marginTop: 20,
  },
  filterDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 24,
  },
  categoryFilterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f9fafb',
  },
  categoryFilterText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#4b5563',
  },
  categoryFilterTextActive: {
    color: '#b98b5f',
    fontWeight: '800',
  },
  filterFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 15,
  },
  clearBtn: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    alignItems: 'center',
  },
  clearBtnText: {
    fontWeight: '800',
    color: '#4b5563',
    fontSize: 14,
  },
  applyBtn: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#b98b5f',
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#b98b5f',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  applyBtnText: {
    fontWeight: '800',
    color: '#fff',
    fontSize: 14,
  }
});
