import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { router } from 'expo-router';
import { useWishlistStore } from '@/store/wishlistStore';

const { width } = Dimensions.get('window');
// Screen - 20 (side padding) - 10 (gap) = width - 30
// Divided by 2 for columns
const CARD_WIDTH = (width - 30) / 2;

export interface ProductCardProps {
  image: string;
  title: string;
  price: string;
  oldPrice?: string;
  discount?: string;
  categoryName?: string;
  rating?: number;
  isOutOfStock?: boolean;
  attributes?: Record<string, string>;
  slug?: string;
  variantId?: string;
  _id?: string; // Product ID
  onPress?: () => void;
  onWishlistToggle?: () => void;
  onAddToCart?: () => void;
}

export default function ProductCard({
  image,
  title,
  price,
  oldPrice,
  discount,
  categoryName,
  rating ,
  isOutOfStock = false,
  attributes,
  slug,
  variantId,
  _id,
  onPress,
  onWishlistToggle,
  onAddToCart,
}: ProductCardProps) {
  const { toggleItem, isInWishlist } = useWishlistStore();
  const isWishlisted = variantId ? isInWishlist(variantId) : false;

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (slug) {
      router.push(`/product/${slug}`);
    }
  };

  const handleWishlist = () => {
    if (!variantId) {
      console.warn('Wishlist error: variantId missing for', title);
      return;
    }
    
    toggleItem({
      _id: _id || '',
      variantId,
      title,
      image,
      price,
      oldPrice,
      discount,
      categoryName,
      rating,
      isOutOfStock,
      slug,
    });
    
    if (onWishlistToggle) onWishlistToggle();
  };

  return (
    <TouchableOpacity 
      style={styles.cardContainer} 
      onPress={handlePress} 
      activeOpacity={0.9}
    >
      {/* IMAGE SECTION */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: image || 'https://via.placeholder.com/300x400' }} 
          style={[styles.image, isOutOfStock && styles.outOfStockImage]} 
        />
        
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>OUT OF STOCK</Text>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.wishlistButton} 
          onPress={handleWishlist}
          activeOpacity={0.7}
        >
          <IconSymbol 
            name="heart" 
            size={20} 
            color={isWishlisted ? '#ef4444' : '#4b5563'} 
          />
        </TouchableOpacity>
      </View>

      <View style={styles.detailsContainer}>
        
        <View style={styles.titleRow}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>{Number(rating || 0).toFixed(1)}</Text>
            <IconSymbol name="star.fill" size={10} color="#16a34a" />
          </View>
        </View>

        {categoryName ? <Text style={styles.category} numberOfLines={1}>{categoryName}</Text> : null}

        {/* Attributes (e.g., Size, Weight) */}
        {attributes && Object.entries(attributes).filter(([k]) => !['discounttype', 'type-single', 'discountType', 'type'].includes(k.toLowerCase())).length > 0 && (
          <View style={styles.attributesContainer}>
            {Object.entries(attributes)
              .filter(([k]) => !['discounttype', 'type-single', 'discountType', 'type'].includes(k.toLowerCase()))
              .map(([k, v]) => (
              <View key={k} style={styles.attributeBadge}>
                <Text style={styles.attributeText}>{k}: {v}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Pricing */}
        <View style={styles.pricingRow}>
          <Text style={styles.price}>{price}</Text>
          {oldPrice && <Text style={styles.oldPrice}>{oldPrice}</Text>}
          {discount && (
          <View style={styles.centerDiscountContainer}>
            <Text style={styles.discountText}>{discount} OFF</Text>
          </View>
        )}
        </View>

        {/* Action Button */}
        {!isOutOfStock ? (
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={onAddToCart}
            activeOpacity={0.8}
          >
            <IconSymbol name="cart.fill" size={16} color="#fff" />
            <Text style={styles.addButtonText}>Quick Add</Text>
          </TouchableOpacity>
        ) : (
          <View style={[styles.addButton, styles.addButtonDisabled]}>
            <Text style={styles.addButtonTextDisabled}>Unavailable</Text>
          </View>
        )}

      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 0.85,
    position: 'relative',
    backgroundColor: '#f9fafb',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  outOfStockImage: {
    opacity: 0.6,
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  outOfStockText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#dc2626',
    letterSpacing: 1,
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    padding: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  title: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: '#5f4339',
    marginRight: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#dcfce3',
  },
  ratingText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#15803d',
    marginRight: 1,
  },
  starIcon: {
    fontSize: 8,
    color: '#16a34a',
  },
  category: {
    fontSize: 10,
    color: '#9ca3af',
    marginBottom: 6,
  },
  attributesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 6,
  },
  attributeBadge: {
    backgroundColor: '#fffbeb',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
  },
  attributeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#d97706',
    textTransform: 'uppercase',
  },
  pricingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: '800',
    color: '#5f4339',
  },
  oldPrice: {
    fontSize: 11,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  discountText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#16a34a',
  },
  centerDiscountContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#b98b5f',
    paddingVertical: 7,
    borderRadius: 6,
    gap: 4,
    marginTop: 2,
  },
  addButtonDisabled: {
    backgroundColor: '#f3f4f6',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  addButtonTextDisabled: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '700',
  },
});
