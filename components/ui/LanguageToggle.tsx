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
      style={[styles.container, { backgroundColor: colors.card }]}
      onPress={toggleLanguage}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: colors.text }]}>
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
    borderRadius: 20,
    marginRight: 8,
    minHeight: 36,
    paddingBottom: 15,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 