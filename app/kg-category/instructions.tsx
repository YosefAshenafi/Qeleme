import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Header } from '@/components/Header';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { useTranslation } from 'react-i18next';
import { useRouter, useLocalSearchParams } from 'expo-router';

const { width } = Dimensions.get('window');

export default function KGCategoryInstructions() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();
  const { category } = useLocalSearchParams();

  const handleStart = () => {
    // Since this screen is only used for categories without subcategories,
    // always navigate directly to MCQ screen
    router.push({
      pathname: '/screens/PictureMCQScreen',
      params: { category }
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <IconSymbol name="chevron.left.forwardslash.chevron.right" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>
            {t(`kg.categories.${category}`, category as string)}
          </ThemedText>
          <View style={styles.headerRight}>
            <LanguageToggle colors={colors} />
            <TouchableOpacity 
              onPress={() => router.push('/profile')}
              style={[styles.profileIconContainer, { backgroundColor: colors.tint + '20' }]}
            >
              <IconSymbol name="person.fill" size={24} color={colors.tint} />
            </TouchableOpacity>
          </View>
        </View>

        <LinearGradient
          colors={[colors.tint, colors.tint + 'CC']}
          style={styles.headerGradient}
        >
          <View style={styles.iconContainer}>
            <IconSymbol 
              name="house.fill" 
              size={40} 
              color="#FFFFFF" 
            />
          </View>
          <ThemedText style={styles.subtitleText}>
            {t('kg.instructions.subtitle', "Let's learn something new!")}
          </ThemedText>
        </LinearGradient>

        <View style={styles.instructionsContainer}>
          <View style={[styles.instructionItem, { backgroundColor: colors.tint + '15' }]}>
            <View style={styles.instructionIcon}>
              <IconSymbol name="photo" size={24} color={colors.tint} />
            </View>
            <View style={styles.instructionContent}>
              <ThemedText style={styles.instructionTitle}>
                {t('kg.instructions.look.title', 'Look Carefully')}
              </ThemedText>
              <ThemedText style={styles.instructionDescription}>
                {t('kg.instructions.look.description', 'Take your time to look at the pictures and understand what they show.')}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.instructionItem, { backgroundColor: colors.tint + '15' }]}>
            <View style={styles.instructionIcon}>
              <IconSymbol name="checkmark.circle.fill" size={24} color={colors.tint} />
            </View>
            <View style={styles.instructionContent}>
              <ThemedText style={styles.instructionTitle}>
                {t('kg.instructions.choose.title', 'Choose Wisely')}
              </ThemedText>
              <ThemedText style={styles.instructionDescription}>
                {t('kg.instructions.choose.description', 'Select the correct answer from the options given.')}
              </ThemedText>
            </View>
          </View>

          <View style={[styles.instructionItem, { backgroundColor: colors.tint + '15' }]}>
            <View style={styles.instructionIcon}>
              <IconSymbol name="message.fill" size={24} color={colors.tint} />
            </View>
            <View style={styles.instructionContent}>
              <ThemedText style={styles.instructionTitle}>
                {t('kg.instructions.haveFun.title', 'Have Fun!')}
              </ThemedText>
              <ThemedText style={styles.instructionDescription}>
                {t('kg.instructions.haveFun.description', 'Learning is fun! Enjoy the process and celebrate your progress.')}
              </ThemedText>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: colors.tint }]}
          onPress={handleStart}
        >
          <IconSymbol name="paperplane.fill" size={24} color="#FFFFFF" style={styles.startButtonIcon} />
          <ThemedText style={styles.startButtonText}>
            {t('kg.instructions.start', 'Start Learning')}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'transparent',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  headerGradient: {
    padding: 20,
    paddingTop: 10,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
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
    flexDirection: 'row',
    marginBottom: 25,
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  instructionDescription: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  startButton: {
    flexDirection: 'row',
    margin: 15,
    padding: 18,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  startButtonIcon: {
    marginRight: 8,
  },
  startButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
});

const getCategoryIcon = (category: string): string => {
  const categoryIcons: { [key: string]: string } = {
    'Animals': 'paw',
    'Colors': 'color-palette',
    'Numbers': 'calculator',
    'Shapes': 'apps',
    'Fruits': 'nutrition',
    'Vegetables': 'leaf',
    'Family': 'people',
    'Body Parts': 'body',
    'Clothes': 'shirt',
    'Weather': 'cloud',
    'Transport': 'car',
    'Food': 'fast-food',
    'School': 'school',
    'Toys': 'game-controller'
  };
  return categoryIcons[category] || 'house.fill';
}; 