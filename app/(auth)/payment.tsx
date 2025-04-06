import { StyleSheet, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Image, Modal, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PaymentButton from '@/components/PaymentButton';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';

export default function PaymentScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();
  const params = useLocalSearchParams();
  const userData = params.userData ? JSON.parse(params.userData as string) : null;
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handlePaymentSuccess = async (amount: number, plan: string) => {
    try {
      if (!userData) {
        throw new Error('No user data available');
      }

      const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5001';
      const endpoint = `${API_URL}/api/auth/register/student`;

      const requestBody = {
        fullName: userData.fullName,
        username: userData.username,
        password: userData.password,
        grade: userData.grade,
        parentId: "0",
        paymentPlan: plan,
        amountPaid: amount
      };

      console.log('Sending registration request to:', endpoint);
      console.log('Request body:', JSON.stringify(requestBody, null, 2));

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

      const data = await response.json();
      console.log('User registered successfully:', data);

      // Show success modal
      setShowSuccessModal(true);

      // Navigate to the main app after 2 seconds
      setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
    } catch (error: any) {
      console.error('Registration error:', error);
      // Handle registration error - you might want to show an error message to the user
    }
  };

  const handlePaymentFailure = () => {
    // Handle payment failure
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ['#1A1B2E', '#2D1B4E'] : ['#F5F3FF', '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView style={styles.scrollView}>
            <View style={styles.container}>
              <View style={styles.header}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                </TouchableOpacity>
                <ThemedText style={[styles.title, { color: colors.text }]}>{t('payment.title')}</ThemedText>
                <ThemedText style={[styles.subtitle, { color: colors.text + '80' }]}>{t('payment.subtitle')}</ThemedText>
              </View>

              <View style={styles.paymentOptionsContainer}>
                {/* Free Trial Plan */}
                <TouchableOpacity 
                  onPress={() => handlePaymentSuccess(0, 'free')} 
                  style={[styles.paymentOption, {
                    borderColor: isDarkMode ? '#6D28D9' : '#7C3AED',
                    borderWidth: 2,
                  }]}
                >
                  <LinearGradient
                    colors={[isDarkMode ? '#2D1B4D' : '#FFFFFF', isDarkMode ? '#2D1B4D' : '#FFFFFF']}
                    style={styles.paymentOptionGradient}
                  >
                    <View style={styles.paymentOptionHeader}>
                      <ThemedText style={[styles.paymentOptionTitle, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>{t('payment.plans.freeTrial.title')}</ThemedText>
                    </View>
                    <View style={styles.featuresContainer}>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                        <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>{t('payment.plans.freeTrial.features.questions')}</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                        <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>{t('payment.plans.freeTrial.features.flashcards')}</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                        <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>{t('payment.plans.freeTrial.features.homework')}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <ThemedText style={[styles.paymentOptionPrice, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>{t('payment.plans.freeTrial.price')}</ThemedText>
                      <ThemedText style={[styles.paymentOptionPeriod, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}></ThemedText>
                    </View>
                    <TouchableOpacity 
                      style={[styles.getStartedButton, { backgroundColor: isDarkMode ? '#6D28D9' : '#6B54AE' }]}
                      onPress={() => router.replace('/(tabs)')}
                    >
                      <ThemedText style={styles.getStartedButtonText}>{t('payment.plans.freeTrial.getStarted')}</ThemedText>
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>

                {/* 1 Month Plan */}
                <PaymentButton
                  amount={199}
                  onSuccess={() => handlePaymentSuccess(199, '1')}
                  onFailure={handlePaymentFailure}
                >
                  <LinearGradient
                    colors={[isDarkMode ? '#4B3A7A' : '#6B54AE', isDarkMode ? '#4B3A7A' : '#6B54AE']}
                    style={styles.paymentOptionGradient}
                  >
                    <View style={styles.paymentOptionHeader}>
                      <ThemedText style={[styles.paymentOptionTitle, { color: '#FFFFFF' }]}>{t('payment.plans.oneMonth.title')}</ThemedText>
                    </View>
                    <View style={styles.featuresContainer}>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>{t('payment.plans.oneMonth.features.questions')}</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>{t('payment.plans.oneMonth.features.flashcards')}</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>{t('payment.plans.oneMonth.features.homework')}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <ThemedText style={[styles.paymentOptionPrice, { color: '#FFFFFF' }]}>{t('payment.plans.oneMonth.price')}</ThemedText>
                      <ThemedText style={[styles.paymentOptionPeriod, { color: '#FFFFFF' }]}>{t('payment.plans.oneMonth.period')}</ThemedText>
                    </View>
                    <View style={[styles.getStartedButton, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                      <ThemedText style={styles.getStartedButtonText}>{t('payment.plans.oneMonth.getStarted')}</ThemedText>
                    </View>
                  </LinearGradient>
                </PaymentButton>

                {/* 3 Month Plan */}
                <PaymentButton
                  amount={299}
                  onSuccess={() => handlePaymentSuccess(299, '3')}
                  onFailure={handlePaymentFailure}
                >
                  <LinearGradient
                    colors={[isDarkMode ? '#4B3A7A' : '#6B54AE', isDarkMode ? '#4B3A7A' : '#6B54AE']}
                    style={styles.paymentOptionGradient}
                  >
                    <View style={styles.paymentOptionHeader}>
                      <ThemedText style={[styles.paymentOptionTitle, { color: '#FFFFFF' }]}>{t('payment.plans.threeMonth.title')}</ThemedText>
                    </View>
                    <View style={styles.featuresContainer}>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>{t('payment.plans.threeMonth.features.questions')}</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>{t('payment.plans.threeMonth.features.flashcards')}</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>{t('payment.plans.threeMonth.features.homework')}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <ThemedText style={[styles.paymentOptionPrice, { color: '#FFFFFF' }]}>{t('payment.plans.threeMonth.price')}</ThemedText>
                      <ThemedText style={[styles.paymentOptionPeriod, { color: '#FFFFFF' }]}>{t('payment.plans.threeMonth.period')}</ThemedText>
                    </View>
                    <View style={[styles.getStartedButton, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                      <ThemedText style={styles.getStartedButtonText}>{t('payment.plans.threeMonth.getStarted')}</ThemedText>
                    </View>
                  </LinearGradient>
                </PaymentButton>

                {/* 6 Month Plan */}
                <PaymentButton
                  amount={499}
                  onSuccess={() => handlePaymentSuccess(499, '6')}
                  onFailure={handlePaymentFailure}
                >
                  <LinearGradient
                    colors={[isDarkMode ? '#4B3A7A' : '#6B54AE', isDarkMode ? '#4B3A7A' : '#6B54AE']}
                    style={styles.paymentOptionGradient}
                  >
                    <View style={styles.paymentOptionHeader}>
                      <ThemedText style={[styles.paymentOptionTitle, { color: '#FFFFFF' }]}>{t('payment.plans.sixMonth.title')}</ThemedText>
                      <View style={[styles.badge, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                        <ThemedText style={[styles.badgeText, { color: '#FFFFFF' }]}>{t('payment.plans.sixMonth.badge')}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.featuresContainer}>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>{t('payment.plans.sixMonth.features.questions')}</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>{t('payment.plans.sixMonth.features.flashcards')}</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>{t('payment.plans.sixMonth.features.homework')}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <ThemedText style={[styles.paymentOptionPrice, { color: '#FFFFFF' }]}>{t('payment.plans.sixMonth.price')}</ThemedText>
                      <ThemedText style={[styles.paymentOptionPeriod, { color: '#FFFFFF' }]}>{t('payment.plans.sixMonth.period')}</ThemedText>
                    </View>
                    <View style={[styles.getStartedButton, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                      <ThemedText style={styles.getStartedButtonText}>{t('payment.plans.sixMonth.getStarted')}</ThemedText>
                    </View>
                  </LinearGradient>
                </PaymentButton>

                {/* 12 Month Plan */}
                <PaymentButton
                  amount={799}
                  onSuccess={() => handlePaymentSuccess(799, '12')}
                  onFailure={handlePaymentFailure}
                >
                  <View style={[styles.paymentOption, {
                    borderColor: isDarkMode ? '#6D28D9' : '#7C3AED',
                    borderWidth: 2,
                  }]}>
                    <LinearGradient
                      colors={[isDarkMode ? '#2D1B4D' : '#FFFFFF', isDarkMode ? '#2D1B4D' : '#FFFFFF']}
                      style={styles.paymentOptionGradient}
                    >
                      <View style={styles.paymentOptionHeader}>
                        <ThemedText style={[styles.paymentOptionTitle, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>{t('payment.plans.twelveMonth.title')}</ThemedText>
                        <View style={[styles.badge, { backgroundColor: isDarkMode ? '#6D28D9' : '#EDE9FE' }]}>
                          <ThemedText style={[styles.badgeText, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>{t('payment.plans.twelveMonth.badge')}</ThemedText>
                        </View>
                      </View>
                      <View style={styles.featuresContainer}>
                        <View style={styles.featureItem}>
                          <Ionicons name="infinite" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                          <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>{t('payment.plans.twelveMonth.features.questions')}</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                          <Ionicons name="infinite" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                          <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>{t('payment.plans.twelveMonth.features.flashcards')}</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                          <Ionicons name="infinite" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                          <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>{t('payment.plans.twelveMonth.features.homework')}</ThemedText>
                        </View>
                      </View>
                      <View style={styles.priceContainer}>
                        <ThemedText style={[styles.paymentOptionPrice, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>{t('payment.plans.twelveMonth.price')}</ThemedText>
                        <ThemedText style={[styles.paymentOptionPeriod, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>{t('payment.plans.twelveMonth.period')}</ThemedText>
                      </View>
                      <View style={[styles.getStartedButton, { backgroundColor: isDarkMode ? '#6D28D9' : '#6B54AE' }]}>
                        <ThemedText style={styles.getStartedButtonText}>{t('payment.plans.twelveMonth.getStarted')}</ThemedText>
                      </View>
                    </LinearGradient>
                  </View>
                </PaymentButton>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
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
    paddingTop: 40,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 24,
  },
  paymentOptionsContainer: {
    gap: 20,
  },
  paymentOption: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  paymentOptionGradient: {
    padding: 24,
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  paymentOptionTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    lineHeight: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  paymentOptionPrice: {
    paddingTop: 5,
    fontSize: 28,
    fontWeight: '700',
  },
  paymentOptionPeriod: {
    fontSize: 16,
  },
  getStartedButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
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