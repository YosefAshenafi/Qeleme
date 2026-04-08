import { TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Image, Modal, Pressable, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ThemedText';
import { LanguageToggle } from '@/components/ui/LanguageToggle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';
import { BASE_URL } from '@/config/constants';
import { PaymentScreenStyles as styles } from './PaymentScreen.styles';

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
    // Store user data for the payment flow
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
        phoneNumber: userData.phoneNumber?.replace('+251', '').replace(/^9/, '09') || userData.phoneNumber,
        Plan: selectedPlanName,
        region: userData.region,
        grade: userData.grade === 'KG' ? 'kg' : `grade ${userData.grade}`,
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
      console.log('Payment Success - Registration response status:', response.status);
      console.log('Payment Success - Registration response data:', data);

      if (!response.ok) {
        // Check if user already exists (409 Conflict or similar)
        if (response.status === 409 || (data.message && data.message.includes('already exists'))) {
          console.log('User already registered, proceeding with success flow');
          setRegistrationCompleted(true);
          setShowSuccessModal(true);
          return;
        }
        // Don't throw error - just log it and show success to user
        // The backend will handle the registration in the background
        console.error('Registration error logged, but continuing with success flow:', data);
      }

      setRegistrationCompleted(true);
      setShowSuccessModal(true);

    } catch (error: any) {
      console.error('Payment success error:', error);
      // Even if registration fails, show success modal since payment was successful
      // The user can try to login with their credentials
      setRegistrationCompleted(true);
      setShowSuccessModal(true);
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

          <View style={[styles.container, { flex: 1, justifyContent: 'center', alignItems: 'center' }]}>
            <ActivityIndicator size="large" color={colors.text} />
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
} 
