import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@/components/Header';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

interface PictureMCQInstructionScreenProps {
  onStart: () => void;
}

export default function PictureMCQInstructionScreen({ onStart }: PictureMCQInstructionScreenProps) {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Header title={t('mcq.pictureQuiz.title')} />
        <LinearGradient
          colors={[colors.tint, colors.tint]}
          style={styles.headerGradient}
        >
          <ThemedText style={styles.subtitleText}>
            
          </ThemedText>
        </LinearGradient>

        <View style={styles.instructionsContainer}>
          <View style={styles.instructionItem}>
            <ThemedText style={styles.instructionTitle}>
              {t('mcq.pictureQuiz.instructions.look.title')}
            </ThemedText>
            <ThemedText style={styles.instructionDescription}>
              {t('mcq.pictureQuiz.instructions.look.description')}
            </ThemedText>
          </View>

          <View style={styles.instructionItem}>
            <ThemedText style={styles.instructionTitle}>
              {t('mcq.pictureQuiz.instructions.drag.title')}
            </ThemedText>
            <ThemedText style={styles.instructionDescription}>
              {t('mcq.pictureQuiz.instructions.drag.description')}
            </ThemedText>
          </View>

          <View style={styles.instructionItem}>
            <ThemedText style={styles.instructionTitle}>
              {t('mcq.pictureQuiz.instructions.next.title')}
            </ThemedText>
            <ThemedText style={styles.instructionDescription}>
              {t('mcq.pictureQuiz.instructions.next.description')}
            </ThemedText>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.tint }]}
          onPress={onStart}
        >
          <ThemedText style={styles.startButtonText}>
            {t('mcq.pictureQuiz.startQuiz')}
          </ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 0,
  },
  headerGradient: {
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  welcomeText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  subtitleText: {
    fontSize: 22,
    color: '#FFFFFF',
    opacity: 0.9,
    textAlign: 'center',
  },
  instructionsContainer: {
    padding: 15,
  },
  instructionItem: {
    marginBottom: 25,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  instructionDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  startButton: {
    margin: 15,
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
}); 