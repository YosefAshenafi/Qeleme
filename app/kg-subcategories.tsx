import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { getKGSubcategories, KGSubcategory } from '@/services/kgService';

// Fallback subcategories in case API fails
const fallbackSubcategories = [
  { name: '1-10 Numbers' },
  { name: '11-20 Numbers' },
  { name: '1-10 Counting' },
  { name: '11-20 Counting' },
  { name: 'Fill in the Blanks' },
  { name: 'Middle Number 1-10' },
  { name: 'Middle Number 11-20' },
];

// Mock subcategories for Maths (temporary until backend is fixed)
const mockMathsSubcategories = [
  {
    id: 1,
    category_id: 1,
    name_en: 'Numbers 1-10',
    name_am: 'ቁጥሮች 1-10',
    description: 'Learn to count from 1 to 10',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    order_index: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 2,
    category_id: 1,
    name_en: 'Numbers 11-20',
    name_am: 'ቁጥሮች 11-20',
    description: 'Learn to count from 11 to 20',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    order_index: 2,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 3,
    category_id: 1,
    name_en: 'Addition',
    name_am: 'መደመር',
    description: 'Learn basic addition',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    order_index: 3,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 4,
    category_id: 1,
    name_en: 'Subtraction',
    name_am: 'መቀነስ',
    description: 'Learn basic subtraction',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop',
    order_index: 4,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];



// Helper function to get subcategory name based on current language
const getSubcategoryName = (subcategory: KGSubcategory, currentLanguage: string) => {
  return currentLanguage === 'am' ? subcategory.name_am : subcategory.name_en;
};

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

  useEffect(() => {
    if (categoryId) {
      fetchSubcategories();
    }
  }, [categoryId]);

  const fetchSubcategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getKGSubcategories(Number(categoryId));
      setCategoryData(result.category);
      
      // If API returns empty array but this is Maths category, use mock data
      if (result.subcategories.length === 0 && Number(categoryId) === 1) {
        console.log('Using mock subcategories for Maths category');
        setSubcategories(mockMathsSubcategories);
      } else {
        setSubcategories(result.subcategories);
      }
    } catch (err) {
      console.error('Failed to fetch KG subcategories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load subcategories');
      
      // If this is Maths category, use mock data instead of fallback
      if (Number(categoryId) === 1) {
        console.log('Using mock subcategories for Maths category (API failed)');
        setSubcategories(mockMathsSubcategories);
        setError(null); // Clear error since we have mock data
      } else {
        // Use fallback subcategories for other categories
        setSubcategories(fallbackSubcategories.map(sub => ({
          id: Math.random(),
          category_id: Number(categoryId),
          name_en: sub.name,
          name_am: sub.name, // Use English name as fallback for Amharic too
          description: `Learn ${sub.name.toLowerCase()}`,
          image_url: null, // No image URL for fallback subcategories
          order_index: Math.random(),
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubcategoryPress = (subcategory: KGSubcategory) => {
    const subcategoryName = getSubcategoryName(subcategory, i18n.language);
    router.push(`/kg-category/instructions?category=${subcategoryName}&subcategoryId=${subcategory.id}&hasSubcategories=false`);
  };

  const handleBackPress = () => {
    router.back();
  };

  const displayCategoryName = categoryData 
    ? (i18n.language === 'am' ? categoryData.name_am : categoryData.name_en)
    : (categoryName as string || 'Category');

  return (
    <View style={[
      styles.container, 
      { 
        paddingTop: insets.top,
        backgroundColor: isDarkMode ? '#000000' : colors.background
      }
    ]}>
      <View style={[
        styles.header, 
        { backgroundColor: isDarkMode ? '#000000' : colors.background }
      ]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <IconSymbol name="chevron.left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {displayCategoryName}
        </Text>
        <View style={styles.headerRight}>
          <LanguageToggle colors={colors} />
          <ProfileAvatar colors={colors} />
        </View>
      </View>

      <View style={[
        styles.contentHeader, 
        { backgroundColor: isDarkMode ? '#000000' : colors.background }
      ]}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          {t('kg.subcategories.welcome', { category: displayCategoryName })}
        </Text>
        <Text style={[styles.subText, { color: colors.text + '80' }]}>
          {t('kg.subcategories.subtitle', 'Choose a topic to start learning')}
        </Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.tint} />
            <Text style={[styles.loadingText, { color: colors.text }]}>
              {t('common.loading', 'Loading subcategories...')}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
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
        ) : subcategories.length === 0 ? (
          <View style={styles.emptyContainer}>
            <IconSymbol name="rectangle.stack" size={64} color={colors.text + '40'} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t('kg.subcategories.empty.title', 'No Subcategories Available')}
            </Text>
            <Text style={[styles.emptyDescription, { color: colors.text + '80' }]}>
              {t('kg.subcategories.empty.description', 'Subcategories for this topic are not available yet. Please check back later.')}
            </Text>
            <TouchableOpacity
              style={[styles.backToCategoriesButton, { backgroundColor: colors.tint }]}
              onPress={handleBackPress}
            >
              <Text style={styles.backToCategoriesButtonText}>
                {t('kg.subcategories.empty.backToCategories', 'Back to Categories')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          subcategories.map((subcategory) => {
            const subcategoryName = getSubcategoryName(subcategory, i18n.language);
            return (
              <TouchableOpacity
                key={subcategory.id}
                style={[styles.card, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}
                onPress={() => handleSubcategoryPress(subcategory)}
              >
                <RemoteImage
                  remoteUrl={subcategory.image_url}
                  fallbackSource={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=center' }}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
                <View style={styles.overlay}>
                  <Text style={styles.cardText}>
                    {t(`kg.subcategories.${subcategoryName}`, subcategoryName)}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
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
    flex: 1,
    textAlign: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentHeader: {
    padding: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subText: {
    fontSize: 16,
    textAlign: 'center',
  },
  cardsContainer: {
    padding: 16,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
    marginBottom: 20,
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  backToCategoriesButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backToCategoriesButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 