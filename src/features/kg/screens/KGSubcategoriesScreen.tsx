import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/shared/constants/Colors';
import { KG_DESIGN_TOKENS } from '../constants/DesignTokens';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle';
import { IconSymbol } from '@/shared/components/ui/IconSymbol';
import { BentoCard } from '../components/dashboard/BentoCard';
import { useAuth } from '@/core/providers/AuthProvider';
import { ProfileAvatar } from '@/shared/components/ui/ProfileAvatar';
import { CategoryImage } from '@/shared/components/ui/CategoryImage';
import { getKGSubcategories, KGSubcategory } from '@/shared/services/kgService';
import { LinearGradient } from 'expo-linear-gradient';
import { imagePreloader } from '@/shared/utils/imagePreloader';
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
import { 
  getSubcategoryConfig, 
  getSubcategoryImageSource, 
  getSubcategoryNameByLanguage,
  ANIMATION_CONFIG,
  STYLE_CONFIG,
  DEFAULT_SUBCATEGORY_IMAGE_URL
} from '@/shared/constants/KGSubcategories';
import { KGSubcategoriesScreenStyles as styles } from './KGSubcategoriesScreen.styles';

const { width } = Dimensions.get('window');



export default function KGSubcategoriesScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { categoryId, categoryName } = useLocalSearchParams();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  const [subcategories, setSubcategories] = useState<KGSubcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryData, setCategoryData] = useState<any>(null);

  // Animation values
  const headerScale = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);
  const cardsTranslateY = useSharedValue(50);
  const floatingAnimation = useSharedValue(0);

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories();
    }
    
    // Start animations using configuration
    headerScale.value = withSpring(1, ANIMATION_CONFIG.header);
    cardsOpacity.value = withTiming(1, ANIMATION_CONFIG.cards.timing);
    cardsTranslateY.value = withSpring(0, ANIMATION_CONFIG.cards.spring);
    
    // Floating animation
    floatingAnimation.value = withRepeat(
      withSequence(
        withTiming(1, { duration: ANIMATION_CONFIG.floating.duration }),
        withTiming(0, { duration: ANIMATION_CONFIG.floating.duration })
      ),
      -1,
      true
    );
  }, [categoryId]);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getKGSubcategories(Number(categoryId));
      setCategoryData(result.category);
      setSubcategories(result.subcategories);
      
      // Temporarily disable preloading to fix image loading issues
      // const imageUrls = result.subcategories
      //   .map(subcategory => subcategory.image_url)
      //   .filter(url => url) as string[];
      
      // if (imageUrls.length > 0) {
      //   // Preload images with different priorities
      //   const visibleImages = imageUrls.slice(0, 6); // First 6 images get high priority
      //   const remainingImages = imageUrls.slice(6);
      
      //   if (visibleImages.length > 0) {
      //     imagePreloader.preloadImages(visibleImages, 'high');
      //   }
      
      //   if (remainingImages.length > 0) {
      //     imagePreloader.preloadImages(remainingImages, 'low');
      //   }
      // }
    } catch (err) {
      console.error('Failed to fetch KG subcategories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subcategories');
      // Don't set fallback subcategories - let the error state handle it
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryPress = (subcategory: KGSubcategory) => {
    const subcategoryName = getSubcategoryNameByLanguage(subcategory, i18n.language);
    router.push(`/kg-category/instructions?category=${subcategoryName}&subcategoryId=${subcategory.id}&hasSubcategories=false`);
  };

  const handleBackPress = () => {
    router.back();
  };

  const displayCategoryName = categoryData 
    ? (i18n.language === 'am' ? categoryData.name_am : categoryData.name_en)
    : (categoryName as string || 'Category');

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: headerScale.value }],
    };
  });

  const cardsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: cardsOpacity.value,
      transform: [{ translateY: cardsTranslateY.value }],
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

  return (
    <View style={[
      styles.container, 
      { 
        paddingTop: insets.top,
        backgroundColor: colors.background
      }
    ]}>
      {/* Header */}
      <Animated.View style={[
        styles.header, 
        { backgroundColor: colors.background },
        headerAnimatedStyle
      ]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            {categoryName}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <LanguageToggle colors={colors} />
        </View>
      </Animated.View>

      {/* Scrollable Content */}
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          <View style={styles.bentoGridContainer}>
            {loading ? (
              <ActivityIndicator size="large" color={colors.tint} />
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorEmoji}>🤔</Text>
                <Text style={[styles.errorText, { color: colors.text }]}>
                  {error}
                </Text>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: colors.tint }]}
                  onPress={fetchSubcategories}
                >
                  <Text style={styles.retryButtonText}>
                    {t('common.retry', 'Retry')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                {subcategories.map((subcategory, index) => {
                  const subcategoryName = getSubcategoryNameByLanguage(subcategory, i18n.language);
                  
                  return (
                    <BentoCard
                      key={subcategory.id}
                      title={subcategoryName}
                      subtitle="Start learning!"
                      imageUrl={subcategory.image_url}
                      variant="large"
                      backgroundColor={KG_DESIGN_TOKENS.colors.primary}
                      icon="🌟"
                      onPress={() => {
                        router.push({
                          pathname: '/picture-mcq',
                          params: { 
                            category: categoryName, 
                            categoryId: categoryId,
                            subcategory: subcategoryName, 
                            subcategoryId: subcategory.id,
                            isSubcategory: 'true'
                          }
                        });
                      }}
                      isDarkMode={isDarkMode}
                    />
                  );
                })}
              </>
            )}
          </View>
      </ScrollView>
    </View>
  );
}

 
