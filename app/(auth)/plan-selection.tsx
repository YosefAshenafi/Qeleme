import { StyleSheet, TouchableOpacity, View, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { BASE_URL } from '../../config/constants';
import { initiatePayment } from '../../services/chappaService';
import { PaymentPlan } from '@/types/payment';

import { ThemedText } from '@/components/ThemedText';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

// Helper function to generate parent credentials using datetime-based values
const generateParentCredentials = (phoneNumber: string, childrenData?: any[]): { name: string; username: string; password: string; region: string } => {
  const timestamp = Date.now();
  const dateStr = new Date(timestamp).toISOString().replace(/[-:T.]/g, '').slice(0, 14); // YYYYMMDDHHmmss format
  
  // Clean phone number (remove +251, leading 0, etc.)
  const cleanPhone = phoneNumber.replace(/^\+251/, '').replace(/^0/, '').replace(/[^0-9]/g, '').slice(-9);
  
  // Generate name: Parent_YYYYMMDDHHmmss
  const name = `Parent_${dateStr}`;
  
  // Generate username: phone_timestamp
  const username = `parent_${cleanPhone}_${timestamp}`;
  
  // Generate password: timestamp-based random string
  const password = `Pwd${timestamp}${Math.random().toString(36).substring(2, 10)}`;
  
  // Use first child's region, or default to "Addis Ababa"
  const region = childrenData && childrenData.length > 0 && childrenData[0].region 
    ? childrenData[0].region 
    : 'Addis Ababa';
  
  return { name, username, password, region };
};

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
  const plansScrollRef = useRef<ScrollView>(null);
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
      
      // Filter out free plans and only show paid plans
      const paidPlans = data.filter((plan: PaymentPlan) => plan.durationInMonths > 0 && plan.amount > 0);
      
      // Sort paid plans by duration in descending order
      const sortedPlans = paidPlans.sort((a: PaymentPlan, b: PaymentPlan) => {
        return b.durationInMonths - a.durationInMonths;
      });
      
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
    requestAnimationFrame(() => {
      plansScrollRef.current?.scrollToEnd({ animated: true });
    });
  };

  const getButtonText = () => {
    if (selectedPlans.length === 0) return t('auth.planSelection.continue');
    return t('auth.planSelection.pay');
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

      // All plans are paid plans, proceed with payment
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
    const duration = plan.durationInMonths;

    if (isDarkMode) {
      const darkByDuration =
        duration >= 12
          ? { base: ['#0B2E80', '#123A9A'], surface: '#0F2C70', border: '#6EA8FF', accent: '#9CC4FF' }
          : duration >= 6
            ? { base: ['#0E4A92', '#1766B8'], surface: '#0F467F', border: '#73B8FF', accent: '#9CD0FF' }
            : duration >= 3
              ? { base: ['#4B3E9E', '#6D5FC4'], surface: '#43388A', border: '#A99BFF', accent: '#C7BFFF' }
              : { base: ['#1F6E57', '#2A8A6F'], surface: '#1C644F', border: '#72CFAF', accent: '#A6E6CF' };

      return {
        background: darkByDuration.surface,
        border: isSelected ? darkByDuration.border : '#2B4A8A',
        text: '#EAF2FF',
        subtitle: '#B6C7E6',
        gradient: isSelected ? darkByDuration.base : ['#1B2434', '#141B28'],
        accent: darkByDuration.accent,
        activeBorder: darkByDuration.border,
      };
    }

    const lightByDuration =
      duration >= 12
        ? { grad: ['#DCE9FF', '#CFE0FF'], surface: '#ECF3FF', border: '#0F4BD7', text: '#0D3A9E', sub: '#4D6FAF' }
        : duration >= 6
          ? { grad: ['#E5F3FF', '#D4E9FF'], surface: '#EEF6FF', border: '#2D7EDC', text: '#135D9F', sub: '#4E7FAF' }
          : duration >= 3
            ? { grad: ['#F1ECFF', '#E5DAFF'], surface: '#F7F3FF', border: '#7A6AE6', text: '#4E43B5', sub: '#756CB4' }
            : { grad: ['#EFFFF9', '#DFF9ED'], surface: '#F3FFF9', border: '#4DBB8A', text: '#1F8A62', sub: '#4F9279' };

    return {
      background: lightByDuration.surface,
      border: isSelected ? lightByDuration.border : '#CFE0FF',
      text: lightByDuration.text,
      subtitle: lightByDuration.sub,
      gradient: isSelected ? lightByDuration.grad : ['#F8FBFF', '#EEF4FF'],
      accent: lightByDuration.border,
      activeBorder: lightByDuration.border,
    };
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ThemedText>{t('common.loading')}</ThemedText>
      </View>
    );
  }

  return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: isDarkMode ? '#101216' : '#F1F2F4' }]}>
        <View pointerEvents="none" style={styles.bgLettersLayer}>
          <Text style={[styles.bgLetter, styles.bgLetterLeft, { color: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.2)' }]}>M+</Text>
          <Text style={[styles.bgLetter, styles.bgLetterRight, { color: isDarkMode ? 'rgba(255,255,255,0.018)' : 'rgba(255,255,255,0.16)' }]}>M</Text>
        </View>
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
              <ThemedText style={[styles.title, { color: colors.text }]}>Choose Subscription</ThemedText>
              <ThemedText style={[styles.subtitle, { color: colors.text + '80' }]}>Pick a plan that fits your learning journey.</ThemedText>
            </View>

            <ScrollView
              ref={plansScrollRef}
              style={styles.scrollContent}
              contentContainerStyle={styles.scrollContentContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.plansContainer}>
                {plans.map((plan, index) => {
                const planColors = getPlanColors(plan);
                const isRecommended = plan.durationInMonths === 6;
                const isSelected = selectedPlans.some(p => p.plan === getPlanId(plan));
                
                return (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.planCard,
                      {
                        borderColor: isSelected ? planColors.activeBorder : planColors.border,
                        borderWidth: isSelected ? 2 : 1.2,
                        shadowColor: '#0F4BD7',
                        shadowOffset: { width: 0, height: isSelected ? 8 : 4 },
                        shadowOpacity: isSelected ? 0.22 : 0.12,
                        shadowRadius: isSelected ? 12 : 8,
                        elevation: isSelected ? 12 : 6,
                      },
                    ]}
                    onPress={() => handlePlanSelect(plan)}
                  >
                    <View style={[styles.planAccentBar, { backgroundColor: planColors.accent }]} />
                    <LinearGradient
                      colors={planColors.gradient as [string, string]}
                      style={styles.planCardGradient}
                    >
                      {/* Header */}
                      <View style={styles.planHeader}>
                        <View style={styles.planTitleContainer}>
                          <ThemedText style={[styles.planName, { color: planColors.text }]}>
                            {plan.name}
                          </ThemedText>
                          {isRecommended && (
                            <ThemedText style={[styles.recommendedInlineText, { color: planColors.text }]}>
                              (Recommended Plan)
                            </ThemedText>
                          )}
                        </View>
                        
                        <View style={styles.priceContainer}>
                          <ThemedText style={[styles.planPrice, { color: planColors.text }]}>
                            ETB {typeof plan.amount === 'string' ? parseFloat(plan.amount).toFixed(2) : plan.amount.toFixed(2)}
                          </ThemedText>
                          <ThemedText style={[styles.planDuration, { color: planColors.accent }]}>
                            {plan.durationInMonths} {t('auth.planSelection.months')}
                          </ThemedText>
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
                    colors={isProcessingPayment ? ['#9CA3AF', '#6B7280'] : ['#0F4BD7', '#4E7CFF']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0.5 }}
                    end={{ x: 1, y: 0.5 }}
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
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  bgLettersLayer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    overflow: 'hidden',
  },
  bgLetter: {
    position: 'absolute',
    fontSize: 360,
    fontWeight: '800',
    lineHeight: 360,
  },
  bgLetterLeft: {
    left: -52,
    top: 44,
    transform: [{ rotate: '-7deg' }],
  },
  bgLetterRight: {
    right: -78,
    bottom: -74,
    transform: [{ rotate: '7deg' }],
  },
  keyboardView: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
    paddingTop: 8,
    zIndex: 1,
  },
  header: {
    marginBottom: 8,
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
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    marginBottom: 4,
    marginTop: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 2,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 18,
  },
  plansContainer: {
    gap: 8,
    paddingBottom: 8,
  },
  planCard: {
    borderRadius: 18,
    position: 'relative',
    overflow: 'hidden',
    marginBottom: 8,
    minHeight: 102,
    backgroundColor: 'transparent',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  planAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
    zIndex: 5,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  planCardGradient: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
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
    marginBottom: 8,
  },
  planTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
    paddingRight: 8,
  },
  planName: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  planPrice: {
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  planDuration: {
    fontSize: 11,
    fontWeight: '600',
    opacity: 0.95,
  },
  descriptionContainer: {
    marginBottom: 6,
  },
  planDescription: {
    fontSize: 12.5,
    lineHeight: 17,
    opacity: 0.9,
    fontWeight: '500',
  },
  remarkContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(15, 75, 215, 0.12)',
    borderRadius: 8,
    marginTop: 4,
  },
  planRemark: {
    fontSize: 11,
    flex: 1,
    opacity: 0.95,
    fontWeight: '600',
  },
  recommendedInlineText: {
    fontSize: 12,
    fontWeight: '700',
    opacity: 0.85,
    fontStyle: 'italic',
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
    borderTopWidth: 1.5,
    borderTopColor: 'rgba(15, 75, 215, 0.18)',
    backgroundColor: 'transparent',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  continueButton: {
    width: '100%',
    height: 54,
    borderRadius: 28,
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
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
}); 