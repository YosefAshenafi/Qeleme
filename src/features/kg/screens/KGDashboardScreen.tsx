import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, Dimensions, Image, TouchableOpacity, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/core/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/core/providers/AuthProvider';
import { getKGCategories, KGCategory } from '@/shared/services/kgService';
import { IconSymbol } from '@/shared/components/ui/IconSymbol';
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle';
import { KG_DESIGN_TOKENS } from '../constants/DesignTokens';

// New Dashboard Components
import { ExplorerHero } from '../components/dashboard/ExplorerHero';
import { BentoCard } from '../components/dashboard/BentoCard';

export default function KGDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const { user } = useAuth();
  const colors = KG_DESIGN_TOKENS.colors;
  
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
    } finally {
      setLoading(false);
    }
  };

  const getCategoryVariant = (category: KGCategory, index: number): 'large' | 'small' | 'icon' => {
    const name = category.name_en.toLowerCase();
    if (name.includes('animal') || name.includes('math') || category.has_subcategories) return 'large';
    
    // Pattern for others
    const pattern = ['large', 'small', 'small', 'large'];
    return pattern[index % 4] as 'large' | 'small';
  };

  const getCategoryColor = (index: number) => {
    const pattern = [colors.primary, colors.tertiary, colors.secondary, colors.primaryDim];
    return pattern[index % 4];
  };

  const getCategoryIcon = (nameEn: string) => {
    const icons: Record<string, string> = {
      'Domestic Animals': '🐶',
      'Math': '🔢',
      'Household Items': '🏠',
      'Wild Animals': '🦁',
      'Colors': '🎨',
      'Fruits': '🍎',
    };
    return icons[nameEn] || '🌟';
  };

  const handleCategoryPress = (category: KGCategory) => {
    const categoryName = i18n.language === 'am' ? category.name_am : category.name_en;
    if (category.has_subcategories) {
      router.push(`/kg-subcategories?categoryId=${category.id}&categoryName=${categoryName}`);
    } else {
      router.push({
        pathname: '/picture-mcq',
        params: { category: categoryName, categoryId: category.id }
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: '#E8E9EB' }]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.headerRow}>
          <View style={styles.logoGroup}>
             <View style={styles.avatarContainer}>
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBg0ZAn1n0nxTciirKYoUe2garvsBGUu0IVoCopl-_YXoG07vIHpcQ3ALjtra5t4-RbGvby6M2w1JgVN8C6ClWB8qgzJAjhZYjqR-fsqEJZd2xCBojCrc9-oIjpQlsDYkN6SIshzGH8WF-yHPR-SsfYDw_Ob7leVBW-lGeX9a5r8mOKGtnsDl8DsbPbLKXiKYidrtJGdgTL5AjyEEvl0ROelfLxxazAwotu27nEPPEvR-G9KSBLj-zbwBiWecpKA4mVF4o7wXKqP-WL' }}
                  style={styles.avatar}
                />
             </View>
             <Text style={[styles.logoText, { color: colors.primary }]}>M Test</Text>
          </View>
          <View style={styles.headerRight}>
            <LanguageToggle 
              colors={{ 
                card: 'transparent', 
                text: colors.primary,
                tint: colors.primary 
              }} 
            />
            <TouchableOpacity style={[styles.iconButton, { backgroundColor: isDarkMode ? '#333' : colors.surfaceContainerLow }]}>
               <IconSymbol name="bell" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 100 }]}
      >
        <ExplorerHero name={user?.fullName || 'Explorer'} isDarkMode={isDarkMode} />

        <View style={styles.bentoGrid}>
          {loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={styles.loader} />
          ) : error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity onPress={fetchCategories} style={styles.retryBtn}>
                <Text style={styles.retryText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.gridContainer}>
              {categories.map((category, index) => {
                const isMath = category.name_en === 'Math';
                const finalImageUrl = category.image_url || (isMath ? 'https://images.unsplash.com/photo-1596495573175-975a6a4ee05e?auto=format&fit=crop&w=800&q=80' : null);
                
                return (
                  <BentoCard
                    key={category.id}
                    title={i18n.language === 'am' ? category.name_am : category.name_en}
                    subtitle={category.name_en === 'Math' ? '1, 2, 3... Counting is fun!' : 'Start your adventure!'}
                    imageUrl={finalImageUrl}
                    variant={getCategoryVariant(category, index)}
                  backgroundColor={getCategoryColor(index)}
                  icon={getCategoryIcon(category.name_en)}
                  badge={index === 0 ? 'Beginner' : undefined}
                  onPress={() => handleCategoryPress(category)}
                    isDarkMode={isDarkMode}
                  />
                );
              })}
            </View>
          )}
        </View>


      </ScrollView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    zIndex: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(0, 75, 226, 0.2)',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  logoText: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: -1.5,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    flexGrow: 1,
  },
  bentoGrid: {
    paddingHorizontal: 24,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 16,
  },
  loader: {
    marginTop: 40,
  },
  errorBox: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  retryBtn: {
    padding: 10,
    backgroundColor: '#004be2',
    borderRadius: 8,
  },
  retryText: {
    color: 'white',
  },
  watermarkBg: {
    position: 'absolute',
    top: '20%',
    right: '-10%',
    zIndex: -1,
    opacity: 0.03,
  },
  watermarkText: {
    fontSize: 500,
    fontWeight: '900',
    fontFamily: 'System',
  },
});
