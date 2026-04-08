

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

const MAPPING = {
  
  
  'house.fill': 'home',
  'house': 'home',
  'paperplane.fill': 'send',
  'chevron.left': 'chevron-left',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'photo': 'photo',
  'message.fill': 'message',
  'message': 'message',
  'questionmark.circle.fill': 'help',
  'questionmark.circle': 'help',
  'rectangle.stack.fill': 'layers',
  'rectangle.stack': 'layers',
  'chart.bar.fill': 'bar-chart',
  'chart.bar': 'bar-chart',
  'person.fill': 'person',
  'person': 'person',
  'pencil.circle.fill': 'edit',
  'clock.fill': 'schedule',
  'trophy.fill': 'emoji-events',
  'bell.fill': 'notifications',
  'lock.fill': 'lock',
  'doc.text.fill': 'description',
  'rectangle.portrait.and.arrow.right': 'logout',
  'moon.fill': 'dark-mode',
  'sun.max.fill': 'light-mode',
  'xmark.circle.fill': 'close',
  'globe': 'language',
  'checkmark.circle.fill': 'check-circle',
  'info.circle.fill': 'info',
  'app.badge': 'apps',
  'hand.raised.fill': 'security',
  'phone.fill': 'phone',
  'envelope.fill': 'email',
  'flame.fill': 'local-fire-department',
  'flame': 'local-fire-department',
  'gearshape.fill': 'settings',
  'gearshape': 'settings',
  'magnifyingglass': 'search',
  'bell': 'notifications',
  'book.fill': 'menu-book',
  'book': 'menu-book',
  'xmark': 'close',
  'checkmark': 'check',
  'arrow.counterclockwise': 'refresh',
  'arrow.2.squarepath': 'autorenew',
  'trash.fill': 'delete',
  'exclamationmark.triangle.fill': 'warning',
  'arrow.right.circle.fill': 'arrow-circle-right',
  'folder.fill': 'folder',
  'pets': 'pets',
  'calculate': 'calculate',
  'eco': 'eco',
  'bolt.fill': 'bolt',
  'stars': 'stars',
} as const;

export type IconSymbolName = keyof typeof MAPPING | string;

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
  const iconName = (name in MAPPING ? MAPPING[name as keyof typeof MAPPING] : 'help-outline') as React.ComponentProps<
    typeof MaterialIcons
  >['name'];

  return <MaterialIcons color={color} size={size} name={iconName} style={style} />;
}
