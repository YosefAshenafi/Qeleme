import { StyleSheet, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Image, Modal, Pressable, Alert } from 'react-native';
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
import PaymentButton from '@/components/PaymentButton';

export default function PaymentScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const params = useLocalSearchParams();
  const userData = JSON.parse(params.userData as string);
  const [plans, setPlans] = useState<PaymentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

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

  const handlePaymentSuccess = async (amount: number, planId: string) => {
    try {
      if (!userData) {
        throw new Error('No user data available');
      }

      const endpoint = `${BASE_URL}/api/auth/register/student`;

      const requestBody = {
        fullName: userData.fullName,
        username: userData.username,
        password: userData.password,
        grade: userData.grade,
        parentId: "0",
        paymentPlanId: planId,
        amountPaid: amount
      };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Qelem-Mobile-App',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to register user');
      }

      await response.json();

      setShowSuccessModal(true);

      setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
    } catch (error: any) {
      Alert.alert(t('common.error'), t('auth.errors.registrationFailed'));
    }
  };

  const handlePaymentFailure = () => {
    Alert.alert(t('common.error'), t('auth.errors.paymentFailed'));
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
        <View style={styles.container}>
          <View style={styles.languageToggleContainer}>
            <LanguageToggle colors={colors} />
          </View>

          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <ThemedText style={styles.title}>
              {t('payment.title')}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {t('payment.subtitle')}
            </ThemedText>
          </View>

          <ScrollView style={styles.container}>
            <View style={styles.paymentOptionsContainer}>
              {plans.map((plan) => (
                <PaymentButton
                  key={plan._id}
                  amount={plan.amount}
                  onSuccess={() => handlePaymentSuccess(plan.amount, plan._id)}
                  onFailure={handlePaymentFailure}
                >
                  <LinearGradient
                    colors={[isDarkMode ? '#4B3A7A' : '#6B54AE', isDarkMode ? '#4B3A7A' : '#6B54AE']}
                    style={styles.paymentOptionGradient}
                  >
                    <View style={styles.paymentOptionHeader}>
                      <ThemedText style={[styles.paymentOptionTitle, { color: '#FFFFFF' }]}>
                        {plan.name}
                      </ThemedText>
                      {plan.durationInMonths >= 6 && (
                        <View style={[styles.badge, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                          <ThemedText style={[styles.badgeText, { color: '#FFFFFF' }]}>
                            {t('payment.plans.bestValue')}
                          </ThemedText>
                        </View>
                      )}
                    </View>
                    <View style={styles.featuresContainer}>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>
                          {plan.description}
                        </ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>
                          {plan.remark}
                        </ThemedText>
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <ThemedText style={[styles.paymentOptionPrice, { color: '#FFFFFF' }]}>
                        ETB {plan.amount}
                      </ThemedText>
                      <ThemedText style={[styles.paymentOptionPeriod, { color: '#FFFFFF' }]}>
                        {plan.durationInMonths} {t('payment.plans.months')}
                      </ThemedText>
                    </View>
                    <View style={[styles.getStartedButton, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                      <ThemedText style={styles.getStartedButtonText}>
                        {t('payment.plans.getStarted')}
                      </ThemedText>
                    </View>
                  </LinearGradient>
                </PaymentButton>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>

      {/* Success Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showSuccessModal}
        onRequestClose={() => setShowSuccessModal(false)}
      >
        <Pressable 
          style={styles.modalOverlay}
          onPress={() => setShowSuccessModal(false)}
        >
          <View style={[styles.modalContent, {
            backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF',
            borderColor: isDarkMode ? '#3C3C3E' : '#E5E7EB',
          }]}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
            </View>
            <ThemedText style={[styles.modalTitle, { color: colors.text }]}>
              {t('payment.success.title')}
            </ThemedText>
            <ThemedText style={[styles.modalMessage, { color: colors.text + '80' }]}>
              {t('payment.success.message')}
            </ThemedText>
          </View>
        </Pressable>
      </Modal>
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
  paymentOptionsContainer: {
    gap: 16,
  },
  paymentOptionGradient: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentOptionTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  featuresContainer: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    fontSize: 14,
    flex: 1,
  },
  priceContainer: {
    marginTop: 16,
    marginBottom: 24,
  },
  paymentOptionPrice: {
    fontSize: 24,
    fontWeight: '700',
  },
  paymentOptionPeriod: {
    fontSize: 14,
    marginTop: 4,
  },
  getStartedButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  languageToggleContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    marginTop: 8,
    marginRight: 16,
    zIndex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalIconContainer: {
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
}); 