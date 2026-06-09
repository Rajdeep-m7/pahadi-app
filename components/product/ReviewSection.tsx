import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image, ScrollView } from 'react-native';
import axios from 'axios';
import { BASE_URL } from '@/constants/config';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  userId: {
    _id: string;
    name: string;
  } | string;
  images?: { url: string }[];
  createdAt: string;
}

interface ReviewSectionProps {
  productId: string;
}

export default function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/reviews/product/${productId}`);
        if (data && data.data) {
          setReviews(data.data);
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) fetchReviews();
  }, [productId]);

  const averageRating = reviews.length
    ? (reviews.reduce((acc, rev) => acc + rev.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  if (loading) {
    return <ActivityIndicator size="small" color="#f59e0b" style={{ marginVertical: 20 }} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.summaryRow}>
        <View style={styles.ratingBox}>
          <Text style={styles.averageRating}>{averageRating}</Text>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <IconSymbol
                key={star}
                name="star.fill"
                size={16}
                color={star <= Math.round(Number(averageRating)) ? '#f59e0b' : '#e5e7eb'}
              />
            ))}
          </View>
          <Text style={styles.reviewCount}>Based on {reviews.length} reviews</Text>
        </View>

        <View style={styles.barsContainer}>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = reviews.filter((r) => r.rating === star).length;
            const percentage = reviews.length ? (count / reviews.length) * 100 : 0;
            return (
              <View key={star} style={styles.barRow}>
                <Text style={styles.barLabel}>{star}</Text>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { width: `${percentage}%` }]} />
                </View>
                <Text style={styles.barCount}>{count}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.list}>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <View key={review._id} style={styles.reviewItem}>
              <View style={styles.itemHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {typeof review.userId === 'object' ? review.userId.name.charAt(0) : 'U'}
                  </Text>
                </View>
                <View style={styles.itemInfo}>
                  <Text style={styles.userName}>
                    {typeof review.userId === 'object' ? review.userId.name : 'Verified Customer'}
                  </Text>
                  <Text style={styles.date}>
                    {new Date(review.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </Text>
                </View>
                <View style={styles.itemStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <IconSymbol
                      key={star}
                      name="star.fill"
                      size={12}
                      color={star <= review.rating ? '#f59e0b' : '#e5e7eb'}
                    />
                  ))}
                </View>
              </View>
              <Text style={styles.comment}>&quot;{review.comment}&quot;</Text>
              {review.images && review.images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
                  {review.images.map((img, idx) => (
                    <Image key={idx} source={{ uri: img.url }} style={styles.reviewImage} />
                  ))}
                </ScrollView>
              )}
            </View>
          ))
        ) : (
          <View style={styles.empty}>
            <IconSymbol name="message.fill" size={32} color="#9ca3af" />
            <Text style={styles.emptyText}>No reviews yet. Be the first to review!</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 10,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    gap: 20,
  },
  ratingBox: {
    alignItems: 'center',
    flex: 1,
  },
  averageRating: {
    fontSize: 40,
    fontWeight: '900',
    color: '#111827',
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
    marginVertical: 4,
  },
  reviewCount: {
    fontSize: 10,
    color: '#6b7280',
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  barsContainer: {
    flex: 1.5,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4b5563',
    width: 10,
  },
  barBg: {
    flex: 1,
    height: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 2,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    backgroundColor: '#f59e0b',
  },
  barCount: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: 'bold',
    width: 20,
  },
  list: {
    gap: 16,
  },
  reviewItem: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#fffbeb',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#fef3c7',
  },
  avatarText: {
    color: '#d97706',
    fontWeight: 'bold',
    fontSize: 16,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  userName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  date: {
    fontSize: 10,
    color: '#9ca3af',
    fontWeight: '600',
  },
  itemStars: {
    flexDirection: 'row',
    gap: 1,
  },
  comment: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  imageScroll: {
    marginTop: 12,
  },
  reviewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 10,
  },
  emptyText: {
    color: '#9ca3af',
    fontSize: 13,
    fontWeight: '500',
  },
});
