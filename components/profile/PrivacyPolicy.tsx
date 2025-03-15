import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface PrivacyPolicyProps {
  colors: any;
}

export function PrivacyPolicy({ colors }: PrivacyPolicyProps) {
  const sections = [
    {
      title: 'Data Collection',
      content: 'We collect information that you provide directly to us, including your name, email address, and study progress. This information is used to provide and improve our services.',
      icon: 'doc.text.fill',
    },
    {
      title: 'Data Usage',
      content: 'Your data is used to personalize your learning experience, track your progress, and provide relevant study materials. We never sell your personal information to third parties.',
      icon: 'hand.raised.fill',
    },
    {
      title: 'Data Security',
      content: 'We implement appropriate security measures to protect your personal information. Your data is encrypted and stored securely on our servers.',
      icon: 'lock.fill',
    },
    {
      title: 'Data Sharing',
      content: 'We may share your data with trusted service providers who assist in operating our platform. These providers are bound by confidentiality obligations.',
      icon: 'person.2.fill',
    },
    {
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal information. You can also opt-out of certain data collection practices.',
      icon: 'checkmark.shield.fill',
    },
    {
      title: 'Contact Us',
      content: 'If you have any questions about our privacy policy, please contact us at privacy@qelem.com',
      icon: 'envelope.fill',
    },
  ];

  return (
    <ScrollView style={styles.privacyPolicyContent}>
      <View style={styles.header}>
        <IconSymbol name="lock.shield.fill" size={40} color={colors.tint} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Privacy Policy</Text>
        <Text style={[styles.headerSubtitle, { color: colors.text }]}>
          Last updated: March 2024
        </Text>
      </View>

      <View style={styles.sectionsContainer}>
        {sections.map((section, index) => (
          <View key={index} style={[styles.section, { backgroundColor: colors.card }]}>
            <View style={styles.sectionHeader}>
              <View style={styles.iconContainer}>
                <IconSymbol name={section.icon as any} size={24} color={colors.tint} />
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            </View>
            <Text style={[styles.sectionContent, { color: colors.text }]}>{section.content}</Text>
          </View>
        ))}
      </View>

      <View style={styles.footer}>
        <Text style={[styles.footerText, { color: colors.text }]}>
          By using Qelem, you agree to this privacy policy. We may update this policy from time to time.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  privacyPolicyContent: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    gap: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
  sectionsContainer: {
    padding: 15,
    gap: 15,
  },
  section: {
    padding: 15,
    borderRadius: 12,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
    opacity: 0.8,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.7,
  },
}); 