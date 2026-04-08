import React from 'react';
import { View, Text, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { ContactFooterStyles as styles } from './ContactFooter.styles';

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
      <TouchableOpacity onPress={() => Linking.openURL('mailto:support@megatest.app')}>
        <Text style={[styles.contactFooterLink, { color: isDarkMode ? '#FFFFFF' : colors.tint }]}>
          support@megatest.app
        </Text>
      </TouchableOpacity>
    </View>
  );
}

