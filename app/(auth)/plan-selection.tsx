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

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 99,
    features: [
      'Access to basic learning materials',
      'Practice questions',
      'Progress tracking'
    ]
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 199,
    features: [
      'Everything in Basic',
      'Advanced learning materials',
      'Live tutoring sessions',
      'Personalized learning path'
    ]
  },
  {
    id: 'family',
    name: 'Family',
    price: 299,
    features: [
      'Everything in Premium',
      'Family dashboard',
      'Parent reports',
      'Multiple child accounts'
    ]
  }
];

export default function PlanSelectionScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const params = useLocalSearchParams();
  const userData = JSON.parse(params.userData as string);
  const [selectedPlans, setSelectedPlans] = useState(
    userData.numberOfChildren > 1 
      ? userData.childrenData.map((child: any) => ({ ...child, plan: child.plan || 'basic' }))
      : [{ plan: 'basic' }]
  );

  const getTotalCost = () => {
    return selectedPlans.reduce((total: number, child: any) => {
      const plan = plans.find(p => p.id === child.plan);
      return total + (plan?.price || 0);
    }, 0);
  };

  const handlePlanSelect = (planId: string, childIndex: number) => {
    const newPlans = [...selectedPlans];
    newPlans[childIndex] = { ...newPlans[childIndex], plan: planId };
    setSelectedPlans(newPlans);
  };

  const handleContinue = async () => {
    try {
      // Update userData with selected plans
      const updatedUserData = {
        ...userData,
        childrenData: userData.numberOfChildren > 1 ? selectedPlans : undefined,
        plan: userData.numberOfChildren === 1 ? selectedPlans[0].plan : undefined
      };

      // Call the registration API
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
          paymentPlan: updatedUserData.plan || "6", // Default to 6 months if not specified
          amountPaid: 1000 // Default value for now
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Show success alert
        Alert.alert(
          'Success',
          'Registration completed successfully! Please login to continue.',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/(auth)/login')
            }
          ]
        );
      } else {
        // Show error alert and go back to signup
        Alert.alert(
          'Registration Failed',
          data.message || 'Registration failed. Please try again.',
          [
            {
              text: 'OK',
              onPress: () => router.back()
            }
          ]
        );
      }
    } catch (err) {
      console.error('Registration error:', err);
      // Show error alert and go back to signup
      Alert.alert(
        'Error',
        'An error occurred during registration. Please try again.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    }
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ['#000000', '#1C1C1E'] : ['#F8F9FA', '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView style={styles.container}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#A0A0A5' : '#1F2937'} />
          </TouchableOpacity>

          <View style={styles.header}>
            <ThemedText style={[styles.title, { color: colors.text }]}>
              Choose Your Plan
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: colors.text + '80' }]}>
              {userData.numberOfChildren > 1 
                ? 'Select plans for each child'
                : 'Select your preferred plan'}
            </ThemedText>
          </View>

          {selectedPlans.map((childPlan: any, index: number) => (
            <View key={index} style={styles.childSection}>
              {userData.numberOfChildren > 1 && (
                <ThemedText style={[styles.childName, { color: colors.text }]}>
                  {userData.childrenData[index].fullName}
                </ThemedText>
              )}
              
              <View style={styles.plansContainer}>
                {plans.map((plan) => (
                  <TouchableOpacity
                    key={plan.id}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor: isDarkMode ? '#2C2C2E' : '#FFFFFF',
                        borderColor: childPlan.plan === plan.id ? '#4F46E5' : (isDarkMode ? '#3C3C3E' : '#E5E7EB'),
                      }
                    ]}
                    onPress={() => handlePlanSelect(plan.id, index)}
                  >
                    <View style={styles.planHeader}>
                      <ThemedText style={[styles.planName, { color: colors.text }]}>
                        {plan.name}
                      </ThemedText>
                      <ThemedText style={[styles.planPrice, { color: colors.text }]}>
                        ETB {plan.price}/mo
                      </ThemedText>
                    </View>
                    <View style={styles.featuresContainer}>
                      {plan.features.map((feature, idx) => (
                        <View key={idx} style={styles.featureRow}>
                          <Ionicons name="checkmark-circle" size={20} color="#4F46E5" />
                          <ThemedText style={[styles.featureText, { color: colors.text + '80' }]}>
                            {feature}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}

          <View style={styles.totalSection}>
            <ThemedText style={[styles.totalText, { color: colors.text }]}>
              Total Monthly Cost
            </ThemedText>
            <ThemedText style={[styles.totalAmount, { color: colors.text }]}>
              ETB {getTotalCost()}/mo
            </ThemedText>
          </View>

          <TouchableOpacity
            style={styles.continueButton}
            onPress={handleContinue}
          >
            <LinearGradient
              colors={['#4F46E5', '#7C3AED']}
              style={styles.buttonGradient}
            >
              <ThemedText style={styles.buttonText}>Continue</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
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
  backButton: {
    marginBottom: 16,
  },
  header: {
    marginBottom: 32,
  },
  title: {
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
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  totalText: {
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
    overflow: 'hidden',
    marginBottom: 24,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 