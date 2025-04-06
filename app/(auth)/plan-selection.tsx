import { StyleSheet, TouchableOpacity, View, ScrollView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/components/ThemedText';

interface ChildData {
  fullName: string;
  username: string;
  grade: string;
  password: string;
  confirmPassword: string;
  plan: string;
}

const plans = [
  {
    id: '0',
    name: 'Free',
    price: 0,
    features: [
      'Basic access to learning materials',
      'Limited practice questions',
      'Basic progress tracking',
      'Community support'
    ]
  },
  {
    id: '1',
    name: '1 Month',
    price: 199,
    features: [
      'Access to all learning materials',
      'Practice questions',
      'Progress tracking',
      'Basic support'
    ]
  },
  {
    id: '3',
    name: '3 Months',
    price: 299,
    features: [
      'Access to all learning materials',
      'Practice questions',
      'Progress tracking',
      'Basic support'
    ]
  },
  {
    id: '6',
    name: '6 Months',
    price: 499,
    features: [
      'Access to all learning materials',
      'Practice questions',
      'Progress tracking',
      'Basic support'
    ]
  },
  {
    id: '12',
    name: '12 Months',
    price: 799,
    features: [
      'Everything in 6 Months plan',
      'Priority support',
      'Advanced analytics',
      'Exclusive content'
    ]
  }
];

export default function PlanSelectionScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const params = useLocalSearchParams();
  const userData = JSON.parse(params.userData as string);
  const [selectedPlans, setSelectedPlans] = useState<ChildData[]>(
    userData.role === 'parent' && userData.numberOfChildren > 0 
      ? userData.childrenData.map((child: ChildData) => ({ ...child, plan: child.plan || '0' }))
      : [{ plan: '0', fullName: '', username: '', grade: '', password: '', confirmPassword: '' }]
  );

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
      paddingBottom: 180,
  },
  backButton: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
      paddingTop: 30,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  childSection: {
    marginBottom: 32,
  },
  childName: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  plansContainer: {
    gap: 16,
  },
  planCard: {
    borderRadius: 16,
    padding: 24,
    borderWidth: 2,
    backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
    marginBottom: 16,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  planName: {
    fontSize: 20,
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 20,
    fontWeight: '600',
  },
  featuresContainer: {
    gap: 12,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
  },
    footer: {
      padding: 24,
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      marginTop: 'auto',
    },
    totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
      marginBottom: 16,
  },
    totalLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  continueButton: {
    height: 60,
    borderRadius: 16,
      justifyContent: 'center',
    alignItems: 'center',
  },
    continueButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
    calculationContainer: {
      marginBottom: 32,
    },
    calculationText: {
      fontSize: 16,
    },
  });

  const getTotalCost = () => {
    if (userData.role === 'parent' && userData.numberOfChildren > 0) {
      // For parent registration, multiply the selected plan price by number of children
      const plan = plans.find(p => p.id === selectedPlans[0].plan);
      return (plan?.price || 0) * userData.numberOfChildren;
    } else {
      // For single student, just return the selected plan price
      const plan = plans.find(p => p.id === selectedPlans[0].plan);
      return plan?.price || 0;
    }
  };

  const getPricePerChild = () => {
    const plan = plans.find(p => p.id === selectedPlans[0].plan);
    return plan?.price || 0;
  };

  const handlePlanSelect = (planId: string) => {
    // Apply the same plan to all children
    const newPlans = selectedPlans.map((child: ChildData) => ({ ...child, plan: planId }));
    setSelectedPlans(newPlans);
  };

  const handleContinue = async () => {
    try {
      // Update userData with selected plans
      const updatedUserData = {
        ...userData,
        childrenData: userData.role === 'parent' && userData.numberOfChildren > 0 ? selectedPlans : undefined,
        plan: selectedPlans[0].plan
      };

      if (updatedUserData.role === 'parent') {
        // Prepare children data with their selected plans and passwords
        const children = updatedUserData.childrenData?.map((child: ChildData) => ({
          fullName: child.fullName,
          username: child.username,
          password: child.password,
          grade: child.grade,
          paymentPlan: child.plan || "3",
          amountPaid: getTotalCost() / updatedUserData.childrenData.length // Split cost among children
        })) || [];

        // Register parent with children in a single API call
        const response = await fetch('http://localhost:5001/api/auth/register/parent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: updatedUserData.fullName,
            username: updatedUserData.username,
            password: updatedUserData.password,
            phoneNumber: updatedUserData.phoneNumber,
            children: children
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to register parent and children');
        }

        // Show success alert
        Alert.alert(
          t('auth.planSelection.success.title'),
          t('auth.planSelection.success.parentMessage'),
          [
            {
              text: t('auth.planSelection.success.button'),
              onPress: () => router.replace('/(auth)/login'),
              style: 'default'
            }
          ],
          {
            cancelable: false
          }
        );
      } else {
        // Regular student registration
        const response = await fetch('http://localhost:5001/api/auth/register/student', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fullName: updatedUserData.fullName,
            username: updatedUserData.username,
            password: updatedUserData.password,
            grade: updatedUserData.grade,
            parentId: "0", // Default value for now
            paymentPlan: selectedPlans[0].plan,
            amountPaid: getTotalCost()
          }),
        });

        const data = await response.json();

        if (response.ok) {
          // Show success alert
          Alert.alert(
            t('auth.planSelection.success.title'),
            t('auth.planSelection.success.message'),
            [
              {
                text: t('auth.planSelection.success.button'),
                onPress: () => router.replace('/(auth)/login'),
                style: 'default'
              }
            ],
            {
              cancelable: false
            }
          );
        } else {
          throw new Error(data.message || 'Registration failed');
        }
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      // Show error alert and go back to signup
      Alert.alert(
        t('auth.planSelection.error.title'),
        err.message || t('auth.planSelection.error.network'),
        [
          {
            text: t('auth.planSelection.error.button'),
            onPress: () => router.back(),
            style: 'default'
          }
        ],
        {
          cancelable: false
        }
      );
    }
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ['#000000', '#1C1C1E'] : ['#F8F9FA', '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1 }}>
          <ScrollView style={styles.container}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#A0A0A5' : '#1F2937'} />
            </TouchableOpacity>

            <View style={styles.header}>
              <ThemedText style={[styles.title, { color: colors.text }]}>
                {t('auth.planSelection.title')}
              </ThemedText>
              <ThemedText style={[styles.subtitle, { color: colors.text + '80' }]}>
                {userData.role === 'parent' && userData.numberOfChildren > 1 
                  ? t('auth.planSelection.subtitleMultiple')
                  : t('auth.planSelection.subtitleSingle')}
              </ThemedText>
            </View>

            <View style={styles.plansContainer}>
              {plans.map((plan) => (
                <TouchableOpacity
                  key={plan.id}
                  style={[
                    styles.planCard,
                    {
                      backgroundColor: plan.id === '6' || plan.id === '1'
                        ? isDarkMode ? '#4F46E5' : '#4F46E5' 
                        : isDarkMode ? '#2C2C2E' : '#FFFFFF',
                      borderColor: selectedPlans[0].plan === plan.id ? '#4F46E5' : (isDarkMode ? '#3C3C3E' : '#E5E7EB'),
                    }
                  ]}
                  onPress={() => handlePlanSelect(plan.id)}
                >
                  <View style={styles.planHeader}>
                    <ThemedText style={[
                      styles.planName, 
                      { 
                        color: plan.id === '6' || plan.id === '1' ? '#FFFFFF' : colors.text,
                        fontWeight: plan.id === '6' || plan.id === '1' ? 'bold' : 'normal'
                      }
                    ]}>
                      {t(`auth.planSelection.plans.${plan.id}.name`)}
                    </ThemedText>
                    <ThemedText style={[
                      styles.planPrice, 
                      { 
                        color: plan.id === '6' || plan.id === '1' ? '#FFFFFF' : colors.text,
                        fontWeight: plan.id === '6' || plan.id === '1' ? 'bold' : 'normal'
                      }
                    ]}>
                      ETB {plan.price}
                    </ThemedText>
                  </View>
                  <View style={styles.featuresContainer}>
                    {plan.features.map((feature, idx) => (
                      <View key={idx} style={styles.featureRow}>
                        <Ionicons 
                          name="checkmark-circle" 
                          size={20} 
                          color={plan.id === '6' || plan.id === '1' ? '#FFFFFF' : '#4F46E5'} 
                        />
                        <ThemedText style={[
                          styles.featureText, 
                          { 
                            color: plan.id === '6' || plan.id === '1' ? '#FFFFFF' : colors.text + '80',
                            flex: 1
                          }
                        ]}>
                          {t(`auth.planSelection.plans.${plan.id}.features.${idx}`)}
                        </ThemedText>
                      </View>
                    ))}
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {userData.role === 'parent' && userData.numberOfChildren > 1 && (
              <View style={styles.calculationContainer}>
                <ThemedText style={[styles.calculationText, { color: colors.text }]}>
                  {t('auth.planSelection.calculation', {
                    planPrice: getPricePerChild(),
                    numberOfChildren: userData.numberOfChildren,
                    total: getTotalCost()
                  })}
                </ThemedText>
                <ThemedText style={[styles.calculationText, { color: colors.text, marginTop: 8 }]}>
                  {t('auth.planSelection.pricePerChild', {
                    price: getPricePerChild()
                  })}
                </ThemedText>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.totalContainer}>
              <ThemedText style={[styles.totalLabel, { color: colors.text }]}>
                {t('auth.planSelection.total')}
              </ThemedText>
              <ThemedText style={[styles.totalAmount, { color: colors.text }]}>
                ETB {getTotalCost()}
              </ThemedText>
            </View>

            <TouchableOpacity 
              style={[
                styles.continueButton, 
                { 
                  backgroundColor: '#4F46E5',
                  opacity: selectedPlans[0].plan ? 1 : 0.5
                }
              ]}
              onPress={handleContinue}
              disabled={!selectedPlans[0].plan}
            >
              <ThemedText style={styles.continueButtonText}>
                {t('auth.planSelection.continue')}
              </ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
} 