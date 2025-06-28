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
      
      // Debug: Log the plans before sorting
      console.log('Plans before sorting:', data.map((p: PaymentPlan) => ({ name: p.name, duration: p.durationInMonths })));
      
      // Sort plans in descending order based on durationInMonths
      const sortedPlans = data.sort((a: PaymentPlan, b: PaymentPlan) => {
        return b.durationInMonths - a.durationInMonths;
      });
      
      // Debug: Log the plans after sorting
      console.log('Plans after sorting:', sortedPlans.map((p: PaymentPlan) => ({ name: p.name, duration: p.durationInMonths })));
      
      setPlans(sortedPlans);
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

  const getPlanColors = (plan: PaymentPlan) => {
    const isSelected = selectedPlans.some(p => p.plan === plan._id);
    
    if (isDarkMode) {
      switch (plan.durationInMonths) {
        case 12:
          return {
            background: isSelected ? '#1E40AF' : '#1E3A8A',
            border: isSelected ? '#60A5FA' : '#3B82F6',
            text: '#FFFFFF',
            subtitle: '#E5E7EB',
            gradient: ['#1E40AF', '#1E3A8A'],
            accent: '#F59E0B'
          };
        case 6:
          return {
            background: isSelected ? '#059669' : '#047857',
            border: isSelected ? '#34D399' : '#10B981',
            text: '#FFFFFF',
            subtitle: '#E5E7EB',
            gradient: ['#059669', '#047857'],
            accent: '#10B981'
          };
        case 3:
          return {
            background: isSelected ? '#EA580C' : '#C2410C',
            border: isSelected ? '#FB923C' : '#F97316',
            text: '#FFFFFF',
            subtitle: '#E5E7EB',
            gradient: ['#EA580C', '#C2410C'],
            accent: '#F97316'
          };
        case 1:
          return {
            background: isSelected ? '#7C3AED' : '#6D28D9',
            border: isSelected ? '#A78BFA' : '#8B5CF6',
            text: '#FFFFFF',
            subtitle: '#E5E7EB',
            gradient: ['#7C3AED', '#6D28D9'],
            accent: '#8B5CF6'
          };
        case 0:
          return {
            background: isSelected ? '#374151' : '#1F2937',
            border: isSelected ? '#9CA3AF' : '#6B7280',
            text: '#FFFFFF',
            subtitle: '#E5E7EB',
            gradient: ['#374151', '#1F2937'],
            accent: '#6B7280'
          };
        default:
          return {
            background: isSelected ? '#374151' : '#1F2937',
            border: isSelected ? '#9CA3AF' : '#6B7280',
            text: '#FFFFFF',
            subtitle: '#E5E7EB',
            gradient: ['#374151', '#1F2937'],
            accent: '#6B7280'
          };
      }
    } else {
      switch (plan.durationInMonths) {
        case 12:
          return {
            background: isSelected ? '#DBEAFE' : '#EFF6FF',
            border: isSelected ? '#2563EB' : '#1D4ED8',
            text: '#1E40AF',
            subtitle: '#6B7280',
            gradient: ['#DBEAFE', '#EFF6FF'],
            accent: '#F59E0B'
          };
        case 6:
          return {
            background: isSelected ? '#D1FAE5' : '#ECFDF5',
            border: isSelected ? '#059669' : '#047857',
            text: '#047857',
            subtitle: '#6B7280',
            gradient: ['#D1FAE5', '#ECFDF5'],
            accent: '#10B981'
          };
        case 3:
          return {
            background: isSelected ? '#FED7AA' : '#FFEDD5',
            border: isSelected ? '#EA580C' : '#C2410C',
            text: '#C2410C',
            subtitle: '#6B7280',
            gradient: ['#FED7AA', '#FFEDD5'],
            accent: '#F97316'
          };
        case 1:
          return {
            background: isSelected ? '#EDE9FE' : '#F5F3FF',
            border: isSelected ? '#7C3AED' : '#6D28D9',
            text: '#6D28D9',
            subtitle: '#6B7280',
            gradient: ['#EDE9FE', '#F5F3FF'],
            accent: '#8B5CF6'
          };
        case 0:
          return {
            background: isSelected ? '#F3F4F6' : '#F9FAFB',
            border: isSelected ? '#4B5563' : '#374151',
            text: '#374151',
            subtitle: '#6B7280',
            gradient: ['#F3F4F6', '#F9FAFB'],
            accent: '#6B7280'
          };
        default:
          return {
            background: isSelected ? '#F3F4F6' : '#F9FAFB',
            border: isSelected ? '#4B5563' : '#374151',
            text: '#374151',
            subtitle: '#6B7280',
            gradient: ['#F3F4F6', '#F9FAFB'],
            accent: '#6B7280'
          };
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
                {plans.map((plan, index) => {
                  const planColors = getPlanColors(plan);
                  const isRecommended = plan.durationInMonths === 12;
                  const isSelected = selectedPlans.some(p => p.plan === plan._id);
                  const isFree = plan.durationInMonths === 0;
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.planCard,
                        {
                          borderColor: isSelected ? planColors.border : planColors.border,
                          borderWidth: isSelected ? 3 : 2,
                          shadowColor: isDarkMode ? '#000000' : '#000000',
                          shadowOffset: {
                            width: 0,
                            height: isSelected ? 8 : 4,
                          },
                          shadowOpacity: isDarkMode ? 0.4 : 0.15,
                          shadowRadius: isSelected ? 16 : 12,
                          elevation: isSelected ? 16 : 12,
                          transform: [{ scale: isSelected ? 1.02 : 1 }],
                        }
                      ]}
                      onPress={() => handlePlanSelect(plan)}
                    >
                      <LinearGradient
                        colors={planColors.gradient as [string, string]}
                        style={styles.planCardGradient}
                      >
                        {/* Header with Badge */}
                        <View style={styles.planHeader}>
                          <View style={styles.planTitleContainer}>
                            <ThemedText style={[styles.planName, { color: planColors.text }]}>
                              {plan.name}
                            </ThemedText>
                            {isRecommended && (
                              <View style={styles.recommendedBadge}>
                                <LinearGradient
                                  colors={['#F59E0B', '#D97706']}
                                  style={styles.badgeGradient}
                                >
                                  <Ionicons name="star" size={12} color="#FFFFFF" />
                                  <ThemedText style={styles.badgeText}>
                                    {t('auth.planSelection.recommended')}
                                  </ThemedText>
                                </LinearGradient>
                              </View>
                            )}
                          </View>
                          
                          <View style={styles.priceContainer}>
                            <ThemedText style={[styles.planPrice, { color: planColors.text }]}>
                              {isFree ? t('auth.planSelection.free') : `ETB ${plan.amount}`}
                            </ThemedText>
                            {!isFree && (
                              <ThemedText style={[styles.planDuration, { color: planColors.subtitle }]}>
                              </ThemedText>
                            )}
                          </View>
                        </View>

                        {/* Description */}
                        <View style={styles.descriptionContainer}>
                          <ThemedText style={[styles.planDescription, { color: planColors.subtitle }]}>
                            {plan.description}
                          </ThemedText>
                        </View>

                        {/* Features or Remark */}
                        {plan.remark && (
                          <View style={styles.remarkContainer}>
                            <Ionicons name="checkmark-circle" size={16} color={planColors.accent} />
                            <ThemedText style={[styles.planRemark, { color: planColors.subtitle }]}>
                              {plan.remark}
                            </ThemedText>
                          </View>
                        )}

                        {/* Selection Indicator */}
                        {isSelected && (
                          <View style={styles.selectedIndicator}>
                            <LinearGradient
                              colors={['#10B981', '#059669']}
                              style={styles.selectedIndicatorGradient}
                            >
                              <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                            </LinearGradient>
                          </View>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  );
                })}
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
    gap: 20,
    paddingBottom: 24,
  },
  planCard: {
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 20,
    minHeight: 140,
    backgroundColor: 'transparent',
  },
  planCardGradient: {
    flex: 1,
    padding: 24,
    borderRadius: 18,
  },
  recommendedBadge: {
    marginLeft: 8,
  },
  badgeGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planName: {
    fontSize: 22,
    fontWeight: '700',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 6,
  },
  planDuration: {
    fontSize: 15,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 20,
  },
  planDescription: {
    fontSize: 16,
    lineHeight: 24,
    opacity: 0.85,
  },
  remarkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  planRemark: {
    fontSize: 14,
    flex: 1,
    opacity: 0.9,
    fontWeight: '500',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'transparent',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  totalAmount: {
    paddingTop: 15,
    fontSize: 28,
    fontWeight: '800',
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
  selectedIndicatorGradient: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
}); 