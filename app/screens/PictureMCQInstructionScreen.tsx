import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@/components/Header';

const { width } = Dimensions.get('window');

interface PictureMCQInstructionScreenProps {
  onStart: () => void;
}

export default function PictureMCQInstructionScreen({ onStart }: PictureMCQInstructionScreenProps) {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  const instructions = [
    {
      title: "Look at the Picture 👀",
      description: "You'll see a picture at the top!",
      icon: "👀"
    },
    {
      title: "Drag to Answer 🖼️",
      description: "Drag the picture to the correct answer below!",
      icon: "🖼️"
    },
    {
      title: "Next Question! ➡️",
      description: "See if you're right and continue to the next one!",
      icon: "➡️"
    }
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Header title="Picture Quiz Time! 🎨" />
        <LinearGradient
          colors={[colors.tint, colors.tint]}
          style={styles.headerGradient}
        >
          
          <ThemedText style={styles.subtitleText}>
            Let's learn with pictures!
          </ThemedText>
        </LinearGradient>

        <View style={styles.instructionsContainer}>
          {instructions.map((instruction, index) => (
            <View key={index} style={[styles.instructionCard, { backgroundColor: colors.card }]}>
              <View style={styles.iconContainer}>
                <ThemedText style={styles.instructionIcon}>
                  {instruction.icon}
                </ThemedText>
              </View>
              <View style={styles.textContainer}>
                <ThemedText style={[styles.instructionTitle, { color: colors.text }]}>
                  {instruction.title}
                </ThemedText>
                <ThemedText style={[styles.instructionDescription, { color: colors.text }]}>
                  {instruction.description}
                </ThemedText>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.tint }]}
          onPress={onStart}
        >
          <ThemedText style={styles.startButtonText}>
            Start Quiz! 🎉
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
  instructionCard: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 15,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  iconContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  instructionIcon: {
    fontSize: 36,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  instructionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  instructionDescription: {
    fontSize: 18,
    lineHeight: 24,
    opacity: 0.9,
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