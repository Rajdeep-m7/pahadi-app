import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { router, useNavigation, usePathname } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';

export function CustomHeader() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const pathname = usePathname();
  const themeColors = Colors['light'];

  // Check if we're on a sub-page (not one of the main tabs)
  const isSubPage = pathname.includes('/product/') || pathname.includes('/category/');
  const canGoBack = router.canGoBack() && isSubPage;

  const handleWishlist = () => {
    router.push('/(drawer)/wishlist');
  };

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
          <TouchableOpacity style={styles.iconButton}>
            <IconSymbol name="magnifyingglass" size={30} color={themeColors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={handleWishlist}>
            <IconSymbol name="heart" size={30} color={themeColors.text} />
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
});
