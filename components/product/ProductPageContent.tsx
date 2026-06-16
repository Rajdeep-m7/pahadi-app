import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  TextInput,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import ReviewSection from "./ReviewSection";
import { BASE_URL } from "@/constants/config";
import axios from "axios";
import { Fonts } from "@/constants/theme";

const { width } = Dimensions.get("window");

interface ProductPageContentProps {
  productData: any; // VariantResponse from backend
  similarProducts: any[];
}

export default function ProductPageContent({
  productData,
  similarProducts,
}: ProductPageContentProps) {
  const insets = useSafeAreaInsets();
  const { currentVariant, siblingOptions, effectiveTax } = productData;
  const productDetails = currentVariant.productId;
  const addToCart = useCartStore((state) => state.addToCart);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const cartItems = useCartStore((state) => state.items);
  const { toggleItem, isInWishlist } = useWishlistStore();
  const isWishlisted = isInWishlist(currentVariant._id);

  const cartItem = cartItems.find((item) => item.variantId === currentVariant._id);

  const [mainImage, setMainImage] = useState(currentVariant.coverImage.url);
  const [pincode, setPincode] = useState("");
  const [pincodeStatus, setPincodeStatus] = useState<{
    status: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ status: "idle" });
  const [activeAccordion, setActiveAccordion] = useState<string | null>(
    "description",
  );

  // Full-screen Viewer State
  const [isImageViewerVisible, setIsImageViewerVisible] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);

  const images = useMemo(() => {
    const all = [
      currentVariant.coverImage.url,
      ...(currentVariant.imagesArray || []).map((img: any) => img.url),
    ];
    return Array.from(new Set(all));
  }, [currentVariant]);

  const discountPercent = useMemo(() => {
    if (currentVariant.mrp > currentVariant.price) {
      return Math.round(
        ((currentVariant.mrp - currentVariant.price) / currentVariant.mrp) *
          100,
      );
    }
    return 0;
  }, [currentVariant.mrp, currentVariant.price]);

  const formatPrice = (price: number) => `₹${price.toLocaleString()}`;

  const isOutOfStock = currentVariant.stocks <= 0 || !currentVariant.isActive;

  const handleAddToCart = () => {
    addToCart(currentVariant._id, {
      _id: productDetails._id,
      title: currentVariant.title,
      image: currentVariant.coverImage.url,
      price: currentVariant.price,
      mrp: currentVariant.mrp,
      categoryName: productDetails.categoryId?.name,
      stocks: currentVariant.stocks,
      slug: currentVariant.slug,
      effectiveTax: effectiveTax || currentVariant.effectiveTax,
    });
  };

  const handleBuyNow = () => {
    handleAddToCart();
    router.push("/(drawer)/(tabs)/cart");
  };

  const handleWishlist = () => {
    toggleItem({
      _id: productDetails._id,
      variantId: currentVariant._id,
      title: currentVariant.title,
      image: currentVariant.coverImage.url,
      price: formatPrice(currentVariant.price),
      oldPrice:
        currentVariant.mrp > currentVariant.price
          ? formatPrice(currentVariant.mrp)
          : undefined,
      discount: discountPercent > 0 ? `${discountPercent}%` : undefined,
      categoryName: productDetails.categoryId?.name,
      rating: productDetails.rating,
      isOutOfStock: isOutOfStock,
      slug: currentVariant.slug,
    });
  };

  const checkPincode = async () => {
    if (pincode.length !== 6) return;
    setPincodeStatus({ status: "loading" });
    try {
      const pickupPostcode =
        productDetails.pickupWareHouseId?.pinCode || "110001";
      const { data } = await axios.get(
        `${BASE_URL}/shiprocket/serviceability`,
        {
          params: {
            pickup_postcode: pickupPostcode,
            delivery_postcode: pincode,
            weight: "0.5",
            cod: "1",
          },
        },
      );

      if (data.success && data.data?.status === 200) {
        const etd = data.data.data?.available_courier_companies?.[0]?.etd;
        setPincodeStatus({
          status: "success",
          message: `Delivery available${etd ? `. Expected by: ${etd}` : ""}`,
        });
      } else {
        setPincodeStatus({
          status: "error",
          message: "Delivery not available for this pincode",
        });
      }
    } catch (e) {
      setPincodeStatus({
        status: "error",
        message: "Delivery not available for this pincode",
      });
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.galleryContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const index = Math.round(e.nativeEvent.contentOffset.x / width);
              setMainImage(images[index]);
              setViewerIndex(index);
            }}
          >
            {images.map((img, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.9}
                onPress={() => {
                  setViewerIndex(index);
                  setIsImageViewerVisible(true);
                }}
              >
                <Image
                  source={{ uri: img }}
                  style={styles.mainImage}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity
            style={styles.wishlistFloat}
            onPress={handleWishlist}
          >
            <IconSymbol
              name="heart"
              size={24}
              color={isWishlisted ? "#ef4444" : "#4b5563"}
            />
          </TouchableOpacity>
          <View style={styles.thumbnailOverlay}>
            {images.map((img, index) => (
              <View
                key={index}
                style={[styles.dot, mainImage === img && styles.activeDot]}
              />
            ))}
          </View>
        </View>

        <View style={styles.detailsContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.category}>
              {productDetails.categoryId?.name}
            </Text>
            <Text style={styles.title}>{currentVariant.title}</Text>
          </View>

          {/* Rating Summary Row */}
          <View style={styles.ratingSummaryRow}>
            <View style={styles.starsRowSmall}>
              {[1, 2, 3, 4, 5].map((star) => (
                <IconSymbol
                  key={star}
                  name="star.fill"
                  size={16}
                  color={
                    star <= Math.round(productDetails.rating || 0)
                      ? "#f59e0b"
                      : "#e5e7eb"
                  }
                />
              ))}
            </View>
            <Text style={styles.ratingSummaryText}>
              {Number(productDetails.rating || 0).toFixed(1)} (
              {productDetails.numReviews || 0} reviews)
            </Text>
          </View>

          {/* Centered Row: Price, Discount, Stock Status */}
          <View style={styles.metricsRow}>
            <View style={styles.priceValues}>
              <Text style={styles.price}>
                {formatPrice(currentVariant.price)}
              </Text>
              {currentVariant.mrp > currentVariant.price && (
                <Text style={styles.mrp}>
                  {formatPrice(currentVariant.mrp)}
                </Text>
              )}
              {discountPercent > 0 && (
                <View style={styles.discountBadgeInline}>
                  <Text style={styles.discountText}>
                    {discountPercent}% OFF
                  </Text>
                </View>
              )}
            </View>

            <View style={styles.stockStatusInline}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isOutOfStock ? "#ef4444" : "#22c55e" },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: isOutOfStock ? "#ef4444" : "#22c55e" },
                ]}
              >
                {isOutOfStock ? "Out of Stock" : "In Stock"}
              </Text>
            </View>
          </View>

          {/* Pincode Checker */}
          <View style={styles.pincodeBox}>
            <Text style={styles.sectionLabel}>CHECK DELIVERY</Text>
            <View style={styles.pincodeInputRow}>
              <TextInput
                style={styles.pincodeInput}
                placeholder="Enter Pincode"
                placeholderTextColor="#374151"
                keyboardType="numeric"
                maxLength={6}
                value={pincode}
                onChangeText={setPincode}
              />
              <TouchableOpacity
                style={styles.pincodeButton}
                onPress={checkPincode}
                disabled={pincodeStatus.status === "loading"}
              >
                {pincodeStatus.status === "loading" ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.pincodeButtonText}>Check</Text>
                )}
              </TouchableOpacity>
            </View>
            {pincodeStatus.status !== "idle" && (
              <Text
                style={[
                  styles.pincodeMsg,
                  pincodeStatus.status === "error" && { color: "#ef4444" },
                ]}
              >
                {pincodeStatus.message}
              </Text>
            )}
          </View>

          {/* Style Selector */}
          {siblingOptions.length > 1 && (
            <View style={styles.stylesBox}>
              <Text style={styles.sectionLabel}>SELECT STYLE</Text>
              <View style={styles.stylesList}>
                {siblingOptions.map((opt: any) => (
                  <TouchableOpacity
                    key={opt._id}
                    style={[
                      styles.styleBtn,
                      opt.slug === currentVariant.slug && styles.activeStyleBtn,
                    ]}
                    onPress={() => router.push(`/product/${opt.slug}`)}
                  >
                    <Text
                      style={[
                        styles.styleBtnText,
                        opt.slug === currentVariant.slug &&
                          styles.activeStyleBtnText,
                      ]}
                    >
                      {Object.entries(opt.attributes || {})
                        .filter(([k]) => !['discounttype', 'type-single', 'discountType', 'type' , 'discount' , 'type'].includes(k.toLowerCase()))
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(" / ") || opt.title}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Return Policy */}
          <View style={styles.infoRow}>
            <IconSymbol name="paperplane.fill" size={16} color="#3b82f6" />
            <Text style={styles.infoText}>
              {productDetails.returnPolicyType?.toLowerCase() === 'none' || !productDetails.returnPolicyType
                ? "Return policy not available"
                : `Return Policy: ${productDetails.returnPolicyType} (${productDetails.returnWindowDays || 0} days)`
              }
            </Text>
          </View>

          {/* Accordions */}
          <View style={styles.accordions}>
            {/* Description */}
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() =>
                setActiveAccordion(
                  activeAccordion === "description" ? null : "description",
                )
              }
            >
              <Text style={styles.accordionTitle}>DESCRIPTION</Text>
              <IconSymbol
                name={
                  activeAccordion === "description"
                    ? "chevron.down"
                    : "chevron.right"
                }
                size={20}
                color="#111827"
              />
            </TouchableOpacity>
            {activeAccordion === "description" && (
              <View style={styles.accordionContent}>
                <Text style={styles.descText}>
                  {productDetails.desc?.replace(/<[^>]*>?/gm, "") ||
                    "No description available."}
                </Text>
              </View>
            )}

            {/* Specifications */}
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() =>
                setActiveAccordion(activeAccordion === "specs" ? null : "specs")
              }
            >
              <Text style={styles.accordionTitle}>SPECIFICATIONS</Text>
              <IconSymbol
                name={
                  activeAccordion === "specs" ? "chevron.down" : "chevron.right"
                }
                size={20}
                color="#111827"
              />
            </TouchableOpacity>
            {activeAccordion === "specs" && (
              <View style={styles.accordionContent}>
                {productDetails.specs?.map((spec: any, i: number) => (
                  <View key={i} style={styles.specRow}>
                    <Text style={styles.specKey}>{spec.key}</Text>
                    <Text style={styles.specVal}>{spec.value}</Text>
                  </View>
                )) || (
                  <Text style={styles.descText}>No specifications listed.</Text>
                )}
              </View>
            )}

            {/* Reviews */}
            <TouchableOpacity
              style={styles.accordionHeader}
              onPress={() =>
                setActiveAccordion(
                  activeAccordion === "reviews" ? null : "reviews",
                )
              }
            >
              <Text style={styles.accordionTitle}>REVIEWS</Text>
              <IconSymbol
                name={
                  activeAccordion === "reviews"
                    ? "chevron.down"
                    : "chevron.right"
                }
                size={20}
                color="#111827"
              />
            </TouchableOpacity>
            {activeAccordion === "reviews" && (
              <View style={styles.accordionContent}>
                <ReviewSection productId={productDetails._id} />
              </View>
            )}
          </View>

          {/* Feature Badges */}
          <View style={styles.badgesGrid}>
            {[
              {
                icon: "paperplane.fill",
                label: "FREE DELIVERY",
                sub: "On prepaid",
              },
              { icon: "checkmark", label: "CERTIFIED", sub: "100% Authentic" },
              { icon: "shield.fill", label: "SECURE", sub: "Encrypted" },
              { icon: "heart", label: "HANDMADE", sub: "With Love" },
            ].map((b, i) => (
              <View key={i} style={styles.badgeItem}>
                <IconSymbol name={b.icon as any} size={24} color="#f59e0b" />
                <View>
                  <Text style={styles.badgeLabel}>{b.label}</Text>
                  <Text style={styles.badgeSub}>{b.sub}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Similar Products */}
          {similarProducts.length > 0 && (
            <View style={styles.similarSection}>
              <Text style={styles.similarTitle}>You May Also Like</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.similarScroll}
              >
                {similarProducts.map((p: any) => (
                  <TouchableOpacity
                    key={p._id}
                    style={styles.similarCard}
                    onPress={() =>
                      router.push(`/product/${p.default_slug || p.slug}`)
                    }
                  >
                    <Image
                      source={{ uri: p.coverImage?.url }}
                      style={styles.similarImage}
                    />
                    <Text style={styles.similarName} numberOfLines={1}>
                      {p.title}
                    </Text>
                    <Text style={styles.similarPrice}>
                      ₹{p.displayPrice?.toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      {/* Sticky Bottom Actions */}
      <View style={[styles.stickyFooter, { paddingBottom: Math.max(insets.bottom, 16) }]}>
        {cartItem ? (
          <View style={[styles.footerBtn, styles.quantityContainer]}>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() => updateQuantity(currentVariant._id, cartItem.quantity - 1)}
            >
              <IconSymbol name="minus" size={18} color="#fff" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{cartItem.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityBtn}
              onPress={() => updateQuantity(currentVariant._id, cartItem.quantity + 1)}
              disabled={cartItem.quantity >= (currentVariant.stocks || 99)}
            >
              <IconSymbol name="plus" size={18} color="#fff" />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[
              styles.footerBtn,
              styles.cartBtn,
              isOutOfStock && styles.disabledBtn,
            ]}
            onPress={handleAddToCart}
            disabled={isOutOfStock}
          >
            <IconSymbol
              name="cart.fill"
              size={18}
              color={isOutOfStock ? "#9ca3af" : "#fff"}
            />
            <Text
              style={[styles.cartBtnText, isOutOfStock && styles.disabledText]}
            >
              ADD TO CART
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={[
            styles.footerBtn,
            styles.buyBtn,
            isOutOfStock && styles.disabledBtn,
          ]}
          onPress={handleBuyNow}
          disabled={isOutOfStock}
        >
          <Text style={styles.buyBtnText}>BUY NOW</Text>
        </TouchableOpacity>
      </View>

      {/* Full Screen Image Viewer Modal */}
      <Modal
        visible={isImageViewerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsImageViewerVisible(false)}
      >
        <View style={styles.fullScreenViewer}>
          <TouchableOpacity
            style={styles.closeViewerBtn}
            onPress={() => setIsImageViewerVisible(false)}
          >
            <IconSymbol name="xmark" size={30} color="#fff" />
          </TouchableOpacity>
          <FlatList
            data={images}
            keyExtractor={(item) => item}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={viewerIndex}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
            renderItem={({ item }) => (
              <View style={styles.fullScreenImageContainer}>
                <Image
                  source={{ uri: item }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              </View>
            )}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  galleryContainer: {
    width: width,
    height: width,
    backgroundColor: "#f9fafb",
    position: "relative",
  },
  mainImage: {
    width: width,
    height: width,
  },
  wishlistFloat: {
    position: "absolute",
    top: 20,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  thumbnailOverlay: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  activeDot: {
    backgroundColor: "#f59e0b",
    width: 20,
  },
  detailsContainer: {
    padding: 20,
  },
  header: {
    marginBottom: 16,
  },
  category: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#f59e0b",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111827",
    lineHeight: 30,
  },
  ratingSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  starsRowSmall: {
    flexDirection: "row",
    gap: 2,
  },
  ratingSummaryText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#6b7280",
  },
  metricsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    marginBottom: 24,
    gap: 12,
    flexWrap: "wrap",
  },
  priceValues: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 12,
  },
  price: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111827",
  },
  mrp: {
    fontSize: 16,
    color: "#9ca3af",
    textDecorationLine: "line-through",
  },
  discountBadgeInline: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    alignSelf:"center",
  },
  discountText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#059669",
  },
  stockStatusInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#f9fafb",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  pincodeBox: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#6b7280",
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  pincodeInputRow: {
    flexDirection: "row",
    gap: 10,
  },
  pincodeInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: "600",
  },
  pincodeButton: {
    backgroundColor: "#b98b5f",
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 10,
  },
  pincodeButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  pincodeMsg: {
    marginTop: 8,
    fontSize: 11,
    fontWeight: "600",
    color: "#059669",
  },
  stylesBox: {
    marginBottom: 24,
  },
  stylesList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  styleBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  activeStyleBtn: {
    borderColor: "#f59e0b",
    backgroundColor: "#fffbeb",
  },
  styleBtnText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#4b5563",
  },
  activeStyleBtnText: {
    color: "#b45309",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: "#eff6ff",
    borderRadius: 10,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#1e40af",
  },
  accordions: {
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    marginBottom: 24,
  },
  accordionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  accordionTitle: {
    fontSize: 12,
    fontWeight: "900",
    color: "#111827",
    letterSpacing: 1,
  },
  accordionContent: {
    paddingVertical: 16,
  },
  descText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 22,
  },
  specRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    marginBottom: 8,
  },
  specKey: {
    flex: 1,
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  specVal: {
    flex: 1.5,
    fontSize: 14,
    color: "#111827",
    fontWeight: "700",
    textAlign: "right",
  },
  badgesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 32,
  },
  badgeItem: {
    width: "48%",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#f3f4f6",
    borderRadius: 12,
  },
  badgeLabel: {
    fontSize: 11,
    fontWeight: "900",
    color: "#111827",
  },
  badgeSub: {
    fontSize: 10,
    color: "#9ca3af",
    fontWeight: "bold",
  },
  similarSection: {
    marginTop: 10,
  },
  similarTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 16,
  },
  similarScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  similarCard: {
    width: 140,
    marginRight: 16,
  },
  similarImage: {
    width: 140,
    height: 140,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    marginBottom: 8,
  },
  similarName: {
    fontSize: 12,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  similarPrice: {
    fontSize: 13,
    fontWeight: "800",
    color: "#f59e0b",
  },
  stickyFooter: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    flexDirection: "row",
    padding: 16,
    paddingBottom: Platform.OS === "ios" ? 34 : 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
    gap: 12,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
  },
  footerBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  quantityContainer: {
    backgroundColor: "#b98b5f",
    justifyContent: "space-between",
    paddingHorizontal: 15,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  cartBtn: {
    backgroundColor: "#b98b5f",
    borderWidth: 0,
  },
  buyBtn: {
    backgroundColor: "#006a4e",
  },
  cartBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  buyBtnText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  disabledBtn: {
    backgroundColor: "#f3f4f6",
    borderColor: "#f3f4f6",
  },
  disabledText: {
    color: "#9ca3af",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "600",
  },
  fullScreenViewer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
  },
  closeViewerBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 50 : 20,
    right: 20,
    zIndex: 100,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 25,
  },
  fullScreenImageContainer: {
    width: width,
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenImage: {
    width: "100%",
    height: "80%",
  },
});
