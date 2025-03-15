import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface TermsOfServiceProps {
  colors: any;
}

export function TermsOfService({ colors }: TermsOfServiceProps) {
  const sections = [
    {
      title: 'Acceptance of Terms',
      content: 'By accessing or using Qelem, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.',
      icon: 'checkmark.circle.fill',
    },
    {
      title: 'User Accounts',
      content: 'You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.',
      icon: 'person.fill',
    },
    {
      title: 'Intellectual Property',
      content: 'The service and its original content, features, and functionality are owned by Qelem and are protected by international copyright, trademark, and other intellectual property laws.',
      icon: 'doc.text.fill',
    },
    {
      title: 'User Content',
      content: 'You retain your intellectual property rights in content you submit, post, or display on the platform. By submitting content, you grant us a license to use, modify, and distribute it.',
      icon: 'photo.fill',
    },
    {
      title: 'Prohibited Activities',
      content: 'You agree not to engage in any activity that interferes with or disrupts the service, or violates any applicable laws or regulations.',
      icon: 'exclamationmark.triangle.fill',
    },
    {
      title: 'Termination',
      content: 'We may terminate or suspend your account and access to the service immediately, without prior notice, for any reason whatsoever.',
      icon: 'xmark.circle.fill',
    },
  ];

  return (
    <ScrollView style={styles.termsOfServiceContent}>
      <View style={styles.header}>
        <IconSymbol name="doc.text.fill" size={40} color={colors.tint} />
        <Text style={[styles.headerTitle, { color: colors.text }]}>Terms of Service</Text>
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
          By using Qelem, you agree to these terms of service. We may update these terms from time to time.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  termsOfServiceContent: {
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