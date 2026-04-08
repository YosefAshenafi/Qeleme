import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/features/common/components/ThemedText';
import { PracticeScreenStyles as styles } from './PracticeScreen.styles';

type PracticeNoSubjectsStateProps = {
  backgroundColor: string;
  textColor: string;
  errorColor: string;
  warningColor: string;
  tintColor: string;
  cardAltColor: string;
  borderColor: string;
  title: string;
  description: string;
  reasonAccount: string;
  reasonServer: string;
  reasonContent: string;
  tryAgainLabel: string;
  homeLabel: string;
  onRetry: () => void;
};

export function PracticeNoSubjectsState({
  backgroundColor,
  textColor,
  errorColor,
  warningColor,
  tintColor,
  cardAltColor,
  borderColor,
  title,
  description,
  reasonAccount,
  reasonServer,
  reasonContent,
  tryAgainLabel,
  homeLabel,
  onRetry,
}: PracticeNoSubjectsStateProps) {
  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <ScrollView style={{ flex: 1, padding: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 20 }}>
          <Ionicons name="warning-outline" size={60} color={warningColor} />
          <ThemedText
            style={{ color: errorColor, fontWeight: 'bold', fontSize: 18, marginTop: 10, textAlign: 'center' }}
          >
            {title}
          </ThemedText>
        </View>

        <ThemedText style={{ color: textColor, marginBottom: 20, textAlign: 'center', lineHeight: 22 }}>
          {description}
        </ThemedText>

        <View style={{ marginBottom: 20, paddingHorizontal: 10 }}>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <ThemedText style={{ color: textColor, marginRight: 5 }}>•</ThemedText>
            <ThemedText style={{ color: textColor, flex: 1 }}>{reasonAccount}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <ThemedText style={{ color: textColor, marginRight: 5 }}>•</ThemedText>
            <ThemedText style={{ color: textColor, flex: 1 }}>{reasonServer}</ThemedText>
          </View>
          <View style={{ flexDirection: 'row', marginBottom: 10 }}>
            <ThemedText style={{ color: textColor, marginRight: 5 }}>•</ThemedText>
            <ThemedText style={{ color: textColor, flex: 1 }}>{reasonContent}</ThemedText>
          </View>
        </View>

        <View style={{ marginTop: 20 }}>
          <TouchableOpacity style={[styles.button, { backgroundColor: tintColor, marginBottom: 15 }]} onPress={onRetry}>
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <ThemedText style={{ color: '#FFFFFF', fontWeight: 'bold', marginLeft: 10 }}>{tryAgainLabel}</ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: cardAltColor, borderWidth: 1, borderColor }]}
            onPress={() => router.replace('/(tabs)')}
          >
            <Ionicons name="home" size={20} color={textColor} />
            <ThemedText style={{ color: textColor, fontWeight: 'bold', marginLeft: 10 }}>{homeLabel}</ThemedText>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
