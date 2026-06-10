import { Drawer } from 'expo-router/drawer';
import { CustomHeader } from '@/components/CustomHeader';
import { useEffect, useState } from 'react';
import { BASE_URL } from '@/constants/config';
import axios from 'axios';
import { Image, Text, View, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { Colors } from '@/constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';

interface Category {
  _id: string;
  name: string;
  slug: string;
  iconUrl?: string;
  imageUrl?: string;
}

function CustomDrawerContent(props: any) {
  const { categories } = props;
  const insets = useSafeAreaInsets();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
      <View style={[styles.drawerHeader, { paddingTop: insets.top + 20 }]}>
        <Image
          source={require('@/assets/images/favicon.png')}
          style={styles.logo}
        />
        <Text style={styles.brandName}>Pahadi Collections</Text>
      </View>
      
      <DrawerItemList {...props} />
      
      <View style={styles.divider} />
      <Text style={styles.sectionTitle}>Categories</Text>
      
      {categories && categories.length > 0 ? (
        categories.map((category: Category) => (
          <DrawerItem
            key={category._id}
            label={category.name}
            onPress={() => {
              router.push(`/category/${category.slug || category._id}`);
            }}
            icon={() => (
              category.iconUrl ? (
                <Image
                  source={{ uri: category.iconUrl }}
                  style={{ width: 22, height: 22, borderRadius: 4, resizeMode: 'contain' }}
                />
              ) : (
                <IconSymbol name="list.bullet.rectangle" size={20} color="#9ca3af" />
              )
            )}
          />
        ))
      ) : (
        <Text style={styles.noCategories}>No categories found</Text>
      )}
    </DrawerContentScrollView>
  );
}

export default function DrawerLayout() {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${BASE_URL}/categories`);
        if (data && data.data) {
          setCategories(data.data);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} categories={categories} />}
      screenOptions={{
        header: () => <CustomHeader />,
        drawerType: 'front',
        drawerActiveTintColor: Colors.light.tint,
        drawerInactiveTintColor: Colors.light.text,
      }}
    >
      <Drawer.Screen
        name="(tabs)"
        options={{
          drawerLabel: 'Home',
          title: 'Home',
        }}
      />
      <Drawer.Screen
        name="wishlist"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Wishlist',
        }}
      />
      <Drawer.Screen
        name="search"
        options={{
          drawerItemStyle: { display: 'none' },
          title: 'Search Results',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  drawerHeader: {
    padding: 20,
    backgroundColor: '#f8f8f8',
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 10,
  },
  brandName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 10,
  },
  sectionTitle: {
    marginLeft: 20,
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  noCategories: {
    marginLeft: 20,
    fontSize: 12,
    color: '#aaa',
    fontStyle: 'italic',
    marginTop: 10,
  },
});
