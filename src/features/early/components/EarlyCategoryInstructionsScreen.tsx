import React from 'react';
import { TouchableOpacity, ScrollView, View, Dimensions, Text, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { ThemedText } from '@/features/common/components/ThemedText';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
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
import { EarlyCategoryInstructionsScreenStyles as styles } from './EarlyCategoryInstructionsScreen.styles';

const { width } = Dimensions.get('window');

export default function EarlyCategoryInstructions() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();
  const { category, categoryId, subcategory, subcategoryId, hasSubcategories } = useLocalSearchParams();

  
  const headerScale = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(50);
  const floatingAnimation = useSharedValue(0);
  const instructionScale = useSharedValue(0);

  React.useEffect(() => {
    
    headerScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    contentOpacity.value = withTiming(1, { duration: 800 });
    contentTranslateY.value = withSpring(0, { damping: 15, stiffness: 100 });
    
    
    floatingAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0, { duration: 2000 })
      ),
      -1,
      true
    );

    
    setTimeout(() => {
      instructionScale.value = withSpring(1, { damping: 15, stiffness: 100 });
    }, 300);
  }, []);

  const handleStart = () => {
    
    if (hasSubcategories === 'true' && subcategoryId) {
      
      router.push({
        pathname: '/early-picture',
        params: { 
          category, 
          categoryId, 
          subcategory, 
          subcategoryId,
          isSubcategory: 'true'
        }
      });
    } else {
      
      router.push({
        pathname: '/early-picture',
        params: { category, categoryId }
      });
    }
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
        
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.tint + '20' }]}
            onPress={() => router.back()}
          >
            <Text style={styles.backEmoji}>⬅️</Text>
          </TouchableOpacity>
          <Image
            source={require('@/assets/images/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={styles.headerTextContainer}>
            <ThemedText style={styles.headerTitle}>
              {hasSubcategories === 'true' && subcategory 
                ? t(`kg.subcategories.${subcategory}`, subcategory as string)
                : t(`kg.categories.${category}`, category as string)
              } 📚
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

        
        <Animated.View style={[styles.instructionsContainer, instructionAnimatedStyle]}>
          <ThemedText style={[styles.instructionsTitle, { color: colors.text }]}>
            🎮 {t('kg.howToPlay')} 🎮
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
