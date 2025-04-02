import { StyleSheet, TouchableOpacity, View, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';

export default function RoleSelectionScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [selectedRole, setSelectedRole] = useState<'student' | 'parent' | null>(null);

  const handleRoleSelect = (role: 'student' | 'parent') => {
    setSelectedRole(role);
    if (role === 'student') {
      router.push('/(auth)/signup');
    } else {
      router.push('/(auth)/children-selection');
    }
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ['#000000', '#1C1C1E'] : ['#F8F9FA', '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#A0A0A5' : '#1F2937'} />
            </TouchableOpacity>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              {t('signup.roleSelection.title')}
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.text + '80' }]}>
              {t('signup.roleSelection.subtitle')}
            </ThemedText>
          </View>

          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[
                styles.roleCard,
                {
                  backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
                  borderColor: selectedRole === 'student' ? '#4F46E5' : (isDarkMode ? '#3C3C3E' : '#E5E7EB'),
                }
              ]}
              onPress={() => handleRoleSelect('student')}
            >
              <View style={styles.roleIcon}>
                <Ionicons name="school-outline" size={32} color="#4F46E5" />
              </View>
              <ThemedText style={[styles.roleTitle, { color: colors.text }]}>
                {t('signup.roleSelection.student.title')}
              </ThemedText>
              <ThemedText style={[styles.roleDescription, { color: colors.text + '80' }]}>
                {t('signup.roleSelection.student.description')}
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.roleCard,
                {
                  backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
                  borderColor: selectedRole === 'parent' ? '#4F46E5' : (isDarkMode ? '#3C3C3E' : '#E5E7EB'),
                }
              ]}
              onPress={() => handleRoleSelect('parent')}
            >
              <View style={styles.roleIcon}>
                <Ionicons name="people-outline" size={32} color="#4F46E5" />
              </View>
              <ThemedText style={[styles.roleTitle, { color: colors.text }]}>
                {t('signup.roleSelection.parent.title')}
              </ThemedText>
              <ThemedText style={[styles.roleDescription, { color: colors.text + '80' }]}>
                {t('signup.roleSelection.parent.description')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 16,
  },
  roleContainer: {
    gap: 16,
  },
  roleCard: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
    gap: 16,
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  roleDescription: {
    fontSize: 16,
  },
}); 