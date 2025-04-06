import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { IconSymbol } from '@/components/ui/IconSymbol';

const categories = [
  { name: 'Animals', icon: 'paw' },
  { name: 'Colors', icon: 'color-palette' },
  { name: 'Numbers', icon: 'calculator' },
  { name: 'Shapes', icon: 'apps' },
  { name: 'Fruits', icon: 'nutrition' },
  { name: 'Vegetables', icon: 'leaf' },
  { name: 'Family', icon: 'people' },
  { name: 'Body Parts', icon: 'body' },
  { name: 'Clothes', icon: 'shirt' },
  { name: 'Weather', icon: 'cloud' },
  { name: 'Transport', icon: 'car' },
  { name: 'Food', icon: 'fast-food' },
  { name: 'School', icon: 'school' },
  { name: 'Toys', icon: 'game-controller' },
];

export default function KGDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View style={styles.headerRight}>
          <LanguageToggle colors={colors} />
          <TouchableOpacity 
            onPress={() => router.push('/profile')}
          >
            <View style={[styles.profileIconContainer, { backgroundColor: colors.tint + '20' }]}>
              <IconSymbol 
                name="person.fill" 
                size={24} 
                color={colors.tint} 
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={[styles.contentHeader, { backgroundColor: colors.background }]}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>{t('kg.welcome', 'Welcome to Kindergarten!')}</Text>
        <Text style={[styles.subText, { color: colors.text + '80' }]}>{t('kg.subtitle', "Let's learn something new today!")}</Text>
      </View>

      <ScrollView 
        contentContainerStyle={styles.cardsContainer}
        showsVerticalScrollIndicator={false}
      >
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}
            onPress={() => {
              router.push(`/kg-category/instructions?category=${category.name}`);
            }}
          >
            <Ionicons name={category.icon as any} size={32} color={isDarkMode ? '#4F46E5' : '#4A90E2'} />
            <Text style={[styles.cardText, { color: colors.text }]}>{category.name}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
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
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardText: {
    marginTop: 8,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 