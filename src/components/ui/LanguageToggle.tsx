import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { useLanguage } from '@/core/providers/LanguageProvider';
import { languageToggleStyles as styles } from './LanguageToggle.styles';

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
