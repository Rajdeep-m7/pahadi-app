import { Tabs, router } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";

export default function TabLayout() {
  const cartItemCount = useCartStore((state) => state.items.length);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#f59e0b", // amber-500
        tabBarInactiveTintColor: "#9ca3af",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f3f4f6',
          height: Platform.OS === 'ios' ? 85 : 70,
          paddingBottom: Platform.OS === 'ios' ? 25 : 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="house.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: "Category",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="list.bullet.rectangle" color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/category/all-jewellery');
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="person.circle" color={color} />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            if (!useAuthStore.getState().isAuthenticated) {
              e.preventDefault();
              router.push('/(auth)/login');
            }
          },
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: "Cart",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cart.fill" color={color} />
          ),
          tabBarBadge: cartItemCount > 0 ? cartItemCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#ef4444',
            color: '#fff',
            fontSize: 10,
          },
        }}
      />
    </Tabs>
  );
}
