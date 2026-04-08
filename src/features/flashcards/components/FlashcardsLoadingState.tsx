import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedView } from '@/features/common/components/ThemedView';
import { ThemedText } from '@/features/common/components/ThemedText';
import { FlashcardsScreenStyles as styles } from './FlashcardsScreen.styles';

type FlashcardsLoadingStateProps = {
  backgroundColor: string;
  textColor: string;
  message: string;
  centered?: boolean;
};

export function FlashcardsLoadingState({
  backgroundColor,
  textColor,
  message,
  centered,
}: FlashcardsLoadingStateProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ThemedView
        style={[styles.container, { backgroundColor }, centered && { justifyContent: 'center' }]}
      >
        <ThemedText style={[styles.loadingText, { color: textColor }]}>{message}</ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}
