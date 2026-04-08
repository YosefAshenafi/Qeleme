import React from 'react';
import { View } from 'react-native';
import { ThemedText } from '@/features/common/components/ThemedText';
import { HomeScreenStyles as styles } from './HomeScreen.styles';

type HomeWelcomeBlockProps = {
  isKGStudent: boolean;
  fullName?: string | null;
  welcomeTitleColor: string;
  welcomeSubtitleColor: string;
  titleKg: string;
  helloTitle: string;
  titleDefault: string;
  subtitleKg: string;
  helloSubtitle: string;
};

export function HomeWelcomeBlock({
  isKGStudent,
  fullName,
  welcomeTitleColor,
  welcomeSubtitleColor,
  titleKg,
  helloTitle,
  titleDefault,
  subtitleKg,
  helloSubtitle,
}: HomeWelcomeBlockProps) {
  return (
    <View style={[styles.welcomeCard, { backgroundColor: 'transparent' }]}>
      <ThemedText
        style={[styles.welcomeTitle, { color: welcomeTitleColor, fontSize: 36, fontWeight: '700', lineHeight: 44 }]}
      >
        {isKGStudent ? titleKg : fullName ? helloTitle : titleDefault}
      </ThemedText>
      <ThemedText style={[styles.welcomeSubtitle, { color: welcomeSubtitleColor, fontSize: 16, lineHeight: 22 }]}>
        {isKGStudent ? subtitleKg : helloSubtitle}
      </ThemedText>
    </View>
  );
}
