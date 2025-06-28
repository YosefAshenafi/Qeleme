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
import { ThemedText } from '@/components/ThemedText';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';

export default function PaymentScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const params = useLocalSearchParams();
  const userData = params.userData ? JSON.parse(decodeURIComponent(params.userData as string)) : null;
  const selectedPlanId = params.selectedPlanId as string;
  const amount = params.amount as string;
  const paymentUrl = params.paymentUrl as string;
  const orderId = params.orderId as string;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWebView, setShowWebView] = useState(true);

  useEffect(() => {
    // Store phone number for PaymentButton component
    if (userData?.phoneNumber) {
      AsyncStorage.setItem('userPhoneNumber', userData.phoneNumber);
    }
    
    // Start polling for payment status
    if (orderId) {
      pollPaymentStatus(orderId);
    }
  }, [orderId]);

  const pollPaymentStatus = async (orderId: string) => {
    // Poll for payment status every 5 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/payment/status/${orderId}`);
        const data = await response.json();
        
        console.log('Payment status check:', data);
        
        if (data.success && data.data?.status === 'SUCCESS') {
          clearInterval(interval);
          setShowWebView(false);
          await handlePaymentSuccess(parseFloat(amount), selectedPlanId);
        } else if (data.success && data.data?.status === 'FAILED') {
          clearInterval(interval);
          setShowWebView(false);
          handlePaymentFailure();
        }
      } catch (error) {
        console.error('Payment status check error:', error);
      }
    }, 5000);

    // Clear interval after 5 minutes (timeout)
    setTimeout(() => {
      clearInterval(interval);
    }, 300000);
  };

  const handlePaymentSuccess = async (amount: number, planId: string) => {
    try {
      if (!userData) {
        throw new Error('No user data available');
      }

      const endpoint = `${BASE_URL}/api/auth/register/student`;

      const requestBody = {
        name: userData.fullName,
        username: userData.username,
        password: userData.password,
        grade: userData.grade,
        phoneNumber: userData.phoneNumber?.replace('+251', '') || userData.phoneNumber,
        parentId: "0",
        Plan: parseInt(planId),
        amountPaid: amount
      };

      console.log('Payment Success - Registration request body:', requestBody);

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
        console.error('Registration failed after payment:', data);
        throw new Error(data.message || data.error || 'Failed to register user');
      }

      console.log('Registration successful after payment:', data);

      setShowSuccessModal(true);

      setTimeout(() => {
        router.replace('/(tabs)');
      }, 2000);
    } catch (error: any) {
      console.error('Payment success handler error:', error);
      Alert.alert(t('common.error'), t('auth.errors.registrationFailed'));
    }
  };

  const handlePaymentFailure = () => {
    Alert.alert(t('common.error'), t('auth.errors.paymentFailed'));
  };

  if (showWebView && paymentUrl) {
    return (
      <LinearGradient
        colors={[colors.background, colors.background]}
        style={styles.gradient}
      >
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.container}>
            <View style={styles.webviewHeader}>
              <TouchableOpacity
                style={styles.backButton}
                onPress={() => setShowWebView(false)}
              >
                <Ionicons name="arrow-back" size={24} color={colors.text} />
              </TouchableOpacity>
              <ThemedText style={styles.webviewTitle}>Complete Payment</ThemedText>
              <View style={{ width: 24 }} />
            </View>
            <WebView
              source={{ uri: paymentUrl }}
              style={styles.webview}
              onNavigationStateChange={(navState) => {
                console.log('WebView navigation state:', navState);
                console.log('Current URL:', navState.url);
              }}
              onLoadStart={() => {
                console.log('WebView load started for URL:', paymentUrl);
              }}
              onLoadEnd={() => {
                console.log('WebView load ended for URL:', paymentUrl);
              }}
              onError={(syntheticEvent) => {
                console.error('WebView error:', syntheticEvent.nativeEvent);
              }}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>
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

          <View style={styles.container}>
            <ThemedText style={styles.subtitle}>
              Redirecting to Santim Pay...
            </ThemedText>
          </View>
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
  webviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  webviewTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
  },
  webview: {
    flex: 1,
  },
}); 