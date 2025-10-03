import { StyleSheet, TouchableOpacity, View, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../../config/constants';
import { initiatePayment } from '../../services/chappaService';
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
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [selectedPlans, setSelectedPlans] = useState<SelectedPlan[]>([]);
  const params = useLocalSearchParams();
  const userData = params.userData ? JSON.parse(decodeURIComponent(params.userData as string)) : null;

  // Debug: Log the received userData
  console.log('Plan Selection - Received userData:', userData);
  console.log('Plan Selection - userData keys:', userData ? Object.keys(userData) : 'No userData');
  console.log('Plan Selection - userData.fullName:', userData?.fullName);
  console.log('Plan Selection - userData.role:', userData?.role);
  console.log('Plan Selection - userData.childrenData:', userData?.childrenData);
  console.log('Plan Selection - userData.phoneNumber:', userData?.phoneNumber);
  console.log('Plan Selection - userData.grade:', userData?.grade);
  console.log('Plan Selection - userData.region:', userData?.region);

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
      
      // Debug: Log the full plan structure
      console.log('Raw plans data:', data);
      console.log('First plan structure:', data[0]);
      
      // Debug: Log the plans before sorting
      console.log('Plans before sorting:', data.map((p: PaymentPlan) => ({ name: p.name, duration: p.durationInMonths, id: getPlanId(p) })));
      
      // Separate paid and free plans
      const paidPlans = data.filter((plan: PaymentPlan) => plan.durationInMonths > 0);
      const freePlans = data.filter((plan: PaymentPlan) => plan.durationInMonths === 0);
      
      // Sort paid plans by duration in descending order
      const sortedPaidPlans = paidPlans.sort((a: PaymentPlan, b: PaymentPlan) => {
        return b.durationInMonths - a.durationInMonths;
      });
      
      // Combine free plans first, then paid plans
      const sortedPlans = [...freePlans, ...sortedPaidPlans];
      
      // Debug: Log the plans after sorting
      console.log('Plans after sorting:', sortedPlans.map((p: PaymentPlan) => ({ name: p.name, duration: p.durationInMonths, id: getPlanId(p) })));
      
      setPlans(sortedPlans);
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.errors.fetchPlansFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getPlanId = (plan: PaymentPlan) => {
    // Try different possible ID field names
    return plan._id || (plan as any).id || (plan as any).planId || plan.name;
  };

  const getDefaultDescription = (plan: PaymentPlan) => {
    // Use the plan's own description if available, otherwise fall back to a generic description
    if (plan.description && plan.description.trim()) {
      return plan.description;
    }
    
    // Fallback: generate description based on duration
    const duration = plan.durationInMonths;
    if (duration === 0) {
      return t('auth.planSelection.descriptions.free');
    } else {
      return `${duration} ${t('auth.planSelection.months')} ${t('auth.planSelection.descriptions.fullAccess')}`;
    }
  };

  const getTotalCost = () => {
    if (!selectedPlans.length) return 0;
    
    const plan = plans.find(p => getPlanId(p) === selectedPlans[0].plan);
    console.log('Found plan for total calculation:', plan);
    console.log('Selected plan ID:', selectedPlans[0].plan);
    console.log('Available plan IDs:', plans.map(p => getPlanId(p)));
    
    // Ensure we don't modify the original plan data
    const baseAmount = plan ? (typeof plan.amount === 'string' ? parseFloat(plan.amount) : plan.amount) : 0;
    
    if (userData.role === 'parent' && userData.numberOfChildren > 0) {
      const total = Number(baseAmount) * Number(userData.numberOfChildren);
      console.log('Parent total calculation:', { baseAmount, numberOfChildren: userData.numberOfChildren, total });
      return total.toFixed(2);
    } else {
      console.log('Student total calculation:', { baseAmount });
      return Number(baseAmount).toFixed(2);
    }
  };

  const getTotalCostAsNumber = () => {
    const totalCost = getTotalCost();
    return typeof totalCost === 'string' ? parseFloat(totalCost) : totalCost;
  };

  const getPricePerChild = () => {
    if (!selectedPlans.length) return 0;
    
    const plan = plans.find(p => p._id === selectedPlans[0].plan);
    return plan?.amount || 0;
  };

  const handlePlanSelect = (plan: PaymentPlan) => {
    const planId = getPlanId(plan);
    console.log('Full plan object:', plan);
    console.log('Plan selected:', { 
      planId: planId, 
      planName: plan.name, 
      amount: plan.amount,
      allKeys: Object.keys(plan)
    });
    // For both parents and students, just select the plan (replace any existing selection)
    setSelectedPlans([{ plan: planId }]);
  };

  const getButtonText = () => {
    if (selectedPlans.length === 0) return t('auth.planSelection.continue');
    
    const selectedPlan = plans.find(p => getPlanId(p) === selectedPlans[0].plan);
    if (!selectedPlan) return t('auth.planSelection.continue');
    
    // Check if it's a free plan (amount is 0 or durationInMonths is 999 for free)
    const isFreePlan = selectedPlan.amount === 0 || selectedPlan.durationInMonths === 999 || selectedPlan.durationInMonths === 0;
    
    return isFreePlan ? t('auth.planSelection.finish') : t('auth.planSelection.pay');
  };

  const handleContinue = async () => {
    try {
      if (!selectedPlans.length) {
        throw new Error('No plan selected');
      }

      // Set loading state to disable button
      setIsProcessingPayment(true);

      const selectedPlanId = selectedPlans[0].plan;
      const selectedPlan = plans.find(p => getPlanId(p) === selectedPlanId);
      
      if (!selectedPlan) {
        throw new Error('Selected plan not found');
      }

      // Check if it's a free plan
      const isFreePlan = selectedPlan.amount === 0 || selectedPlan.durationInMonths === 999 || selectedPlan.durationInMonths === 0;
      
      if (isFreePlan) {
        // For free plans, register directly without payment
        
        // Validate that grade is present for student registration
        if (userData.role === 'student' && !userData.grade) {
          console.error('Grade is missing from userData:', userData);
          Alert.alert(
            'Grade Required',
            'Please select your grade before proceeding. You will be redirected to the signup screen.',
            [
              {
                text: 'OK',
                onPress: () => router.replace('/(auth)/signup'),
                style: 'default'
              }
            ],
            {
              cancelable: false
            }
          );
          return;
        }

        // For parent registration, validate that children have grades
        if (userData.role === 'parent') {
          const childrenWithoutGrades = userData.childrenData?.filter((child: any) => !child.grade) || [];
          if (childrenWithoutGrades.length > 0) {
            console.error('Children missing grades:', childrenWithoutGrades);
            Alert.alert(
              'Grade Required',
              'Please select grades for all children before proceeding. You will be redirected to the signup screen.',
              [
                {
                  text: 'OK',
                  onPress: () => router.replace('/(auth)/signup'),
                  style: 'default'
                }
              ],
              {
                cancelable: false
              }
            );
            return;
          }
        }
        
        const endpoint = `${BASE_URL}/api/auth/register/student`;
        const requestBody = {
          name: userData.fullName,
          username: userData.username,
          password: userData.password,
          grade: userData.grade === 'KG' ? 'kg' : `grade ${userData.grade}`,
          phoneNumber: userData.phoneNumber?.replace('+251', '').replace(/^9/, '09') || userData.phoneNumber,
          Plan: selectedPlan.name,
          region: userData.region
        };

        console.log('Plan Selection - Sending registration request:', requestBody);
        console.log('Plan Selection - Region being sent:', userData.region);

        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(requestBody),
        });

        const data = await response.json();

        if (!response.ok) {
          console.error('Registration failed:', data);
          throw new Error(data.message || data.error || 'Failed to register user');
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
        
        return;
      }

      // For paid plans, proceed with payment
      const amount = getTotalCostAsNumber();

      // Use Chappa service to initiate payment
      const orderId = `ORDER_${Date.now()}`;

      console.log('Initiating payment with Chappa service');
      console.log('Order ID:', orderId);
      console.log('Amount:', parseFloat(amount.toString()));
      console.log('Phone:', userData.phoneNumber);

      const paymentData = await initiatePayment(
        parseFloat(amount.toString()),
        orderId,
        userData.phoneNumber,
        selectedPlan.durationInMonths,
        userData.email || 'customer@qelem.com',
        userData.fullName
      );
      
      console.log('Payment response:', paymentData);
      console.log('Payment response status:', paymentData.success);

      if (paymentData.success && paymentData.paymentUrl) {
        // Navigate to payment screen with the Chappa URL
        router.push({
          pathname: '/(auth)/payment',
          params: {
            userData: encodeURIComponent(JSON.stringify(userData)),
            selectedPlanId: selectedPlanId,
            selectedPlanName: selectedPlan.name,
            amount: amount.toString(),
            paymentUrl: paymentData.paymentUrl,
            orderId: orderId
          }
        });
      } else {
        console.log('Payment failed:', paymentData);
        throw new Error(paymentData.error || 'Failed to initiate payment');
      }

    } catch (error) {
      console.error('Payment failed:', error);
    } finally {
      // Clear loading state
      setIsProcessingPayment(false);
    }
  };

  const getPlanColors = (plan: PaymentPlan) => {
    const isSelected = selectedPlans.some(p => p.plan === getPlanId(plan));
    
    if (isDarkMode) {
      switch (plan.durationInMonths) {
        case 12:
          return {
            background: isSelected ? '#1E40AF' : '#1E3A8A',
            border: isSelected ? '#60A5FA' : '#3B82F6',
            text: '#FFFFFF',
            subtitle: '#E5E7EB',
            gradient: ['#1E40AF', '#1E3A8A'],
            accent: '#F59E0B',
            activeBorder: '#60A5FA'
          };
        case 6:
          return {
            background: isSelected ? '#059669' : '#047857',
            border: isSelected ? '#34D399' : '#10B981',
            text: '#FFFFFF',
            subtitle: '#E5E7EB',
            gradient: ['#059669', '#047857'],
            accent: '#10B981',
            activeBorder: '#34D399'
          };
        case 3:
          return {
            background: isSelected ? '#EA580C' : '#C2410C',
            border: isSelected ? '#FB923C' : '#F97316',
            text: '#FFFFFF',
            subtitle: '#E5E7EB',
            gradient: ['#EA580C', '#C2410C'],
            accent: '#F97316',
            activeBorder: '#FB923C'
          };
        case 1:
          return {
            background: isSelected ? '#7C3AED' : '#6D28D9',
            border: isSelected ? '#A78BFA' : '#8B5CF6',
            text: '#FFFFFF',
            subtitle: '#E5E7EB',
            gradient: ['#7C3AED', '#6D28D9'],
            accent: '#8B5CF6',
            activeBorder: '#A78BFA'
          };
        case 0:
          return {
            background: isSelected ? '#374151' : '#1F2937',
            border: isSelected ? '#9CA3AF' : '#6B7280',
            text: '#FFFFFF',
            subtitle: '#E5E7EB',
            gradient: ['#374151', '#1F2937'],
            accent: '#6B7280',
            activeBorder: '#9CA3AF'
          };
        default:
          return {
            background: isSelected ? '#374151' : '#1F2937',
            border: isSelected ? '#9CA3AF' : '#6B7280',
            text: '#FFFFFF',
            subtitle: '#E5E7EB',
            gradient: ['#374151', '#1F2937'],
            accent: '#6B7280',
            activeBorder: '#9CA3AF'
          };
      }
    } else {
      switch (plan.durationInMonths) {
        case 12:
          return {
            background: isSelected ? '#EFF6FF' : '#F8FAFC',
            border: isSelected ? '#3B82F6' : '#2563EB',
            text: '#1E40AF',
            subtitle: '#64748B',
            gradient: ['#EFF6FF', '#F8FAFC'],
            accent: '#F59E0B',
            activeBorder: '#3B82F6'
          };
        case 6:
          return {
            background: isSelected ? '#ECFDF5' : '#F0FDF4',
            border: isSelected ? '#10B981' : '#059669',
            text: '#047857',
            subtitle: '#64748B',
            gradient: ['#ECFDF5', '#F0FDF4'],
            accent: '#10B981',
            activeBorder: '#10B981'
          };
        case 3:
          return {
            background: isSelected ? '#FFEDD5' : '#FFF7ED',
            border: isSelected ? '#F97316' : '#EA580C',
            text: '#C2410C',
            subtitle: '#64748B',
            gradient: ['#FFEDD5', '#FFF7ED'],
            accent: '#F97316',
            activeBorder: '#F97316'
          };
        case 1:
          return {
            background: isSelected ? '#F5F3FF' : '#FAF5FF',
            border: isSelected ? '#8B5CF6' : '#7C3AED',
            text: '#6D28D9',
            subtitle: '#64748B',
            gradient: ['#F5F3FF', '#FAF5FF'],
            accent: '#8B5CF6',
            activeBorder: '#8B5CF6'
          };
        case 0:
          return {
            background: isSelected ? '#F8FAFC' : '#F9FAFB',
            border: isSelected ? '#64748B' : '#475569',
            text: '#374151',
            subtitle: '#64748B',
            gradient: ['#F8FAFC', '#F9FAFB'],
            accent: '#64748B',
            activeBorder: '#64748B'
          };
        default:
          return {
            background: isSelected ? '#F8FAFC' : '#F9FAFB',
            border: isSelected ? '#64748B' : '#475569',
            text: '#374151',
            subtitle: '#64748B',
            gradient: ['#F8FAFC', '#F9FAFB'],
            accent: '#64748B',
            activeBorder: '#64748B'
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
            </View>

            <View style={styles.plansContainer}>
              {plans.map((plan, index) => {
                const planColors = getPlanColors(plan);
                const isRecommended = plan.durationInMonths === 6;
                const isSelected = selectedPlans.some(p => p.plan === getPlanId(plan));
                const isFree = plan.durationInMonths === 0;
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.planCard,
                      {
                        borderColor: isSelected ? planColors.activeBorder : planColors.border,
                        borderWidth: isSelected ? 3 : 2,
                        shadowColor: isDarkMode ? '#000000' : '#000000',
                        shadowOffset: {
                          width: 0,
                          height: isSelected ? 8 : 4,
                        },
                        shadowOpacity: isDarkMode ? 0.4 : 0.15,
                        shadowRadius: isSelected ? 16 : 12,
                        elevation: isSelected ? 16 : 12,
                      }
                    ]}
                    onPress={() => handlePlanSelect(plan)}
                  >
                    <LinearGradient
                      colors={planColors.gradient as [string, string]}
                      style={styles.planCardGradient}
                    >
                      {/* Recommended Badge - Ribbon Style */}
                      {isRecommended && (
                        <View style={styles.ribbonBadge}>
                          <LinearGradient
                            colors={['#8B5CF6', '#7C3AED']}
                            style={styles.ribbonGradient}
                          >
                            <Ionicons name="star" size={12} color="#FFFFFF" />
                            <ThemedText style={styles.ribbonText}>
                              {t('auth.planSelection.recommended')}
                            </ThemedText>
                          </LinearGradient>
                        </View>
                      )}

                      {/* Header */}
                      <View style={styles.planHeader}>
                        <View style={styles.planTitleContainer}>
                          <ThemedText style={[styles.planName, { color: planColors.text }]}>
                            {plan.name}
                          </ThemedText>
                        </View>
                        
                        <View style={styles.priceContainer}>
                          <ThemedText style={[styles.planPrice, { color: planColors.text }]}>
                            {isFree ? t('auth.planSelection.free') : `ETB ${typeof plan.amount === 'string' ? parseFloat(plan.amount).toFixed(2) : plan.amount.toFixed(2)}`}
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
                            {plan.description || getDefaultDescription(plan)}
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

                      {/* Active Border Indicator */}
                      {isSelected && (
                        <View style={[styles.activeBorderIndicator, { borderColor: planColors.activeBorder }]} />
                      )}
                    </LinearGradient>
                  </TouchableOpacity>
                );
              })}
            </View>

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
                  selectedPlans.length > 0 && !isProcessingPayment && styles.continueButtonActive,
                  isProcessingPayment && styles.continueButtonProcessing
                ]}
                onPress={handleContinue}
                disabled={selectedPlans.length === 0 || isProcessingPayment}
              >
                <LinearGradient
                  colors={isProcessingPayment ? ['#9CA3AF', '#6B7280'] : ['#4F46E5', '#7C3AED']}
                  style={styles.buttonGradient}
                >
                  {isProcessingPayment ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="small" color="#FFFFFF" style={styles.loadingIndicator} />
                      <ThemedText style={styles.buttonText}>
                        {t('common.processing')}
                      </ThemedText>
                    </View>
                  ) : (
                    <ThemedText style={styles.buttonText}>
                      {getButtonText()}
                    </ThemedText>
                  )}
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
    padding: 12,
  },
  header: {
    marginBottom: 12,
  },
  backButton: {
    marginBottom: 8,
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
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
    paddingTop: 6,
  },
  subtitle: {
    fontSize: 12,
  },
  plansContainer: {
    flex: 1,
    gap: 6,
    paddingBottom: 6,
  },
  planCard: {
    borderRadius: 12,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 8,
    minHeight: 95,
    backgroundColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  planCardGradient: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
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
    marginBottom: 6,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  planName: {
    fontSize: 16,
    fontWeight: '700',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 2,
    paddingTop: 4,
    marginTop: 2,
  },
  planDuration: {
    fontSize: 11,
    fontWeight: '500',
  },
  descriptionContainer: {
    marginBottom: 4,
  },
  planDescription: {
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.85,
  },
  remarkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 6,
  },
  planRemark: {
    fontSize: 9,
    flex: 1,
    opacity: 0.9,
    fontWeight: '500',
  },
  ribbonBadge: {
    position: 'absolute',
    bottom: 5,
    right: -28,
    zIndex: 10,
    transform: [{ rotate: '-45deg' }],
  },
  ribbonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 0,
    gap: 4,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    minWidth: 80,
    justifyContent: 'center',
  },
  ribbonText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  activeBorderIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    backgroundColor: 'transparent',
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    backgroundColor: 'transparent',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  totalAmount: {
    paddingTop: 8,
    fontSize: 20,
    fontWeight: '800',
  },
  continueButton: {
    width: '100%',
    height: 44,
    borderRadius: 12,
    overflow: 'hidden',
    opacity: 0.5,
  },
  continueButtonActive: {
    opacity: 1,
  },
  continueButtonProcessing: {
    opacity: 0.8,
  },
  buttonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingIndicator: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
}); 