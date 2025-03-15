import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface HelpAndSupportProps {
  colors: any;
}

export function HelpAndSupport({ colors }: HelpAndSupportProps) {
  const supportOptions = [
    {
      title: 'FAQs',
      description: 'Find answers to commonly asked questions',
      icon: 'questionmark.circle.fill',
      action: () => console.log('Navigate to FAQs'),
    },
    {
      title: 'Contact Support',
      description: 'Get in touch with our support team',
      icon: 'message.fill',
      action: () => Linking.openURL('mailto:support@qelem.com'),
    },
    {
      title: 'User Guide',
      description: 'Learn how to use all features',
      icon: 'book.fill',
      action: () => console.log('Navigate to User Guide'),
    },
    {
      title: 'Report a Bug',
      description: 'Help us improve by reporting issues',
      icon: 'exclamationmark.triangle.fill',
      action: () => console.log('Navigate to Bug Report'),
    },
    {
      title: 'Privacy Policy',
      description: 'Learn about our data handling practices',
      icon: 'lock.fill',
      action: () => console.log('Navigate to Privacy Policy'),
    },
    {
      title: 'Terms of Service',
      description: 'Read our terms and conditions',
      icon: 'doc.text.fill',
      action: () => console.log('Navigate to Terms of Service'),
    },
  ];

  return (
    <View style={styles.helpAndSupportContent}>
      <View style={styles.headerSection}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Need Help?</Text>
        <Text style={[styles.headerDescription, { color: colors.text }]}>
          We're here to help you make the most of your learning experience
        </Text>
      </View>

      <View style={styles.optionsList}>
        {supportOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.optionItem, { backgroundColor: colors.card }]}
            onPress={option.action}
          >
            <View style={styles.optionLeft}>
              <View style={styles.iconContainer}>
                <IconSymbol name={option.icon as any} size={24} color={colors.tint} />
              </View>
              <View style={styles.optionDetails}>
                <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
                <Text style={[styles.optionDescription, { color: colors.text }]}>{option.description}</Text>
              </View>
            </View>
            <IconSymbol name="chevron.right" size={20} color={colors.text} />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.contactSection}>
        <Text style={[styles.contactTitle, { color: colors.text }]}>Still Need Help?</Text>
        <Text style={[styles.contactDescription, { color: colors.text }]}>
          Our support team is available 24/7 to assist you
        </Text>
        <TouchableOpacity
          style={[styles.contactButton, { backgroundColor: colors.tint }]}
          onPress={() => Linking.openURL('mailto:support@qelem.com')}
        >
          <Text style={[styles.contactButtonText, { color: colors.background }]}>Contact Support</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  helpAndSupportContent: {
    gap: 20,
  },
  headerSection: {
    gap: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerDescription: {
    fontSize: 16,
    opacity: 0.7,
  },
  optionsList: {
    gap: 10,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionDetails: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  optionDescription: {
    fontSize: 14,
    opacity: 0.7,
  },
  contactSection: {
    marginTop: 20,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    gap: 10,
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  contactDescription: {
    fontSize: 14,
    opacity: 0.7,
    textAlign: 'center',
  },
  contactButton: {
    marginTop: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
}); 