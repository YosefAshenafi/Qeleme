import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { KG_DESIGN_TOKENS } from '../constants/DesignTokens';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { BentoCard } from '../components/dashboard/BentoCard';
import { useAuth } from '@/core/providers/AuthProvider';
import { getKGSubcategories, KGSubcategory } from '@/features/common/services/earlyService';
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
  getSubcategoryNameByLanguage,
  ANIMATION_CONFIG
} from '@/features/common/constants/EarlySubcategories';
import { EarlySubcategoriesScreenStyles as styles } from './EarlySubcategoriesScreen.styles';

export default function EarlySubcategoriesScreen() {
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

  
  const headerScale = useSharedValue(0);
  const cardsOpacity = useSharedValue(0);
  const cardsTranslateY = useSharedValue(50);
  const floatingAnimation = useSharedValue(0);

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories();
    }
    
    
    headerScale.value = withSpring(1, ANIMATION_CONFIG.header);
    cardsOpacity.value = withTiming(1, ANIMATION_CONFIG.cards.timing);
    cardsTranslateY.value = withSpring(0, ANIMATION_CONFIG.cards.spring);
    
    
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load subcategories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryPress = (subcategory: KGSubcategory) => {
    const subcategoryName = getSubcategoryNameByLanguage(subcategory, i18n.language);
    router.push(`/early-category/instructions?category=${subcategoryName}&subcategoryId=${subcategory.id}&hasSubcategories=false` as any);
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
                          pathname: '/early-picture',
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

 
