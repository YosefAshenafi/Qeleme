import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import { FlashcardsScreenStyles as styles } from './FlashcardsScreen.styles';
import { FLASH_HEADER_BACK_ICON } from '@/features/flashcards/constants/flashcardsUi';

export function FlashcardsScreenTopBar() {
  return (
    <View style={styles.flashHeaderWrap}>
      <View style={styles.flashTopBar}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="chevron-back" size={24} color={FLASH_HEADER_BACK_ICON} />
        </TouchableOpacity>
        <View style={styles.flashTopLogoLeft} />
        <LanguageToggle colors={{ card: '#F3F4F6', text: '#4B5563' }} />
      </View>
    </View>
  );
}
