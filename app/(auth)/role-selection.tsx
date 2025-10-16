import { StyleSheet, TouchableOpacity, View, ScrollView, Animated } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import { ContactFooter } from '@/components/ContactFooter';

export default function RoleSelectionScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [selectedRole, setSelectedRole] = useState<'student' | 'parent' | null>(null);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  const handleRoleSelect = (role: 'student' | 'parent') => {
    setSelectedRole(role);
    
    // Animate the selection
    Animated.sequence([
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.8,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      if (role === 'student') {
        router.push('/(auth)/signup');
      } else {
        router.push('/(auth)/children-selection');
      }
    });
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
              onPress={() => router.push('/(auth)/welcome')}
            >
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#A0A0A5' : '#1F2937'} />
            </TouchableOpacity>
            <View style={styles.languageToggleContainer}>
              <LanguageToggle colors={colors} />
            </View>
            <View style={styles.titleContainer}>
              <ThemedText style={[styles.title, { color: colors.text }]}>
                {t('signup.roleSelection.title')}
              </ThemedText>
            </View>
          </View>

          <View style={styles.roleContainer}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  {
                    backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
                    borderColor: selectedRole === 'student' ? '#4F46E5' : (isDarkMode ? '#3C3C3E' : '#E5E7EB'),
                    shadowColor: selectedRole === 'student' ? '#4F46E5' : '#000',
                    shadowOffset: {
                      width: 0,
                      height: selectedRole === 'student' ? 4 : 2,
                    },
                    shadowOpacity: selectedRole === 'student' ? 0.2 : 0.1,
                    shadowRadius: selectedRole === 'student' ? 8 : 4,
                    elevation: selectedRole === 'student' ? 5 : 2,
                  }
                ]}
                onPress={() => handleRoleSelect('student')}
                activeOpacity={0.7}
              >
                <View style={[styles.roleIconContainer, { 
                  backgroundColor: selectedRole === 'student' ? '#EEF2FF' : (isDarkMode ? '#1C1C1E' : '#F3F4F6')
                }]}>
                  <View style={[styles.roleIcon, { 
                    backgroundColor: selectedRole === 'student' ? '#4F46E5' + '20' : '#4F46E5' + '10'
                  }]}>
                    <Ionicons name="school" size={32} color="#4F46E5" />
                  </View>
                </View>
                <View style={styles.roleContent}>
                  <ThemedText style={[styles.roleTitle, { 
                    color: '#4F46E5' 
                  }]}>
                    {t('signup.roleSelection.student.title')}
                  </ThemedText>
                  <ThemedText style={[styles.roleDescription, { color: colors.text + '80' }]}>
                    {t('signup.roleSelection.student.description')}
                  </ThemedText>
                  <View style={styles.roleFeatures}>
                    <View style={styles.featureItem}>
                      <Ionicons name="book-outline" size={16} color="#4F46E5" />
                      <ThemedText style={[styles.featureText, { color: colors.text + '80' }]}>
                        {t('signup.roleSelection.student.features.materials')}
                      </ThemedText>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="pencil-outline" size={16} color="#4F46E5" />
                      <ThemedText style={[styles.featureText, { color: colors.text + '80' }]}>
                        {t('signup.roleSelection.student.features.practice')}
                      </ThemedText>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="trophy-outline" size={16} color="#4F46E5" />
                      <ThemedText style={[styles.featureText, { color: colors.text + '80' }]}>
                        {t('signup.roleSelection.student.features.progress')}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View style={{ transform: [{ scale: scaleAnim }], opacity: opacityAnim }}>
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  {
                    backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
                    borderColor: selectedRole === 'parent' ? '#4F46E5' : (isDarkMode ? '#3C3C3E' : '#E5E7EB'),
                    shadowColor: selectedRole === 'parent' ? '#4F46E5' : '#000',
                    shadowOffset: {
                      width: 0,
                      height: selectedRole === 'parent' ? 4 : 2,
                    },
                    shadowOpacity: selectedRole === 'parent' ? 0.2 : 0.1,
                    shadowRadius: selectedRole === 'parent' ? 8 : 4,
                    elevation: selectedRole === 'parent' ? 5 : 2,
                  }
                ]}
                onPress={() => handleRoleSelect('parent')}
                activeOpacity={0.7}
              >
                <View style={[styles.roleIconContainer, { 
                  backgroundColor: selectedRole === 'parent' ? '#EEF2FF' : (isDarkMode ? '#1C1C1E' : '#F3F4F6')
                }]}>
                  <View style={[styles.roleIcon, { 
                    backgroundColor: selectedRole === 'parent' ? '#4F46E5' + '20' : '#4F46E5' + '10'
                  }]}>
                    <Ionicons name="people" size={32} color="#4F46E5" />
                  </View>
                </View>
                <View style={styles.roleContent}>
                  <ThemedText style={[styles.roleTitle, { 
                    color: '#4F46E5'
                  }]}>
                    {t('signup.roleSelection.parent.title')}
                  </ThemedText>
                  <ThemedText style={[styles.roleDescription, { color: colors.text + '80' }]}>
                    {t('signup.roleSelection.parent.description')}
                  </ThemedText>
                  <View style={styles.roleFeatures}>
                    <View style={styles.featureItem}>
                      <Ionicons name="analytics-outline" size={16} color="#4F46E5" />
                      <ThemedText style={[styles.featureText, { color: colors.text + '80' }]}>
                        {t('signup.roleSelection.parent.features.monitor')}
                      </ThemedText>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="school-outline" size={16} color="#4F46E5" />
                      <ThemedText style={[styles.featureText, { color: colors.text + '80' }]}>
                        {t('signup.roleSelection.parent.features.manage')}
                      </ThemedText>
                    </View>
                    <View style={styles.featureItem}>
                      <Ionicons name="notifications-outline" size={16} color="#4F46E5" />
                      <ThemedText style={[styles.featureText, { color: colors.text + '80' }]}>
                        {t('signup.roleSelection.parent.features.updates')}
                      </ThemedText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          </View>

          {/* Contact Footer */}
          <ContactFooter />
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
    marginBottom: 40,
  },
  backButton: {
    marginBottom: 24,
    padding: 8,
  },
  titleContainer: {
    gap: 8,
  },
  title: {
    paddingVertical: 20,
    fontSize: 36,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    lineHeight: 24,
  },
  roleContainer: {
    gap: 20,
  },
  roleCard: {
    padding: 24,
    borderRadius: 20,
    borderWidth: 3,
    flexDirection: 'row',
    gap: 20,
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E7EB',
  },
  roleIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleContent: {
    flex: 1,
    gap: 12,
  },
  roleTitle: {
    fontSize: 24,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  roleDescription: {
    fontSize: 17,
    lineHeight: 24,
  },
  roleFeatures: {
    gap: 8,
    marginTop: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 15,
    lineHeight: 20,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginTop: 8,
    marginRight: 16,
  },
}); 