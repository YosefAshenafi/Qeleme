import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { useAuth } from '@/contexts/AuthContext';
import { ProfileAvatar } from '@/components/ui/ProfileAvatar';
import { RemoteImage } from '@/components/ui/RemoteImage';
import { getKGCategories, KGCategory } from '@/services/kgService';

// Fallback categories in case API fails
const fallbackCategories = [
  { name: 'Animals' },
  { name: 'Colors' },
  { name: 'Numbers' },
  { name: 'Shapes' },
  { name: 'Fruits' },
  { name: 'Vegetables' },
  { name: 'Family' },
  { name: 'Body Parts' },
  { name: 'Clothes' },
  { name: 'Weather' },
  { name: 'Transport' },
  { name: 'Food' },
  { name: 'School' },
  { name: 'Toys' },
];

// Helper function to get category image
const getCategoryImage = (categoryName: string, imageUrl?: string | null) => {
  // Default Unsplash image for categories without image_url
  const defaultImageUrl = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop&crop=center';
  
  return imageUrl ? { uri: imageUrl } : { uri: defaultImageUrl };
};

// Helper function to get category name based on current language
const getCategoryName = (category: KGCategory, currentLanguage: string) => {
  return currentLanguage === 'am' ? category.name_am : category.name_en;
};

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

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiCategories = await getKGCategories();
      setCategories(apiCategories);
    } catch (err) {
      console.error('Failed to fetch KG categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      // Use fallback categories if API fails
      setCategories(fallbackCategories.map(cat => ({
        id: Math.random(),
        name_en: cat.name,
        name_am: cat.name, // Use English name as fallback for Amharic too
        image_url: null, // No image URL for fallback categories
        has_subcategories: false,
        order_index: Math.random(),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })));
    } finally {
      setLoading(false);
    }
  };

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
          {t('kg.welcome', { name: user?.fullName || '' })}
        </Text>
        <Text style={[styles.subText, { color: colors.text + '80' }]}>
          {t('kg.subtitle')}
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
              {t('common.loading', 'Loading categories...')}
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: colors.text }]}>
              {error}
            </Text>
            <TouchableOpacity
              style={[styles.retryButton, { backgroundColor: colors.tint }]}
              onPress={fetchCategories}
            >
              <Text style={styles.retryButtonText}>
                {t('common.retry', 'Retry')}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          categories.map((category) => {
            const categoryName = getCategoryName(category, i18n.language);
            const image = getCategoryImage(categoryName, category.image_url);
            return (
              <TouchableOpacity
                key={category.id}
                style={[styles.card, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}
                onPress={() => {
                  if (category.has_subcategories) {
                    // Navigate directly to subcategories screen
                    router.push(`/kg-subcategories?categoryId=${category.id}&categoryName=${categoryName}`);
                  } else {
                    // Navigate to instructions screen for categories without subcategories
                    router.push(`/kg-category/instructions?category=${categoryName}&categoryId=${category.id}&hasSubcategories=false`);
                  }
                }}
              >
                <RemoteImage
                  remoteUrl={category.image_url}
                  fallbackSource={{ uri: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop&crop=center' }}
                  style={styles.categoryImage}
                  resizeMode="cover"
                />
                <View style={styles.overlay}>
                  <Text style={styles.cardText}>
                    {t(`kg.categories.${categoryName}`, categoryName)}
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
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  contentHeader: {
    padding: 20,
    alignItems: 'center',
  },
  logoImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
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
  subcategoryIndicator: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 