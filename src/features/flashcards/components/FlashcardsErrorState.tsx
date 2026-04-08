import React from 'react';
import { TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/features/common/components/ThemedView';
import { ThemedText } from '@/features/common/components/ThemedText';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { FlashcardsScreenStyles as styles } from './FlashcardsScreen.styles';
import { FLASH_RETRY_BUTTON_TEXT } from '@/features/flashcards/constants/flashcardsUi';

type FlashcardsErrorStateProps = {
  backgroundColor: string;
  textColor: string;
  tintColor: string;
  warningColor: string;
  title: string;
  message: string;
  retryLabel: string;
  onRetry: () => void;
};

export function FlashcardsErrorState({
  backgroundColor,
  textColor,
  tintColor,
  warningColor,
  title,
  message,
  retryLabel,
  onRetry,
}: FlashcardsErrorStateProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ThemedView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={[styles.emptyStateContainer, { backgroundColor }]}>
          <IconSymbol name="globe" size={90} color={warningColor} style={styles.emptyStateIcon} />
          <ThemedText style={[styles.emptyStateTitle, { color: textColor }]}>{title}</ThemedText>
          <ThemedText style={[styles.emptyStateSubtitle, { color: textColor, opacity: 0.7 }]}>
            {message}
          </ThemedText>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: tintColor, marginTop: 20 }]}
            onPress={onRetry}
          >
            <ThemedText style={[styles.retryButtonText, { color: FLASH_RETRY_BUTTON_TEXT }]}>
              {retryLabel}
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </SafeAreaView>
  );
}
