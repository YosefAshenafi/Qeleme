// This file is a fallback for using MaterialIcons on Android and web.

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, TextStyle } from 'react-native';

// Add your SFSymbol to MaterialIcons mappings here.
const MAPPING = {
  // See MaterialIcons here: https://icons.expo.fyi
  // See SF Symbols in the SF Symbols app on Mac.
  'house.fill': 'home',
  'house': 'home',
  'paperplane.fill': 'send',
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
} as const;

export type IconSymbolName = keyof typeof MAPPING;

/**
 * An icon component that uses native SFSymbols on iOS, and MaterialIcons on Android and web. This ensures a consistent look across platforms, and optimal resource usage.
 *
 * Icon `name`s are based on SFSymbols and require manual mapping to MaterialIcons.
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
