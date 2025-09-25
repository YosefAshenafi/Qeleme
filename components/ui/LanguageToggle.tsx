import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';

export const LanguageToggle: React.FC<{ colors: any }> = ({ colors }) => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const toggleLanguage = async () => {
    const newLanguage = currentLanguage === 'en' ? 'am' : 'en';
    await changeLanguage(newLanguage);
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.tint + '20' }]}
      onPress={toggleLanguage}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: colors.tint }]}>
        {currentLanguage === 'en' ? 'EN' : 'አማ'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 16,
    minWidth: 40,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 