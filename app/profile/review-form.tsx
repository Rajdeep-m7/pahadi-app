import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { BASE_URL } from '@/constants/config';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function ReviewFormScreen() {
  const { productId, productName, reviewId, existingRating, existingComment } = useLocalSearchParams();
  
  const [rating, setRating] = useState(Number(existingRating) || 5);
  const [comment, setComment] = useState((existingComment as string) || '');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment.');
      return;
    }

    setSubmitting(true);
    const token = await SecureStore.getItemAsync('userToken');

    try {
      if (reviewId) {
        // Edit existing review
        await axios.patch(
          `${BASE_URL}/reviews/${reviewId}`,
          { rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert('Success', 'Review updated successfully.');
      } else {
        // Create new review
        await axios.post(
          `${BASE_URL}/reviews/product/${productId}`,
          { rating, comment },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        Alert.alert('Success', 'Review submitted successfully.');
      }
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: reviewId ? 'Edit Review' : 'Write Review', 
          headerShown: true 
        }} 
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.productHeader}>
            <Text style={styles.label}>Product</Text>
            <Text style={styles.productName}>{productName}</Text>
          </View>

          <View style={styles.ratingSection}>
            <Text style={styles.label}>Rating</Text>
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity key={star} onPress={() => setRating(star)}>
                  <IconSymbol
                    name="star.fill"
                    size={40}
                    color={star <= rating ? '#f59e0b' : '#e5e7eb'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingText}>
              {rating === 1 ? 'Poor' : rating === 2 ? 'Fair' : rating === 3 ? 'Good' : rating === 4 ? 'Very Good' : 'Excellent'}
            </Text>
          </View>

          <View style={styles.commentSection}>
            <Text style={styles.label}>Review Comment</Text>
            <TextInput
              style={styles.input}
              value={comment}
              onChangeText={setComment}
              placeholder="Tell us what you think about the product..."
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, submitting && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>
                {reviewId ? 'Update Review' : 'Submit Review'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    padding: 24,
    gap: 32,
  },
  label: {
    fontSize: 12,
    fontWeight: '900',
    color: '#6b7280',
    letterSpacing: 1,
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  productHeader: {
    backgroundColor: '#f9fafb',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#f3f4f6',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  ratingSection: {
    alignItems: 'center',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 12,
    marginVertical: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#f59e0b',
  },
  commentSection: {
    gap: 8,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 16,
    fontSize: 14,
    color: '#111827',
    minHeight: 120,
  },
  submitButton: {
    backgroundColor: '#111827',
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledButton: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
