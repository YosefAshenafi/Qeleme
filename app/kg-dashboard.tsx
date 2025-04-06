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
import { useAuth } from '@/contexts/AuthContext';

const categories = [
  { name: 'Animals', icon: 'paw', image: require('@/assets/images/categories/animals.png') },
  { name: 'Colors', icon: 'color-palette', image: require('@/assets/images/categories/colors.png') },
  { name: 'Numbers', icon: 'calculator', image: require('@/assets/images/categories/numbers.png') },
  { name: 'Shapes', icon: 'apps', image: require('@/assets/images/categories/shapes.png') },
  { name: 'Fruits', icon: 'nutrition', image: require('@/assets/images/categories/fruits.png') },
  { name: 'Vegetables', icon: 'leaf', image: require('@/assets/images/categories/vegetables.png') },
  { name: 'Family', icon: 'people', image: require('@/assets/images/categories/family.png') },
  { name: 'Body Parts', icon: 'body', image: require('@/assets/images/categories/body-parts.png') },
  { name: 'Clothes', icon: 'shirt', image: require('@/assets/images/categories/clothes.png') },
  { name: 'Weather', icon: 'cloud', image: require('@/assets/images/categories/weather.png') },
  { name: 'Transport', icon: 'car', image: require('@/assets/images/categories/transport.png') },
  { name: 'Food', icon: 'fast-food', image: require('@/assets/images/categories/food.png') },
  { name: 'School', icon: 'school', image: require('@/assets/images/categories/school.png') },
  { name: 'Toys', icon: 'game-controller', image: require('@/assets/images/categories/toys.png') },
];

export default function KGDashboard() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();
  const { user } = useAuth();

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
        {categories.map((category, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.card, { backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF' }]}
            onPress={() => {
              router.push(`/kg-category/instructions?category=${category.name}`);
            }}
          >
            <Image
              source={category.image}
              style={styles.categoryImage}
            />
            <View style={styles.overlay}>
              <Ionicons name={category.icon as any} size={24} color="#FFFFFF" />
              <Text style={styles.cardText}>
                {t(`kg.categories.${category.name}`)}
              </Text>
            </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  cardText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
}); 