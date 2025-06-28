import { StyleSheet, TouchableOpacity, View, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../../config/constants';
import { PaymentPlan } from '@/types/payment';

import { ThemedText } from '@/components/ThemedText';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

interface ChildData {
  fullName: string;
  username: string;
  grade: string;
  password: string;
  confirmPassword: string;
  plan: string;
}

interface SelectedPlan {
  plan: string;
}

export default function PlanSelectionScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlans, setSelectedPlans] = useState<SelectedPlan[]>([]);
  const params = useLocalSearchParams();
  const userData = params.userData ? JSON.parse(decodeURIComponent(params.userData as string)) : null;

  useEffect(() => {
    fetchPaymentPlans();
  }, []);

  const fetchPaymentPlans = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/payment-plans`);
      if (!response.ok) {
        throw new Error('Failed to fetch payment plans');
      }
      const data = await response.json();
      setPlans(data);
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.errors.fetchPlansFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getTotalCost = () => {
    if (!selectedPlans.length) return 0;
    
    if (userData.role === 'parent' && userData.numberOfChildren > 0) {
      const plan = plans.find(p => p._id === selectedPlans[0].plan);
      return (plan?.amount || 0) * userData.numberOfChildren;
    } else {
      const plan = plans.find(p => p._id === selectedPlans[0].plan);
      return plan?.amount || 0;
    }
  };

  const getPricePerChild = () => {
    if (!selectedPlans.length) return 0;
    
    const plan = plans.find(p => p._id === selectedPlans[0].plan);
    return plan?.amount || 0;
  };

  const handlePlanSelect = (plan: PaymentPlan) => {
    if (userData.role === 'parent' && userData.numberOfChildren > 0) {
      // For parents, update the plan for each child
      const updatedChildrenData = userData.childrenData.map((child: ChildData) => ({
        ...child,
        plan: plan._id
      }));
      setSelectedPlans(updatedChildrenData);
    } else {
      // For students, just select the plan
      setSelectedPlans([{ plan: plan._id }]);
    }
  };

  const handleContinue = async () => {
    try {
      if (!selectedPlans.length) {
        throw new Error('No plan selected');
      }

      const updatedUserData = {
        ...userData,
        childrenData: userData.role === 'parent' && userData.numberOfChildren > 0 ? selectedPlans : undefined,
        plan: selectedPlans[0].plan
      };

      if (updatedUserData.role === 'parent') {
        const children = updatedUserData.childrenData?.map((child: ChildData) => ({
          fullName: child.fullName,
          username: child.username,
          password: child.password,
          grade: child.grade,
          paymentPlan: child.plan,
          amountPaid: getTotalCost() / updatedUserData.childrenData.length
        })) || [];

        const response = await fetch(`${BASE_URL}/api/auth/register/parent`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
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
        // For students, register directly
        const response = await fetch(`${BASE_URL}/api/auth/register/student`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify({
            fullName: updatedUserData.fullName,
            username: updatedUserData.username,
            password: updatedUserData.password,
            grade: updatedUserData.grade,
            parentId: "0",
            paymentPlanId: selectedPlans[0].plan,
            amountPaid: getTotalCost()
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to register student');
        }

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
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert(
        t('common.error'),
        error instanceof Error ? error.message : t('auth.errors.registrationFailed')
      );
    }
  };

  const getPlanBackgroundColor = (plan: PaymentPlan) => {
    if (isDarkMode) {
      switch (plan.durationInMonths) {
        case 1:
          return '#1E3A8A'; // Dark blue
        case 3:
          return '#1E40AF'; // Slightly lighter blue
        case 6:
          return '#1E4C8A'; // Blue-green
        case 12:
          return '#1E4C8A'; // Blue-green
        default:
          return '#2C2C2E';
      }
    } else {
      switch (plan.durationInMonths) {
        case 1:
          return '#EFF6FF'; // Light blue
        case 3:
          return '#F0FDF4'; // Light green
        case 6:
          return '#EEF2FF'; // Light indigo
        case 12:
          return '#F5F3FF'; // Light purple
        default:
          return '#F9FAFB';
      }
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText>{t('common.loading')}</ThemedText>
      </View>
    );
  }

  return (
    <LinearGradient
      colors={[colors.background, colors.background]}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <View style={styles.languageToggleContainer}>
                <LanguageToggle colors={colors} />
              </View>
              <ThemedText style={[styles.title, { color: colors.text }]}>{t('auth.planSelection.title')}</ThemedText>
              <ThemedText style={[styles.subtitle, { color: colors.text + '80' }]}>
                {t('auth.planSelection.subtitle')}
              </ThemedText>
            </View>

            <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
              <View style={styles.plansContainer}>
                {plans.map((plan, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.planCard,
                      {
                        backgroundColor: getPlanBackgroundColor(plan),
                        borderColor: selectedPlans.some(p => p.plan === plan._id) 
                          ? '#4F46E5' 
                          : (isDarkMode ? '#3C3C3E' : '#E5E7EB')
                      }
                    ]}
                    onPress={() => handlePlanSelect(plan)}
                  >
                    <View style={styles.planHeader}>
                      <ThemedText style={[styles.planName, { color: colors.text }]}>
                        {plan.name}
                      </ThemedText>
                      <ThemedText style={[styles.planPrice, { color: colors.text }]}>
                        ETB {plan.amount}
                      </ThemedText>
                    </View>
                    <ThemedText style={[styles.planDuration, { color: colors.text + '80' }]}>
                      {plan.durationInMonths} {t('auth.planSelection.months')}
                    </ThemedText>
                    <ThemedText style={[styles.planDescription, { color: colors.text + '80' }]}>
                      {plan.description}
                    </ThemedText>
                    {plan.remark && (
                      <ThemedText style={[styles.planRemark, { color: colors.text + '80' }]}>
                        {plan.remark}
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
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
                  selectedPlans.length > 0 && styles.continueButtonActive
                ]}
                onPress={handleContinue}
                disabled={selectedPlans.length === 0}
              >
                <LinearGradient
                  colors={['#4F46E5', '#7C3AED']}
                  style={styles.buttonGradient}
                >
                  <ThemedText style={styles.buttonText}>
                    {t('auth.planSelection.continue')}
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 24,
  },
  backButton: {
    marginBottom: 16,
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginTop: 8,
    marginRight: 16,
    zIndex: 1,
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
  scrollView: {
    flex: 1,
  },
  plansContainer: {
    gap: 16,
    paddingBottom: 24,
  },
  planCard: {
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  planName: {
    fontSize: 18,
    fontWeight: '600',
  },
  planPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  planDuration: {
    fontSize: 14,
    marginBottom: 8,
  },
  planDescription: {
    fontSize: 14,
    marginBottom: 8,
  },
  planRemark: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  footer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'transparent',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: '700',
  },
  continueButton: {
    width: '100%',
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    opacity: 0.5,
  },
  continueButtonActive: {
    opacity: 1,
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