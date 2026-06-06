import React, { useCallback, useState } from 'react';
import { StyleSheet, ActivityIndicator, View, TouchableOpacity, Text } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Fonts } from '@/constants/theme';
import * as SecureStore from 'expo-secure-store';
import { router, useFocusEffect } from 'expo-router';

export default function ProfileScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const checkAuth = async () => {
        setIsLoading(true);
        try {
          const token = await SecureStore.getItemAsync('userToken');
          if (!token) {
            router.replace('/(auth)/login');
          } else {
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error('Error checking auth:', error);
          router.replace('/(auth)/login');
        } finally {
          setIsLoading(false);
        }
      };

      checkAuth();
    }, [])
  );

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    router.replace('/(auth)/login');
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <ThemedView style={styles.container}>
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>My Profile</ThemedText>
        <Text style={styles.subtitle}>Welcome to your account</Text>
        
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 8,
  },
  logoutButton: {
    marginTop: 40,
    backgroundColor: '#dc2626',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 12,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  }
});