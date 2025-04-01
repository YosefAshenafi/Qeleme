import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../contexts/LanguageContext';
import { IconSymbol } from './ui/IconSymbol';

export const LanguageSelector: React.FC<{ colors: any }> = ({ colors }) => {
  const { currentLanguage, changeLanguage, languages } = useLanguage();

  return (
    <View style={styles.container}>
      {Object.entries(languages).map(([code, { name }]) => (
        <TouchableOpacity
          key={code}
          style={[
            styles.languageOption,
            { borderBottomColor: colors.border },
            code === Object.keys(languages).slice(-1)[0] && styles.lastOption
          ]}
          onPress={() => changeLanguage(code)}
        >
          <View style={styles.languageRow}>
            <Text style={[styles.languageText, { color: colors.text }]}>{name}</Text>
            {currentLanguage === code && (
              <IconSymbol name="checkmark.circle.fill" size={20} color={colors.tint} />
            )}
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  languageOption: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  lastOption: {
    borderBottomWidth: 0,
  },
  languageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 16,
  },
}); 