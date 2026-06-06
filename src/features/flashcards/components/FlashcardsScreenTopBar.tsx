import React from 'react';
import { TouchableOpacity, View, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import { FlashcardsScreenStyles as styles } from './FlashcardsScreen.styles';
import { FLASH_HEADER_BACK_ICON } from '@/features/flashcards/constants/flashcardsUi';

export function FlashcardsScreenTopBar({ onClose }: { onClose?: () => void }) {
  return (
    <View style={styles.flashHeaderWrap}>
      <View style={styles.flashTopBar}>
        <TouchableOpacity
          onPress={onClose ?? (() => router.back())}
          style={{ padding: 8 }}
          accessibilityRole="button"
          accessibilityLabel={onClose ? 'End flashcards session' : 'Back'}
        >
          <Ionicons name={onClose ? 'close' : 'chevron-back'} size={onClose ? 26 : 24} color={FLASH_HEADER_BACK_ICON} />
        </TouchableOpacity>
        <Image
          source={require('@/assets/images/logo.png')}
          style={styles.flashTopLogoLeft}
          resizeMode="contain"
        />
        <LanguageToggle colors={{ card: '#F3F4F6', text: '#4B5563' }} />
      </View>
    </View>
  );
}
