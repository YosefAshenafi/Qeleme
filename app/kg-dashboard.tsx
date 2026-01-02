import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, Dimensions, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { CategoryImage } from '@/components/ui/CategoryImage';
import { GradeBadge } from '@/components/ui/GradeBadge';
import { getKGCategories, KGCategory } from '@/services/kgService';
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
  getCategoryConfig, 
  getCategoryImageSource, 
  getCategoryNameByLanguage,
  ANIMATION_CONFIG,
  STYLE_CONFIG,
  DEFAULT_CATEGORY_IMAGE_URL
} from '@/constants/KGCategories';

const { width } = Dimensions.get('window');

export default function KGDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  
  const [categories, setCategories] = useState<KGCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Animation values
  const headerScale = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);
  const cardsTranslateY = useSharedValue(50);
  const floatingAnimation = useSharedValue(0);

  useEffect(() => {
    fetchCategories();
    
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
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiCategories = await getKGCategories();
      setCategories(apiCategories);
      
      // Temporarily disable preloading to fix image loading issues
      // const imageUrls = apiCategories
      //   .map(category => category.image_url)
      //   .filter(url => url) as string[];
      
      // if (imageUrls.length > 0) {
      //   // Preload images with different priorities
      //   const visibleImages = imageUrls.slice(0, 4); // First 4 images get high priority
      //   const remainingImages = imageUrls.slice(4);
      
      //   if (visibleImages.length > 0) {
      //     imagePreloader.preloadImages(visibleImages, 'high');
      //   }
      
      //   if (remainingImages.length > 0) {
      //     imagePreloader.preloadImages(remainingImages, 'low');
      //   }
      // }
    } catch (err) {
      console.error('Failed to fetch KG categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

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
        <View style={styles.headerLeft}>
          <Image
            source={isDarkMode 
              ? require('@/assets/images/logo/white-logo.png')
              : require('@/assets/images/logo/theme-logo.png')
            }
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={[styles.logoText, { color: isDarkMode ? '#FFFFFF' : colors.tint }]}>
            Qelem
          </Text>
        </View>
        <View style={styles.headerCenter}>
          <View style={[styles.gradeBadge, { 
            backgroundColor: colors.tint + '20',
            borderColor: colors.tint + '40'
          }]}>
            <Text style={styles.gradeIcon}>🎓</Text>
            <Text style={[styles.gradeText, { color: isDarkMode ? '#FFFFFF' : colors.tint }]}>
              {user?.grade ? (user.grade.toLowerCase() === 'kg' ? t('common.kindergarten') : `Grade ${user.grade.replace('grade ', '')}`) : t('common.kindergarten')}
            </Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <LanguageToggle 
            colors={{ 
              card: 'transparent', 
              text: isDarkMode ? '#FFFFFF' : colors.tint,
              tint: colors.tint 
            }} 
          />
          <TouchableOpacity 
            onPress={() => router.push('/profile')}
            style={[
              styles.settingsButton,
              { backgroundColor: colors.tint + '20' }
            ]}
          >
            <IconSymbol name="gearshape.fill" size={24} color={isDarkMode ? '#FFFFFF' : colors.tint} />
          </TouchableOpacity>
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
              {t('kg.welcome', { name: user?.fullName || '' })}
            </Text>
            <Text style={styles.welcomeSubtitle}>
              {t('kg.subtitle')} {t('kg.letsHaveFun', 'Let\'s have fun learning!')}
            </Text>
          </LinearGradient>
        </Animated.View>

        {/* Categories */}
        <Animated.View style={[styles.categoriesContainer, cardsAnimatedStyle]}>
          <View style={styles.categoriesHeader}>
            <Text style={[styles.categoriesTitle, { color: colors.text }]}>
              {t('kg.categories.title', 'Choose Your Learning Adventure!')}
            </Text>
            <Text style={[styles.categoriesSubtitle, { color: colors.text + '80' }]}>
              {t('kg.categories.subtitle', 'Pick a topic and start your amazing journey!')}
            </Text>
          </View>
          
          <View style={styles.cardsContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingEmoji}>🎯</Text>
                <ActivityIndicator size="large" color={colors.tint} />
                <Text style={[styles.loadingText, { color: colors.text }]}>
                  {t('common.loading', 'Loading categories...')}
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
                  onPress={fetchCategories}
                >
                  <Text style={styles.retryEmoji}>🔄</Text>
                  <IconSymbol name="chevron.right" size={20} color="#FFFFFF" />
                  <Text style={styles.retryButtonText}>
                    {t('common.retry', 'Retry')}
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              categories.map((category, index) => {
                const categoryName = getCategoryNameByLanguage(category, i18n.language);
                const categoryConfig = getCategoryConfig(category.name_en, isDarkMode);
                const imageSource = getCategoryImageSource(category.image_url, categoryConfig.defaultImageUrl);
                
                return (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.cardContainer, { 
                      borderRadius: STYLE_CONFIG.card.borderRadius,
                      shadowOffset: STYLE_CONFIG.card.shadowOffset,
                      shadowOpacity: STYLE_CONFIG.card.shadowOpacity,
                      shadowRadius: STYLE_CONFIG.card.shadowRadius,
                      elevation: STYLE_CONFIG.card.elevation
                    }]}
                    onPress={() => {
                      if (category.has_subcategories) {
                        router.push(`/kg-subcategories?categoryId=${category.id}&categoryName=${categoryName}`);
                      } else {
                        router.push({
                          pathname: '/screens/PictureMCQScreen',
                          params: { category: categoryName, categoryId: category.id }
                        });
                      }
                    }}
                  >
                    <LinearGradient
                      colors={categoryConfig.colors}
                      style={[styles.cardGradient, { borderRadius: STYLE_CONFIG.card.borderRadius }]}
                    >
                      <View style={[styles.cardContent, { aspectRatio: STYLE_CONFIG.card.aspectRatio }]}>
                        <View style={styles.cardEmojiContainer}>
                          <Text style={styles.cardEmoji}>{categoryConfig.emoji}</Text>
                        </View>
                        <CategoryImage
                          imageUrl={category.image_url}
                          fallbackUrl={DEFAULT_CATEGORY_IMAGE_URL}
                          style={styles.categoryImage}
                          cacheKey={`category_${category.id}`}
                          preset="category"
                        />
                        <View style={[styles.cardOverlay, { borderBottomLeftRadius: STYLE_CONFIG.card.borderRadius, borderBottomRightRadius: STYLE_CONFIG.card.borderRadius }]}>
                          <Text style={styles.cardText}>
                            {t(`kg.categories.${categoryName}`, categoryName)}
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 20,
    minHeight: 60,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  headerCenter: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0,
  },
  gradeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gradeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  gradeText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    gap: 8,
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 32,
    height: 32,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
  welcomeSection: {
    paddingTop: 20,
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
    fontSize: 24,
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
  categoriesContainer: {
    flex: 1,
  },
  categoriesHeader: {
    padding: 20,
  },
  categoriesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  categoriesSubtitle: {
    fontSize: 16,
    textAlign: 'center',
    opacity: 0.8,
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
  categoryImage: {
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
  subcategoryIndicator: {
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
  loadingEmoji: {
    fontSize: 48,
    marginBottom: 16,
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
  errorEmoji: {
    fontSize: 48,
    marginBottom: 16,
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
  retryEmoji: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  welcomeEmoji: {
    fontSize: 48,
  },
  cardEmojiContainer: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  cardEmoji: {
    fontSize: 20,
  },
  playEmoji: {
    fontSize: 16,
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
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
  categoryBadgeEmoji: {
    fontSize: 18,
  },
}); 