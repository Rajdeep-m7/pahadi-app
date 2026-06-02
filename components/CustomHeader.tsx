import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { DrawerActions } from '@react-navigation/native';
import { useNavigation } from 'expo-router';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function CustomHeader() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const themeColors = Colors['light'];

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: themeColors.background }]}>
      <View style={styles.content}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity 
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
          style={styles.iconButton}
        >
          <IconSymbol name="line.3.horizontal" size={35} color={themeColors.text} />
        </TouchableOpacity>

        <Image
          source={require('../assets/images/favicon.png')}
          style={styles.logo}
        />
        </View>

        <View style={styles.rightIcons}>
          <TouchableOpacity style={styles.iconButton}>
            <IconSymbol name="magnifyingglass" size={30} color={themeColors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton}>
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: 1.2,
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginLeft: 4,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
  },
});
