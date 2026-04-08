import React from 'react';
import { TouchableOpacity } from 'react-native';
import { ThemedText } from '@/features/common/components/ThemedText';
import { ThemedView } from '@/features/common/components/ThemedView';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { PracticeScreenStyles as styles } from './PracticeScreen.styles';

type PracticeErrorStateProps = {
  backgroundColor: string;
  textColor: string;
  tintColor: string;
  warningColor: string;
  title: string;
  message: string;
  retryLabel: string;
  onRetry: () => void;
};

export function PracticeErrorState({
  backgroundColor,
  textColor,
  tintColor,
  warningColor,
  title,
  message,
  retryLabel,
  onRetry,
}: PracticeErrorStateProps) {
  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ThemedView
        style={[
          styles.mainContainer,
          { backgroundColor, justifyContent: 'center', alignItems: 'center', padding: 20 },
        ]}
      >
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
            <ThemedText style={[styles.retryButtonText, { color: '#FFFFFF' }]}>{retryLabel}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}
