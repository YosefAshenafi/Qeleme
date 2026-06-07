import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/features/common/components/ThemedText';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { FlashcardsScreenStyles as styles } from './FlashcardsScreen.styles';

type FlashcardsSessionBottomActionsProps = {
  isDarkMode: boolean;
  onStillLearning: () => void;
  onGotIt: () => void;
};

export function FlashcardsSessionBottomActions({
  isDarkMode,
  onStillLearning,
  onGotIt,
}: FlashcardsSessionBottomActionsProps) {
  const { t } = useTranslation();
  return (
    <View style={styles.flashBottomActions}>
      <TouchableOpacity
        style={styles.flashBottomActionLeft}
        accessibilityRole="button"
        accessibilityLabel="Still learning"
        onPress={onStillLearning}
      >
        <View style={[styles.flashBottomIconGhost, { borderColor: isDarkMode ? '#3A4354' : '#D1D5DB' }]}>
          <IconSymbol name={'arrow.counterclockwise' as any} size={18} color={isDarkMode ? '#D1D5DB' : '#6B7280'} />
        </View>
        <ThemedText style={[styles.flashBottomLabel, { color: isDarkMode ? '#D1D5DB' : '#6B7280' }]}>
          {t('flashcards.stillLearning')}
        </ThemedText>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.flashBottomActionRight}
        accessibilityRole="button"
        accessibilityLabel="Got it"
        onPress={onGotIt}
      >
        <View style={[styles.flashBottomIconPrimary, { backgroundColor: '#0F4BD7' }]}>
          <IconSymbol name={'checkmark' as any} size={18} color="#FFFFFF" />
        </View>
        <ThemedText style={[styles.flashBottomLabelPrimary, { color: '#0F4BD7' }]}>{t('flashcards.gotIt')}</ThemedText>
      </TouchableOpacity>
    </View>
  );
}
