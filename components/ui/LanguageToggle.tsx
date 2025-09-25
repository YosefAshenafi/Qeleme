import React from 'react';
import { TouchableOpacity, StyleSheet, Text } from 'react-native';
import { useLanguage } from '../../contexts/LanguageContext';

export const LanguageToggle: React.FC<{ colors: any }> = ({ colors }) => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const toggleLanguage = async () => {
    const newLanguage = currentLanguage === 'en' ? 'am' : 'en';
    await changeLanguage(newLanguage);
  };

  // Use the provided colors or fallback to theme colors
  const backgroundColor = colors.card === 'transparent' ? colors.tint + '20' : colors.card;
  const textColor = colors.text || colors.tint;

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor }]}
      onPress={toggleLanguage}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, { color: textColor }]}>
        {currentLanguage === 'en' ? 'EN' : 'አማ'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    minWidth: 36,
    height: 28,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
}); 