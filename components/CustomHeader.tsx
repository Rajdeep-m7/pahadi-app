import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Image, TextInput, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { router, useNavigation, usePathname } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useWishlistStore } from '@/store/wishlistStore';

export function CustomHeader() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const pathname = usePathname();
  const themeColors = Colors['light'];
  
  const wishlistItems = useWishlistStore((state) => state.items);
  const wishlistCount = wishlistItems ? wishlistItems.length : 0;
  
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Check if we're on a sub-page (not one of the main tabs)
  const isSubPage = pathname.includes('/product/') || pathname.includes('/profile/');
  const canGoBack = router.canGoBack() && isSubPage;

  const handleWishlist = () => {
    router.push('/(drawer)/wishlist');
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: '/(drawer)/search',
        params: { q: searchQuery.trim() }
      });
      setIsSearchActive(false);
      setSearchQuery('');
    }
  };

  if (isSearchActive) {
    return (
      <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.background }]}>
        <View style={styles.content}>
          <View style={styles.searchBarHeader}>
            <TouchableOpacity onPress={() => setIsSearchActive(false)} style={styles.iconButton}>
              <IconSymbol name="chevron.left" size={28} color={themeColors.text} />
            </TouchableOpacity>
            <TextInput
              style={styles.headerSearchInput}
              placeholder="Search products..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearchSubmit}
              autoFocus
              placeholderTextColor="#374151"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <IconSymbol name="xmark.circle.fill" size={20} color="#9ca3af" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          {canGoBack ? (
            <TouchableOpacity 
              onPress={() => router.back()}
              style={styles.iconButton}
            >
              <IconSymbol name="chevron.left" size={30} color={themeColors.text} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
              style={styles.iconButton}
            >
              <IconSymbol name="line.3.horizontal" size={35} color={themeColors.text} />
            </TouchableOpacity>
          )}

          <Image
            source={require('../assets/images/favicon.png')}
            style={styles.logo}
          />
        </View>

        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsSearchActive(true)}>
            <IconSymbol name="magnifyingglass" size={30} color={themeColors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleWishlist}>
            <View>
              <IconSymbol name="heart" size={30} color={themeColors.text} />
              {wishlistCount > 0 && (
                <View style={styles.badgeContainer}>
                  <Text style={styles.badgeText}>{wishlistCount}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  content: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
    marginLeft: 5,
  },
  searchBarHeader: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    paddingRight: 10,
    height: 44,
  },
  headerSearchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
    paddingVertical: Platform.OS === 'ios' ? 10 : 5,
  },
  badgeContainer: {
    position: 'absolute',
    right: -6,
    top: -6,
    backgroundColor: '#ef4444',
    borderRadius: 9,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
