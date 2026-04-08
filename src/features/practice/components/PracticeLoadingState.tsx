import React from 'react';
import { ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/features/common/components/ThemedText';
import { ThemedView } from '@/features/common/components/ThemedView';
import { PracticeScreenStyles as styles } from './PracticeScreen.styles';

type PracticeLoadingStateProps = {
  backgroundColor: string;
  tintColor: string;
  textColor: string;
  message: string;
};

export function PracticeLoadingState({
  backgroundColor,
  tintColor,
  textColor,
  message,
}: PracticeLoadingStateProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ThemedView
        style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}
      >
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={{ marginTop: 20, color: textColor }}>{message}</ThemedText>
      </ThemedView>
    </SafeAreaView>
  );
}
