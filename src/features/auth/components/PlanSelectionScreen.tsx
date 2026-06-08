import { TouchableOpacity, View, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, Text } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { useTranslation } from 'react-i18next';
import { initiatePayment } from '@/features/auth/services/paymentGatewayService';
import { PaymentPlan } from '@/features/common/types/payment';
import { BASE_URL } from '@/config/constants';

import { ThemedText } from '@/features/common/components/ThemedText';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import { PlanSelectionScreenStyles as styles } from './PlanSelectionScreen.styles';

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

      
      const paidPlans = data.filter((plan: PaymentPlan) => plan.durationInMonths > 0 && plan.amount > 0);
      
      const sortedPlans = paidPlans.sort((a: PaymentPlan, b: PaymentPlan) => {
        return b.durationInMonths - a.durationInMonths;
      });

      setPlans(sortedPlans);
    } catch {
      Alert.alert(t('common.error'), t('auth.errors.fetchPlansFailed'));
    } finally {
      setLoading(false);
    }
  };

  const getPlanId = (plan: PaymentPlan) => {
    
    return plan._id || (plan as any).id || (plan as any).planId || plan.name;
  };

  const getDefaultDescription = (plan: PaymentPlan) => {
    
    if (plan.description && plan.description.trim()) {
      return plan.description;
    }
    
    
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
    const baseAmount = plan ? (typeof plan.amount === 'string' ? parseFloat(plan.amount) : plan.amount) : 0;
    return Number(baseAmount).toFixed(2);
  };

  const getTotalCostAsNumber = () => {
    const totalCost = getTotalCost();
    return typeof totalCost === 'string' ? parseFloat(totalCost) : totalCost;
  };

  const handlePlanSelect = (plan: PaymentPlan) => {
    const planId = getPlanId(plan);
    
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

      
      setIsProcessingPayment(true);

      const selectedPlanId = selectedPlans[0].plan;
      const selectedPlan = plans.find(p => getPlanId(p) === selectedPlanId);
      
      if (!selectedPlan) {
        throw new Error('Selected plan not found');
      }

      
      const amount = getTotalCostAsNumber();

      
      const orderId = `ORDER_${Date.now()}`;

      const paymentData = await initiatePayment(
        parseFloat(amount.toString()),
        orderId,
        userData.phoneNumber,
        selectedPlan.durationInMonths,
        userData.email || 'customer@megatest.app',
        userData.fullName
      );
      
      if (paymentData.success && paymentData.paymentUrl) {
        
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
        throw new Error(paymentData.error || 'Failed to initiate payment');
      }

    } catch {
    } finally {
      
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
          <Text style={[styles.bgLetter, styles.bgLetterLeft, { color: isDarkMode ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.2)' }]}>MegaTest</Text>
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
              <ThemedText style={[styles.title, { color: colors.text }]}>{t('auth.planSelection.chooseSubscription')}</ThemedText>
              <ThemedText style={[styles.subtitle, { color: colors.text + '80' }]}>{t('auth.planSelection.subtitleV2')}</ThemedText>
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
                      
                      <View style={styles.planHeader}>
                        <View style={styles.planTitleContainer}>
                          <ThemedText style={[styles.planName, { color: planColors.text }]}>
                            {plan.name}
                          </ThemedText>
                          {isRecommended && (
                            <ThemedText style={[styles.recommendedInlineText, { color: planColors.text }]}>
                              {t('auth.planSelection.recommendedPlan')}
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

                        
                        <View style={styles.descriptionContainer}>
                          <ThemedText style={[styles.planDescription, { color: planColors.subtitle }]}>
                            {plan.description || getDefaultDescription(plan)}
                          </ThemedText>
                        </View>

                      
                      {plan.remark && (
                        <View style={styles.remarkContainer}>
                          <Ionicons name="checkmark-circle" size={16} color={planColors.accent} />
                          <ThemedText style={[styles.planRemark, { color: planColors.subtitle }]}>
                            {plan.remark}
                          </ThemedText>
                        </View>
                      )}

                      
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
