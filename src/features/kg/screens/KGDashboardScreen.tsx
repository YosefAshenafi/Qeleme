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
            <Image
              source={require('../../../../assets/images/logo.png')}
              style={styles.logoImage}
            />
          </View>
          <View style={styles.headerRight}>
            <LanguageToggle
              colors={{
                card: 'transparent',
                text: colors.primary,
                tint: colors.primary
              }}
            />
          </View>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 20 }]}
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
                const isMath = category.name_en === 'Maths';

                return (
                  <BentoCard
                    key={category.id}
                    title={i18n.language === 'am' ? category.name_am : category.name_en}
                    subtitle={category.name_en === 'Math' ? '1, 2, 3... Counting is fun!' : 'Start your adventure!'}
                    imageUrl={isMath ? 'https://kgimages.blr1.cdn.digitaloceanspaces.com/Cover%20Pages/kg/maths.png' : category.image_url}
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
    paddingLeft: 0,
    paddingRight: 24,
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
  logoImage: {
    width: 120,
    height: 40,
    resizeMode: 'contain',
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
