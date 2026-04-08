import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/features/common/components/ThemedText';
import { LanguageToggle } from '@/features/common/components/ui/LanguageToggle';
import { PaymentSuccessScreenStyles as styles } from './PaymentSuccessScreen.styles';

export default function PaymentSuccessScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const params = useLocalSearchParams();

  useEffect(() => {
    
    handlePaymentSuccess();
  }, []);

  const handlePaymentSuccess = () => {
    
    const status = params.status as string;
    const txRef = params.tx_ref as string;
    
    console.log('Payment success callback received:', { status, txRef });
    
    if (status === 'success' && txRef) {
      Alert.alert(
        'Payment Successful!',
        'Your payment has been processed successfully. You can now access all premium features.',
        [
          {
            text: 'Continue to App',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } else {
      Alert.alert(
        'Payment Status Unknown',
        'We received your payment callback but the status is unclear. Please contact support if you have any issues.',
        [
          {
            text: 'Continue to App',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.background]} style={styles.gradient}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.languageToggleContainer}>
            <LanguageToggle colors={colors} />
          </View>

          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={120} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
            </View>
            
            <ThemedText style={styles.successTitle}>Payment Successful!</ThemedText>
            
            <ThemedText style={styles.successMessage}>
              Your payment has been processed successfully and your account has been created.
            </ThemedText>

            <TouchableOpacity
              style={[styles.continueButton, { backgroundColor: isDarkMode ? '#A78BFA' : '#7C3AED' }]}
              onPress={() => router.replace('/(tabs)')}
            >
              <ThemedText style={styles.continueButtonText}>Continue to App</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
} 