import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { CategoryImage } from '@/components/ui/CategoryImage';
import { getKGSubcategories, KGSubcategory } from '@/services/kgService';
import { LinearGradient } from 'expo-linear-gradient';
import { imagePreloader } from '@/utils/imagePreloader';
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
} from '@/constants/KGSubcategories';

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
          <Text style={[styles.headerSubtitle, { color: colors.text + '80' }]}>
            {t('kg.subcategories.title', 'Choose your learning path!')}
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
        {/* Welcome Section */}
        <Animated.View style={[styles.welcomeSection, floatingAnimatedStyle]}>
          <LinearGradient
            colors={[colors.tint, colors.tint + 'CC']}
            style={[styles.welcomeGradient, { 
              borderRadius: STYLE_CONFIG.welcome.borderRadius,
              shadowOffset: STYLE_CONFIG.welcome.shadowOffset,
              shadowOpacity: STYLE_CONFIG.welcome.shadowOpacity,
              shadowRadius: STYLE_CONFIG.welcome.shadowRadius,
              elevation: STYLE_CONFIG.welcome.elevation
            }]}
          >
            <View style={styles.welcomeIconContainer}>
              <Text style={styles.welcomeEmoji}>🌟</Text>
            </View>
            <Text style={styles.welcomeTitle}>
              {t('kg.subcategories.welcome', { category: categoryName as string })}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {t('kg.subcategories.subtitle', 'Pick a subcategory and start learning!')}
            </Text>
            <View style={styles.sparklesContainer}>
              <Text style={styles.sparkle}>✨</Text>
              <Text style={styles.sparkle}>⭐</Text>
              <Text style={styles.sparkle}>🎯</Text>
            </View>
          </LinearGradient>
        </Animated.View>

        {/* Subcategories */}
        <Animated.View style={[styles.subcategoriesContainer, cardsAnimatedStyle]}>
          <View style={styles.subcategoriesHeader}>
            <Text style={[styles.subcategoriesTitle, { color: colors.text }]}>
              {t('kg.subcategories.title', 'Choose Your Learning Adventure!')}
            </Text>
            <Text style={[styles.subcategoriesSubtitle, { color: colors.text + '80' }]}>
              {t('kg.categories.subtitle', 'Pick a topic and start your amazing journey!')}
            </Text>
          </View>
          
          <View style={styles.cardsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingEmoji}>🎯</Text>
                <ActivityIndicator size="large" color={colors.tint} />
                <Text style={[styles.loadingText, { color: colors.text }]}>
                  {t('common.loading', 'Loading subcategories...')}
                </Text>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorEmoji}>🤔</Text>
                <IconSymbol name="questionmark.circle.fill" size={48} color={colors.tint} />
                <Text style={[styles.errorText, { color: colors.text }]}>
                  {error}
                </Text>
                <TouchableOpacity
                  style={[styles.retryButton, { backgroundColor: colors.tint }]}
                  onPress={fetchSubcategories}
                >
                  <Text style={styles.retryEmoji}>🔄</Text>
                  <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
                  <Text style={styles.retryButtonText}>
                    {t('common.retry', 'Retry')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              subcategories.map((subcategory, index) => {
                const subcategoryName = getSubcategoryNameByLanguage(subcategory, i18n.language);
                const subcategoryConfig = getSubcategoryConfig(subcategoryName, isDarkMode);
                const imageSource = getSubcategoryImageSource(subcategory.image_url, subcategoryConfig.defaultImageUrl);
                
                return (
                  <TouchableOpacity
                    key={subcategory.id}
                    style={[styles.cardContainer, { 
                      borderRadius: STYLE_CONFIG.card.borderRadius,
                      shadowOffset: STYLE_CONFIG.card.shadowOffset,
                      shadowOpacity: STYLE_CONFIG.card.shadowOpacity,
                      shadowRadius: STYLE_CONFIG.card.shadowRadius,
                      elevation: STYLE_CONFIG.card.elevation
                    }]}
                    onPress={() => {
                      router.push({
                        pathname: '/screens/PictureMCQScreen',
                        params: { 
                          category: categoryName, 
                          categoryId: categoryId,
                          subcategory: subcategoryName, 
                          subcategoryId: subcategory.id,
                          isSubcategory: 'true'
                        }
                      });
                    }}
                  >
                    <LinearGradient
                      colors={subcategoryConfig.colors}
                      style={[styles.cardGradient, { borderRadius: STYLE_CONFIG.card.borderRadius }]}
                    >
                      <View style={[styles.cardContent, { aspectRatio: STYLE_CONFIG.card.aspectRatio }]}>
                        <View style={styles.cardEmojiContainer}>
                          <Text style={styles.cardEmoji}>{subcategoryConfig.emoji}</Text>
                        </View>
                        <CategoryImage
                          imageUrl={subcategory.image_url}
                          fallbackUrl={DEFAULT_SUBCATEGORY_IMAGE_URL}
                          style={styles.subcategoryImage}
                          cacheKey={`subcategory_${subcategory.id}`}
                          preset="subcategory"
                        />
                        <View style={[styles.cardOverlay, { borderBottomLeftRadius: STYLE_CONFIG.card.borderRadius, borderBottomRightRadius: STYLE_CONFIG.card.borderRadius }]}>
                          <Text style={styles.cardText}>
                            {t(`kg.subcategories.${subcategoryName}`, subcategoryName)}
                          </Text>
                        </View>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  headerCenter: {
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
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeGradient: {
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
  },
  welcomeIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
  },
  subcategoriesContainer: {
    flex: 1,
  },
  subcategoriesHeader: {
    padding: 20,
  },
  subcategoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  subcategoriesSubtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  cardsContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: '48%',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
  },
  cardGradient: {
    overflow: 'hidden',
  },
  cardContent: {
    position: 'relative',
  },
  subcategoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  cardOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
    letterSpacing: 0.5,
    lineHeight: 24,
  },
  playIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryEmoji: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  welcomeEmoji: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  loadingEmoji: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  errorEmoji: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  playEmoji: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  cardEmojiContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardEmoji: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sparkle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  sparklesContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  subcategoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  subcategoryBadgeEmoji: {
    fontSize: 16,
  },
}); 