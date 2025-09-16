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
import * as Linking from 'expo-linking';

export default function PaymentScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const params = useLocalSearchParams();
  const userData = params.userData ? JSON.parse(decodeURIComponent(params.userData as string)) : null;
  const selectedPlanId = params.selectedPlanId as string;
  const selectedPlanName = params.selectedPlanName as string;
  const amount = params.amount as string;
  const paymentUrl = params.paymentUrl as string;
  const orderId = params.orderId as string;
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showWebView, setShowWebView] = useState(true);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [registrationCompleted, setRegistrationCompleted] = useState(false);

  useEffect(() => {
    // Store user data for PaymentButton component
    if (userData?.phoneNumber) {
      AsyncStorage.setItem('userPhoneNumber', userData.phoneNumber);
    }
    if (userData?.email) {
      AsyncStorage.setItem('userEmail', userData.email);
    }
    if (userData?.fullName) {
      AsyncStorage.setItem('userName', userData.fullName);
    }
    
    // Start polling for payment status
    if (orderId) {
      pollPaymentStatus(orderId);
    }

    // Check initial URL for deep link
    const checkInitialURL = async () => {
      const initialURL = await Linking.getInitialURL();
      if (initialURL && initialURL.includes('payment-success')) {
        console.log('Initial URL contains payment-success:', initialURL);
        setShowWebView(false);
        setPaymentCompleted(true);
        handlePaymentSuccess(parseFloat(amount), selectedPlanId);
      }
    };
    
    checkInitialURL();

    // Set up deep link listener
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    return () => {
      subscription?.remove();
    };
  }, [orderId]);

  const handleDeepLink = (event: { url: string }) => {
    console.log('Deep link received:', event.url);
    
    if (event.url.includes('payment-success')) {
      console.log('Payment success deep link received');
      setShowWebView(false);
      setPaymentCompleted(true);
      handlePaymentSuccess(parseFloat(amount), selectedPlanId);
    }
  };

  const pollPaymentStatus = async (orderId: string) => {
    console.log('Starting payment status polling for orderId:', orderId);
    
    // Poll for payment status every 5 seconds
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`http://localhost:8080/verify`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tx_ref: orderId
          }),
        });
        const data = await response.json();
        
        console.log('Payment status check:', data);
        
        // Check for various success statuses
        const isSuccess = data.success && (
          data.status?.status === 'COMPLETED' || 
          data.data?.status === 'SUCCESS' ||
          data.status?.status === 'SUCCESS' ||
          data.data?.status === 'COMPLETED' ||
          data.status === 'SUCCESS' ||
          data.status === 'COMPLETED'
        );
        
        // Check for various failure statuses
        const isFailed = data.success && (
          data.status?.status === 'FAILED' || 
          data.data?.status === 'FAILED' ||
          data.status?.status === 'CANCELLED' ||
          data.data?.status === 'CANCELLED'
        );
        
        if (isSuccess) {
          console.log('Payment completed successfully via polling');
          clearInterval(interval);
          setShowWebView(false);
          setPaymentCompleted(true);
          await handlePaymentSuccess(parseFloat(amount), selectedPlanId);
        } else if (isFailed) {
          console.log('Payment failed via polling');
          clearInterval(interval);
          setShowWebView(false);
          handlePaymentFailure();
        }
      } catch (error) {
        // If the status endpoint is not available, we'll rely on the webhook callback
        // Don't clear the interval, let it continue polling
      }
    }, 5000);

    // Clear interval after 5 minutes (timeout)
    setTimeout(() => {
      clearInterval(interval);
      console.log('Payment status polling timed out');
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
        grade: userData.grade === 'KG' ? 'grade kg' : `grade ${userData.grade}`, // Format as "grade 3" or "grade kg"
        phoneNumber: userData.phoneNumber?.replace('+251', '').replace(/^9/, '09') || userData.phoneNumber, // Ensure it starts with "09"
        Plan: selectedPlanName // Use plan name from parameter
      };

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
        throw new Error(data.message || data.error || 'Failed to register user');
      }

      setRegistrationCompleted(true);
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error('Registration error:', error);
    }
  };

  const handlePaymentFailure = () => {
    Alert.alert(t('common.error'), t('auth.errors.paymentFailed'));
  };

  const handleFinishButton = () => {
    setShowSuccessModal(false);
    // Navigate to the login page instead of the main app
    router.replace('/(auth)/login');
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
                
                // Check if the user has been redirected to the success page
                if (navState.url.includes('payment-success') || 
                    navState.url.includes('trustechit.com/payment-success') ||
                    navState.url.includes('success') ||
                    navState.url.includes('completed')) {
                  console.log('Detected payment success page in WebView');
                  setShowWebView(false);
                  setPaymentCompleted(true);
                  handlePaymentSuccess(parseFloat(amount), selectedPlanId);
                }
                
                // Check if the user has been redirected to an error page
                if (navState.url.includes('webhook.site') || 
                    navState.url.includes('error') ||
                    navState.url.includes('failed')) {
                  console.log('Detected error page in WebView');
                  setShowWebView(false);
                  handlePaymentFailure();
                }
              }}
              onLoadStart={() => {
                console.log('WebView load started');
              }}
              onLoadEnd={() => {
                console.log('WebView load ended');
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

  // Show success screen when payment is completed
  if (paymentCompleted) {
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

            <View style={styles.successContainer}>
              <View style={styles.successIconContainer}>
                <Ionicons name="checkmark-circle" size={120} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
              </View>
              
              <ThemedText style={styles.successTitle}>
                Payment Successful!
              </ThemedText>
              
              <ThemedText style={styles.successMessage}>
                Your payment has been processed successfully and your account has been created. You can now access all premium features.
              </ThemedText>

              <View style={styles.paymentDetails}>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Amount Paid:</ThemedText>
                  <ThemedText style={styles.detailValue}>ETB {amount}</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Payment Method:</ThemedText>
                  <ThemedText style={styles.detailValue}>Telebirr</ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <ThemedText style={styles.detailLabel}>Order ID:</ThemedText>
                  <ThemedText style={styles.detailValue}>{orderId}</ThemedText>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.finishButton, { backgroundColor: isDarkMode ? '#A78BFA' : '#7C3AED' }]}
                onPress={handleFinishButton}
              >
                <ThemedText style={styles.finishButtonText}>Finish</ThemedText>
              </TouchableOpacity>
            </View>
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
              Redirecting to Chappa...
            </ThemedText>
          </View>
        </View>
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  successIconContainer: {
    marginBottom: 32,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
    paddingTop: 10,
  },
  successMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  paymentDetails: {
    width: '100%',
    backgroundColor: 'rgba(124, 58, 237, 0.1)',
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.7,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  finishButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  finishButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  debugButton: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginTop: 16,
  },
  debugButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
}); 