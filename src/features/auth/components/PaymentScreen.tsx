import { TouchableOpacity, View, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/features/common/components/ThemedText';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import * as Linking from 'expo-linking';
import { BASE_URL, PAYMENT_SUCCESS_CALLBACK_HOST } from '@/config/constants';
import { checkPaymentStatus } from '@/features/auth/services/paymentGatewayService';
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
  const [, setShowSuccessModal] = useState(false);
  const [showWebView, setShowWebView] = useState(true);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [, setRegistrationCompleted] = useState(false);

  useEffect(() => {
    
    if (userData?.phoneNumber) {
      AsyncStorage.setItem('userPhoneNumber', userData.phoneNumber);
    }
    if (userData?.email) {
      AsyncStorage.setItem('userEmail', userData.email);
    }
    if (userData?.fullName) {
      AsyncStorage.setItem('userName', userData.fullName);
    }
    
    
    if (orderId) {
      pollPaymentStatus(orderId);
    }

    
    const checkInitialURL = async () => {
      const initialURL = await Linking.getInitialURL();
      if (initialURL && initialURL.includes('payment-success')) {
        setShowWebView(false);
        setPaymentCompleted(true);
        handlePaymentSuccess(parseFloat(amount), selectedPlanId);
      }
    };
    
    checkInitialURL();

    
    const subscription = Linking.addEventListener('url', handleDeepLink);
    
    return () => {
      subscription?.remove();
    };
  }, [orderId]);

  const handleDeepLink = (event: { url: string }) => {
    
    if (event.url.includes('payment-success')) {
      setShowWebView(false);
      setPaymentCompleted(true);
      handlePaymentSuccess(parseFloat(amount), selectedPlanId);
    }
  };

  const pollPaymentStatus = async (orderId: string) => {
    const interval = setInterval(async () => {
      try {
        const data = await checkPaymentStatus(orderId);

        const isSuccess = data.success && (
          data.data?.status === 'COMPLETED' ||
          data.data?.status === 'SUCCESS'
        );

        const isFailed = data.success && (
          data.data?.status === 'FAILED' ||
          data.data?.status === 'CANCELLED'
        );
        
        if (isSuccess) {
          clearInterval(interval);
          setShowWebView(false);
          setPaymentCompleted(true);
          await handlePaymentSuccess(parseFloat(amount), selectedPlanId);
        } else if (isFailed) {
          clearInterval(interval);
          setShowWebView(false);
          handlePaymentFailure();
        }
      } catch {
      }
    }, 5000);

    
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

      if (!response.ok) {
        
        if (response.status === 409 || (data.message && data.message.includes('already exists'))) {
          setRegistrationCompleted(true);
          setShowSuccessModal(true);
          return;
        }
        
        
      }

      setRegistrationCompleted(true);
      setShowSuccessModal(true);

    } catch {
      
      
      setRegistrationCompleted(true);
      setShowSuccessModal(true);
    }
  };

  const handlePaymentFailure = () => {
    Alert.alert(t('common.error'), t('auth.errors.paymentFailed'));
  };

  const handleFinishButton = () => {
    setShowSuccessModal(false);
    
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
                
                
                if (navState.url.includes('payment-success') ||
                    navState.url.includes(`${PAYMENT_SUCCESS_CALLBACK_HOST}/payment-success`) ||
                    navState.url.includes('success') ||
                    navState.url.includes('completed')) {
                  setShowWebView(false);
                  setPaymentCompleted(true);
                  handlePaymentSuccess(parseFloat(amount), selectedPlanId);
                }
                
                
                if (navState.url.includes('error') ||
                    navState.url.includes('failed')) {
                  setShowWebView(false);
                  handlePaymentFailure();
                }
              }}
              onLoadStart={() => {
              }}
              onLoadEnd={() => {
              }}
              onError={(syntheticEvent) => {
              }}
            />
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  
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
