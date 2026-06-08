import { StyleSheet, SafeAreaView, ScrollView, View, ActivityIndicator, Image } from "react-native";
import { useEffect, useState } from "react";
import axios from "axios";
import HeroSlider from "../../../components/home/HeroSlider"
import { ThemedText } from "@/components/themed-text";
import CategorySlider from "@/components/home/CategorySlider";
import ProductCard from "@/components/ui/ProductCard";
import { BASE_URL } from "@/constants/config";
import { useCartStore } from "@/store/cartStore";

// Static images
import image3 from "../../../assets/images/image3.jpeg";
import image1 from "../../../assets/images/3.jpg";
import image2 from "../../../assets/images/4.jpg";
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
}

interface ActiveSection {
  id: string;
  name: string;
  slug: string;
  products: Product[];
}

export default function HomeScreen() {
  const [latestProducts, setLatestProducts] = useState<Product[]>([]);
  const [activeSections, setActiveSections] = useState<ActiveSection[]>([]);
  const [loading, setLoading] = useState(true);
  const addToCart = useCartStore((state) => state.addToCart);

  // Utility to fetch stocks and variant details for a list of products
  const resolveStocks = async (products: Product[]) => {
    return await Promise.all(
      products.map(async (prod) => {
        let stockValue = 0;
        let variantId = "";
        if (prod.default_slug) {
          try {
            const res = await axios.get(`${BASE_URL}/variants/slug/${prod.default_slug}`);
            if (res.data?.data?.currentVariant) {
              stockValue = res.data.data.currentVariant.stocks;
              variantId = res.data.data.currentVariant._id;
            }
          } catch (e) {
            console.log(`Stock resolution failed for ${prod.default_slug}`);
          }
        }
        return { ...prod, stocks: stockValue, variantId };
      })
    );
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/home`);
        console.log("Fetched Home Data:", data);
        
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

    fetchHomeData();
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
            onWishlistToggle={() => console.log("Toggle wishlist:", product._id)}
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

            <Footer />
          </>
        )}
      </ScrollView>
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
  }
})