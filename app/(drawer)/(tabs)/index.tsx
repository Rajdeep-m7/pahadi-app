import { StyleSheet, SafeAreaView, ScrollView, View, ActivityIndicator, Image, Modal, TouchableOpacity } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import HeroSlider from "../../../components/home/HeroSlider"
import { ThemedText } from "@/components/themed-text";
import CategorySlider from "@/components/home/CategorySlider";
import ProductCard from "@/components/ui/ProductCard";
import { BASE_URL } from "@/constants/config";
import { useCartStore } from "@/store/cartStore";
import { IconSymbol } from "@/components/ui/icon-symbol";
import image3 from "../../../assets/images/image3.jpeg";
import image1 from "../../../assets/images/3.jpg";
import image2 from "../../../assets/images/4.jpg";

import mbl1 from "../../../assets/images/6.jpg";
import mbl2 from "../../../assets/images/7.jpg";
import mbl3 from "../../../assets/images/8.jpg";

import VideoSlider from "@/components/home/VideoSlider";
import Footer from "@/components/Footer";

interface Product {
  _id: string;
  title: string;
  coverImage?: {
    url: string;
  };
  displayPrice: number;
  displayMrp?: number;
  displayDiscount?: number;
  default_slug?: string;
  categoryId?: {
    name: string;
  };
  rating?: number;
  isPublished: boolean;
  isActive: boolean;
  stocks?: number; // Resolved from variant
  variantId?: string; // Added to store the actual variant ID
  effectiveTax?: any;
}

interface ActiveSection {
  id: string;
  name: string;
  slug: string;
  products: Product[];
}

interface PopupData {
  _id: string;
  title: string;
  image: {
    url: string;
    publicId: string;
  };
  link?: string;
  isActive: boolean;
}

export default function HomeScreen() {
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [activeSections, setActiveSections] = useState<ActiveSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupData, setPopupData] = useState<PopupData | null>(null);
  const addToCart = useCartStore((state) => state.addToCart);

  // Utility to fetch stocks and variant details for a list of products
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
      // Fallback for older backend versions or if not populated
      else if (prod.stocks !== undefined) {
        stockValue = prod.stocks;
        variantId = prod.variantId || "";
        effectiveTax = prod.effectiveTax || null;
      }

      return { ...prod, stocks: stockValue, variantId, effectiveTax };
    });
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/home`);
        
        if (data && data.data) {
          // Process latest products
          const latest = data.data.latestProducts || [];
          const latestWithStock = await resolveStocks(latest);
          setLatestProducts(latestWithStock);

          // Process category sections
          const sections = data.data.activeSections || [];
          const sectionsWithStock = await Promise.all(
            sections.map(async (sec: ActiveSection) => ({
              ...sec,
              products: await resolveStocks(sec.products)
            }))
          );
          setActiveSections(sectionsWithStock);
        }
      } catch (error) {
        console.error("Error fetching home data:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchPopupData = async () => {
      try {
        // Check if popup was already shown to this user
        const wasShown = await AsyncStorage.getItem('popup_shown');
        if (wasShown) return;

        const { data } = await axios.get(`${BASE_URL}/storefront`);
        if (data && data.data && data.data.popup && data.data.popup.isActive) {
          setPopupData(data.data.popup);
          // Show popup after a short delay for better UX
          setTimeout(async () => {
            setIsPopupVisible(true);
            // Mark as shown so it doesn't appear again
            await AsyncStorage.setItem('popup_shown', 'true');
          }, 1500);
        }
      } catch (error) {
        console.error("Error fetching popup data:", error);
      }
    };

    fetchHomeData();
    fetchPopupData();
  }, []);

  const formatPrice = (price: number) => {
    return `₹${price.toLocaleString()}`;
  };

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
      effectiveTax: product.effectiveTax,
    });
  };

  const renderProductGrid = (products: Product[]) => (
    <View style={styles.productsGrid}>
      {products.slice(0, 6).map((product) => {
        const isOutOfStock = (product.stocks !== undefined && product.stocks <= 0) || !product.isActive;
        
        // Calculate discount if missing but mrp > price
        let discountStr = product.displayDiscount ? `${product.displayDiscount}%` : undefined;
        if (!discountStr && product.displayMrp && product.displayMrp > product.displayPrice) {
          const calculated = Math.round(((product.displayMrp - product.displayPrice) / product.displayMrp) * 100);
          if (calculated > 0) discountStr = `${calculated}%`;
        }

        return (
          <ProductCard
            key={product._id}
            _id={product._id}
            variantId={product.variantId}
            title={product.title}
            image={product.coverImage?.url || ""}
            price={formatPrice(product.displayPrice)}
            oldPrice={product.displayMrp ? formatPrice(product.displayMrp) : undefined}
            discount={discountStr}
            categoryName={product.categoryId?.name}
            rating={product.rating}
            isOutOfStock={isOutOfStock}
            slug={product.default_slug || product._id}
            onAddToCart={() => handleAddToCart(product)}
          />
        );
      })}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <HeroSlider />
        <CategorySlider />

        {loading ? (
          <ActivityIndicator size="large" color="#fe9a00" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* New Arrivals Section */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>New Arrivals</ThemedText>
              {renderProductGrid(latestProducts)}
            </View>

            {/* Banner Separator */}
            <View style={styles.bannerContainer}>
              <Image source={image3} style={styles.banner} />
              <Image source={image1} style={styles.banner} />
              <Image source={image2} style={styles.banner} />
            </View>

            {/* Dynamic Category Sections */}
            {activeSections.map((section) => (
              <View key={section.id || section.slug} style={styles.section}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>{section.name}</ThemedText>
                {renderProductGrid(section.products)}
              </View>
            ))}

            <View>
              <VideoSlider />
            </View>

            {/* Bottom Mobile Static Banner */}
            <View style={styles.bannerContainer}>
              <Image source={mbl1} style={styles.banner} />
              <Image source={mbl2} style={styles.banner} />
              <Image source={mbl3} style={styles.banner} />
            </View>

            <Footer />
            <View style={{ height: 80 }} />
          </>
        )}
      </ScrollView>

      {/* Welcome Popup Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isPopupVisible}
        onRequestClose={() => setIsPopupVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={() => setIsPopupVisible(false)}
            >
              <IconSymbol name="xmark.circle.fill" size={28} color="#9ca3af" />
            </TouchableOpacity>
            
            <Image 
              source={{ uri: popupData?.image?.url || 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop' }} 
              style={styles.popupImage} 
            />
            
            <View style={styles.popupTextContainer}>
              <ThemedText style={styles.popupTitle}>{popupData?.title || 'Welcome to Pahadi Collections!'}</ThemedText>
              <ThemedText style={styles.popupSubtitle}>Discover the essence of the mountains with our exclusive handcrafted products.</ThemedText>
              
              <TouchableOpacity 
                style={styles.shopNowButton}
                onPress={() => setIsPopupVisible(false)}
              >
                <ThemedText style={styles.shopNowText}>SHOP NOW</ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  section: {
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  sectionTitle: {
    marginBottom: 15,
    fontWeight: 'bold',
    color: '#333',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bannerContainer: {
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  banner: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    borderRadius: 12,
    marginBottom: 15,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#888',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: '#fff',
    borderRadius: 24,
    overflow: 'hidden',
    position: 'relative',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 15,
  },
  popupImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  popupTextContainer: {
    padding: 24,
    alignItems: 'center',
  },
  popupTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  popupSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  shopNowButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    width: '100%',
  },
  shopNowText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    letterSpacing: 1,
  },
})