import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';

export function ContactFooter() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  return (
    <View style={styles.contactFooter}>
      <Text style={[styles.contactFooterTitle, { color: colors.text + '60' }]}>
        {t('welcome.contactInfo.title')}
      </Text>
      <View style={styles.contactFooterContent}>
        <TouchableOpacity onPress={() => Linking.openURL('tel:+251911243867')}>
          <Text style={[styles.contactFooterLink, { color: isDarkMode ? '#FFFFFF' : colors.tint }]}>
            +251 911 243 867
          </Text>
        </TouchableOpacity>
        <Text style={[styles.contactFooterSeparator, { color: colors.text + '40' }]}>•</Text>
        <TouchableOpacity onPress={() => Linking.openURL('tel:+251911557216')}>
          <Text style={[styles.contactFooterLink, { color: isDarkMode ? '#FFFFFF' : colors.tint }]}>
            +251 911 557 216
          </Text>
        </TouchableOpacity>
        <Text style={[styles.contactFooterSeparator, { color: colors.text + '40' }]}>•</Text>
        <TouchableOpacity onPress={() => Linking.openURL('tel:+251913727300')}>
          <Text style={[styles.contactFooterLink, { color: isDarkMode ? '#FFFFFF' : colors.tint }]}>
            +251 913 727 300
          </Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity onPress={() => Linking.openURL('mailto:contact@qelem.net')}>
        <Text style={[styles.contactFooterLink, { color: isDarkMode ? '#FFFFFF' : colors.tint }]}>
          contact@qelem.net
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  contactFooter: {
    marginTop: 32,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    alignItems: 'center',
    width: '100%',
  },
  contactFooterTitle: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contactFooterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    justifyContent: 'center',
    marginBottom: 8,
    gap: 8,
  },
  contactFooterLink: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactFooterSeparator: {
    fontSize: 14,
    marginHorizontal: 4,
  },
});


