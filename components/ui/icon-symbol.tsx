// Fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight, SymbolViewProps } from 'expo-symbols';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof MaterialIcons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * Add your SF Symbols to Material Icons mappings here.
 * - see Material Icons in the [Icons Directory](https://icons.expo.fyi).
 * - see SF Symbols in the [SF Symbols](https://developer.apple.com/sf-symbols/) app.
 */
const MAPPING: IconMapping = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'person.circle': 'person',
  'cart.fill': 'shopping-cart',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chevron.left': 'chevron-left',
  'line.3.horizontal': 'menu',
  'magnifyingglass': 'search',
  'heart': 'favorite-border',
  'phone.fill': 'phone',
  'shield.fill': 'security',
  'slider.horizontal.3': 'tune',
  'chevron.down': 'expand-more',
  'xmark': 'close',
  'checkmark': 'check',
  'plus': 'add',
  'minus': 'remove',
  'trash.fill': 'delete',
  'cart': 'shopping-cart',
  'list.bullet.rectangle': 'view-list',
  'star.fill': 'star',
  'mappin.and.ellipse': 'location-on',
  'person.fill': 'person',
  'xmark.circle.fill': 'cancel',
  'camera.fill': 'photo-camera',
  'globe': 'public',
  'camera': 'photo-camera',
  'facebook': 'facebook',
  'phone': 'call',
  'message': 'chat',
  'envelope': 'email',
  'map': 'place',
  'heart.fill': 'favorite',
  'xmark.circle': 'cancel',
  'checkmark.circle.fill': 'check-circle',
  'instagram': 'camera-alt',
} as IconMapping;

/**
 * An icon component that uses native SF Symbols on iOS, and Material Icons on Android and web.
 * This ensures a consistent look across platforms, and optimal resource usage.
 * Icon `name`s are based on SF Symbols and require manual mapping to Material Icons.
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
  weight?: SymbolWeight;
}) {
  return <MaterialIcons color={color} size={size} name={MAPPING[name]} style={style} />;
}
