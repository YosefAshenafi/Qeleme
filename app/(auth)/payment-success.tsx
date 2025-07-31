import React, { useEffect, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/components/ThemedText';
import { LanguageToggle } from '@/components/ui/LanguageToggle';

export default function PaymentSuccessScreen() {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const params = useLocalSearchParams();

  useEffect(() => {
    // Handle payment success
    handlePaymentSuccess();
  }, []);

  const handlePaymentSuccess = () => {
    // Get parameters from the deep link
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

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  safeArea: { flex: 1 },
  container: { flex: 1, padding: 20 },
  languageToggleContainer: { position: 'absolute', top: 20, right: 20, zIndex: 1 },
  successContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 },
  successIconContainer: { marginBottom: 30 },
  successTitle: { fontSize: 28, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  successMessage: { fontSize: 16, textAlign: 'center', marginBottom: 40, opacity: 0.8, lineHeight: 24 },
  continueButton: { paddingVertical: 15, paddingHorizontal: 30, borderRadius: 10, alignItems: 'center' },
  continueButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
}); 