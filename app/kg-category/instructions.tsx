import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Dimensions, Text } from 'react-native';
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
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withRepeat,
  withSequence,
  withTiming,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function KGCategoryInstructions() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();
  const { category, categoryId } = useLocalSearchParams();

  // Animation values
  const headerScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  const floatingAnimation = useSharedValue(0);
  const instructionScale = useSharedValue(0);

  React.useEffect(() => {
    // Start animations
    headerScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    contentOpacity.value = withTiming(1, { duration: 800 });
    contentTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    
    // Floating animation
    floatingAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );

    // Instruction animations with delay
    setTimeout(() => {
      instructionScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    }, 300);
  }, []);

  const handleStart = () => {
    // Since this screen is only used for categories without subcategories,
    // always navigate directly to MCQ screen
    router.push({
      pathname: '/screens/PictureMCQScreen',
      params: { category, categoryId }
    });
  };

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: headerScale.value }],
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
      transform: [{ translateY: contentTranslateY.value }],
    };
  });

  const floatingAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      floatingAnimation.value,
      [0, 1],
      [0, -10],
      Extrapolate.CLAMP
    );
    
    return {
      transform: [{ translateY }],
    };
  });

  const instructionAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: instructionScale.value }],
    };
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDarkMode ? '#000000' : '#F8F9FA' }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.tint + '20' }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backEmoji}>⬅️</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <ThemedText style={styles.headerTitle}>
              {t(`kg.categories.${category}`, category as string)} 📚
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              {t('kg.instructions.subtitle', "Let's learn something new!")} ✨
            </ThemedText>
          </View>
          <View style={styles.headerRight}>
            <LanguageToggle colors={colors} />
            <TouchableOpacity 
              onPress={() => router.push('/profile')}
              style={[styles.profileIconContainer, { backgroundColor: colors.tint + '20' }]}
            >
              <IconSymbol name="person.fill" size={24} color={colors.tint} />
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Welcome Section */}
        <Animated.View style={[styles.welcomeSection, floatingAnimatedStyle, contentAnimatedStyle]}>
          <LinearGradient
            colors={[colors.tint, colors.tint + 'CC']}
            style={styles.welcomeGradient}
          >
            <View style={styles.welcomeIconContainer}>
              <Text style={styles.welcomeEmoji}>🎯</Text>
            </View>
            <ThemedText style={styles.welcomeTitle}>
              {t('kg.instructions.subtitle', "Let's learn something new!")} 🎉
            </ThemedText>
            <ThemedText style={styles.welcomeSubtitle}>
              {t('kg.instructions.getReady', 'Get ready for an exciting learning adventure!')} 🚀
            </ThemedText>
            <View style={styles.sparklesContainer}>
              <Text style={styles.sparkle}>✨</Text>
              <Text style={styles.sparkle}>🎨</Text>
              <Text style={styles.sparkle}>🎯</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Instructions */}
        <Animated.View style={[styles.instructionsContainer, instructionAnimatedStyle]}>
          <ThemedText style={[styles.instructionsTitle, { color: colors.text }]}>
            🎮 {t('kg.instructions.howToPlay', 'How to Play')} 🎮
          </ThemedText>
          
          <View style={[styles.instructionItem, { backgroundColor: colors.tint + '15' }]}>
            <View style={[styles.instructionIcon, { backgroundColor: colors.tint + '30' }]}>
              <Text style={styles.instructionEmoji}>👀</Text>
            </View>
            <View style={styles.instructionContent}>
              <ThemedText style={[styles.instructionTitle, { color: colors.text }]}>
                {t('kg.instructions.look.title', 'Look Carefully')} 👁️
              </ThemedText>
              <ThemedText style={[styles.instructionDescription, { color: colors.text + 'CC' }]}>
                {t('kg.instructions.look.description', 'Take your time to look at the pictures and understand what they show.')} 🔍
              </ThemedText>
            </View>
          </View>

          <View style={[styles.instructionItem, { backgroundColor: colors.tint + '15' }]}>
            <View style={[styles.instructionIcon, { backgroundColor: colors.tint + '30' }]}>
              <Text style={styles.instructionEmoji}>✅</Text>
            </View>
            <View style={styles.instructionContent}>
              <ThemedText style={[styles.instructionTitle, { color: colors.text }]}>
                {t('kg.instructions.choose.title', 'Choose Wisely')} 🎯
              </ThemedText>
              <ThemedText style={[styles.instructionDescription, { color: colors.text + 'CC' }]}>
                {t('kg.instructions.choose.description', 'Select the correct answer from the options given.')} 🎲
              </ThemedText>
            </View>
          </View>

          <View style={[styles.instructionItem, { backgroundColor: colors.tint + '15' }]}>
            <View style={[styles.instructionIcon, { backgroundColor: colors.tint + '30' }]}>
              <Text style={styles.instructionEmoji}>🎉</Text>
            </View>
            <View style={styles.instructionContent}>
              <ThemedText style={[styles.instructionTitle, { color: colors.text }]}>
                {t('kg.instructions.haveFun.title', 'Have Fun!')} 😊
              </ThemedText>
              <ThemedText style={[styles.instructionDescription, { color: colors.text + 'CC' }]}>
                {t('kg.instructions.haveFun.description', 'Learning is fun! Enjoy the process and celebrate your progress.')} 🌟
              </ThemedText>
            </View>
          </View>
        </Animated.View>

        {/* Start Button */}
        <Animated.View style={[styles.startButtonContainer, contentAnimatedStyle]}>
          <TouchableOpacity
            style={[styles.startButton, { backgroundColor: colors.tint }]}
            onPress={handleStart}
          >
            <LinearGradient
              colors={[colors.tint, colors.tint + 'DD']}
              style={styles.startButtonGradient}
            >
              <Text style={styles.startEmoji}>🚀</Text>
              <IconSymbol name="paperplane.fill" size={24} color="#FFFFFF" style={styles.startButtonIcon} />
              <ThemedText style={styles.startButtonText}>
                {t('kg.instructions.start', 'Start Learning')} 🎯
              </ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
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
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  welcomeGradient: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  welcomeIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  instructionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  instructionsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  instructionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  instructionContent: {
    flex: 1,
  },
  instructionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  instructionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  startButtonContainer: {
    paddingHorizontal: 20,
  },
  startButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  startButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  startButtonIcon: {
    marginRight: 12,
  },
  startButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  backEmoji: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  welcomeEmoji: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  sparkle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  sparklesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  startEmoji: {
    fontSize: 40,
    fontWeight: 'bold',
  },
  instructionEmoji: {
    fontSize: 24,
    fontWeight: 'bold',
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