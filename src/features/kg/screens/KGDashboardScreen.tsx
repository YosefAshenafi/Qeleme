import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Dimensions, Image, TouchableOpacity, StatusBar, Modal } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/core/providers/ThemeProvider';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/core/providers/AuthProvider';
import { getKGCategories, KGCategory } from '@/shared/services/kgService';
import { IconSymbol } from '@/shared/components/ui/IconSymbol';
import { LanguageToggle } from '@/shared/components/ui/LanguageToggle';
import { KG_DESIGN_TOKENS } from '../constants/DesignTokens';
import { KGDashboardScreenStyles as styles } from './KGDashboardScreen.styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import i18n from 'i18next';

// New Dashboard Components
import { ExplorerHero } from '../components/dashboard/ExplorerHero';
import { BentoCard } from '../components/dashboard/BentoCard';

export default function KGDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const { i18n } = useTranslation();
  const { user, logout } = useAuth();
  const colors = KG_DESIGN_TOKENS.colors;

  const [categories, setCategories] = useState<KGCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoAdvanceDelay, setAutoAdvanceDelay] = useState(2000);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('kgQuizSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSoundEnabled(parsed.soundEnabled ?? true);
        setAutoAdvanceDelay(parsed.autoAdvanceDelay ?? 2000);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSoundEnabled: boolean, newDelay: number) => {
    try {
      await AsyncStorage.setItem('kgQuizSettings', JSON.stringify({
        soundEnabled: newSoundEnabled,
        autoAdvanceDelay: newDelay,
      }));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

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
            <TouchableOpacity onPress={() => setShowSettings(true)} style={styles.iconButton}>
              <Ionicons name="settings-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
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

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSettings(false)}
      >
        <View style={styles.settingsModalOverlay}>
          <View style={styles.settingsModalContent}>
            <View style={styles.settingsModalHeader}>
              <Text style={styles.settingsModalTitle}>
                {i18n.language === 'am' ? 'ቅንብሮች' : 'Settings'}
              </Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <Ionicons name="close" size={28} color="#333" />
              </TouchableOpacity>
            </View>

            {/* Sound Toggle */}
            <View style={styles.settingsRow}>
              <View style={styles.settingsLabelContainer}>
                <Ionicons name="volume-high" size={24} color={KG_DESIGN_TOKENS.colors.primary} />
                <Text style={styles.settingsLabel}>
                  {i18n.language === 'am' ? 'ድምጽ' : 'Sound Effects'}
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.settingsToggle, soundEnabled && styles.settingsToggleActive]}
                onPress={() => {
                  const newValue = !soundEnabled;
                  setSoundEnabled(newValue);
                  saveSettings(newValue, autoAdvanceDelay);
                }}
              >
                <View style={[styles.settingsToggleKnob, soundEnabled && styles.settingsToggleKnobActive]} />
              </TouchableOpacity>
            </View>

            {/* Delay Setting */}
            <View style={styles.settingsRow}>
              <View style={styles.settingsLabelContainer}>
                <Ionicons name="time" size={24} color={KG_DESIGN_TOKENS.colors.primary} />
                <Text style={styles.settingsLabel}>
                  {i18n.language === 'am' ? 'የቀጣይ ጥያቄ ቆይታ' : 'Next Question Delay'}
                </Text>
              </View>
            </View>
            <View style={styles.delayOptionsContainer}>
              {[1000, 2000, 3000].map((delay) => (
                <TouchableOpacity
                  key={delay}
                  style={[styles.delayOption, autoAdvanceDelay === delay && styles.delayOptionActive]}
                  onPress={() => {
                    setAutoAdvanceDelay(delay);
                    saveSettings(soundEnabled, delay);
                  }}
                >
                  <Text style={[styles.delayOptionText, autoAdvanceDelay === delay && styles.delayOptionTextActive]}>
                    {delay / 1000}s
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={() => {
                setShowSettings(false);
                logout();
              }}
            >
              <Ionicons name="log-out" size={22} color="#DC2626" />
              <Text style={styles.logoutButtonText}>
                {i18n.language === 'am' ? 'ውጣ' : 'Sign Out'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.settingsDoneButton} onPress={() => setShowSettings(false)}>
              <Text style={styles.settingsDoneButtonText}>
                {i18n.language === 'am' ? 'ጨርሻለሁ' : 'Done'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </View>
  );
}


