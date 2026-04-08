import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { ThemedText } from '@/features/common/components/ThemedText';
import { HomeScreenStyles as styles } from './HomeScreen.styles';

type HomeQuickAccessSectionProps = {
  sectionHeadingColor: string;
  quickCardBg: string;
  quickCardBorder: string;
  isDarkMode: boolean;
  sectionTitle: string;
  practiceLabel: string;
  flashcardsLabel: string;
};

export function HomeQuickAccessSection({
  sectionHeadingColor,
  quickCardBg,
  quickCardBorder,
  isDarkMode,
  sectionTitle,
  practiceLabel,
  flashcardsLabel,
}: HomeQuickAccessSectionProps) {
  return (
    <>
      <ThemedText style={[styles.quickAccessHeading, { color: sectionHeadingColor }]}>{sectionTitle}</ThemedText>
      <View style={styles.quickAccessRow}>
        <TouchableOpacity
          style={[styles.quickAccessCard, { backgroundColor: quickCardBg, borderColor: quickCardBorder }]}
          onPress={() => router.push('/(tabs)/practice')}
          activeOpacity={0.88}
        >
          <View style={[styles.quickAccessIconCircle, { backgroundColor: isDarkMode ? '#1E3A5F' : '#E3F2FD' }]}>
            <IconSymbol name="book.fill" size={26} color="#0F4BD7" />
          </View>
          <ThemedText style={[styles.quickAccessLabel, { color: sectionHeadingColor }]}>{practiceLabel}</ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.quickAccessCard, { backgroundColor: quickCardBg, borderColor: quickCardBorder }]}
          onPress={() => router.push('/(tabs)/practice')}
          activeOpacity={0.88}
        >
          <View style={[styles.quickAccessIconCircle, { backgroundColor: isDarkMode ? '#1B3328' : '#E8F5E9' }]}>
            <IconSymbol name="rectangle.stack.fill" size={26} color="#2E7D32" />
          </View>
          <ThemedText style={[styles.quickAccessLabel, { color: sectionHeadingColor }]}>{flashcardsLabel}</ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
}
