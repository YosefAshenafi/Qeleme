// src/components/PaymentButton.tsx
import React, { useState } from 'react';
import { View, Button, Alert, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { initiatePayment, checkPaymentStatus } from '../services/santimPayService';
import { PaymentButtonProps } from '../types/santimPay';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from './ThemedText';

const PaymentButton: React.FC<PaymentButtonProps> = ({ 
  amount, 
  onSuccess, 
  onFailure 
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const handlePayment = async (): Promise<void> => {
    try {
      setLoading(true);
      
      // Generate a unique order ID
      const orderId = `ORDER_${Date.now()}`;
      
      // Replace with actual customer phone number
      const customerPhone = '+251913841405';

      const response = await initiatePayment(amount, orderId, customerPhone);
      
      if (response.success && response.data?.paymentUrl) {
        setPaymentUrl(response.data.paymentUrl);
      } else {
        Alert.alert('Error', 'Failed to initiate payment');
      }
    } catch (error) {
      Alert.alert('Error', 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = (navState: WebViewNavigation): void => {
    // Check if the URL contains success or failure indicators
    if (navState.url.includes('/payment/success')) {
      onSuccess?.();
    } else if (navState.url.includes('/payment/failure')) {
      onFailure?.();
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (paymentUrl) {
    return (
      <WebView
        source={{ uri: paymentUrl }}
        onNavigationStateChange={handleWebViewNavigationStateChange}
        style={styles.webview}
      />
    );
  }

  return (
      <TouchableOpacity style={styles.paymentOption} onPress={handlePayment}>
        <LinearGradient
          colors={['#4F46E5', '#7C3AED']}
          style={styles.paymentOptionGradient}
        >
          <ThemedText style={[styles.paymentOptionTitle, { color: '#FFFFFF' }]}>
            Full Version
          </ThemedText>
          <ThemedText style={[styles.paymentOptionDescription, { color: '#FFFFFF' }]}>
            Get full access to all features
          </ThemedText>
          <ThemedText style={[styles.paymentOptionPrice, { color: '#FFFFFF' }]}>
            299 ETB
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  webview: {
    flex: 1,
  },
  paymentOption: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  paymentOptionGradient: {
    padding: 24,
    gap: 8,
  },
  paymentOptionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
  },
  paymentOptionDescription: {
    fontSize: 16,
    color: '#6B7280',
  },
  paymentOptionPrice: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
  },
});

export default PaymentButton;