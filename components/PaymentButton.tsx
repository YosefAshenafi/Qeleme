// src/components/PaymentButton.tsx
import React, { useState, useEffect } from 'react';
import { View, Alert, ActivityIndicator, StyleSheet, TouchableOpacity, Dimensions, Modal, Platform } from 'react-native';
import { initiatePayment, checkPaymentStatus } from '../services/chappaService';
import { PaymentButtonProps } from '../types/chappa';
import { WebView } from 'react-native-webview';
import { BlurView } from 'expo-blur';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedText } from './ThemedText';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const WEBVIEW_WIDTH = SCREEN_WIDTH * 0.9;
const WEBVIEW_HEIGHT = SCREEN_HEIGHT * 0.7;

const PaymentButton: React.FC<PaymentButtonProps> = ({ 
  amount, 
  onSuccess, 
  onFailure,
  children 
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showWebView, setShowWebView] = useState<boolean>(false);
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [orderId, setOrderId] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');

  useEffect(() => {
    const getUserData = async () => {
      const phoneNumber = await AsyncStorage.getItem('userPhoneNumber');
      const email = await AsyncStorage.getItem('userEmail');
      const name = await AsyncStorage.getItem('userName');
      
      if (phoneNumber) {
        setCustomerPhone(phoneNumber);
      }
      if (email) {
        setCustomerEmail(email);
      }
      if (name) {
        setCustomerName(name);
      }
    };
    getUserData();
  }, []);

  const handlePayment = async (): Promise<void> => {
    try {
      if (!customerPhone) {
        Alert.alert('Error', 'Phone number not found. Please log in again.');
        return;
      }

      setLoading(true);
      
      // Generate a unique order ID
      const newOrderId = `ORDER_${Date.now()}`;
      setOrderId(newOrderId);

      const response = await initiatePayment(amount, newOrderId, customerPhone, undefined, customerEmail, customerName);
      if (response.success && response.paymentUrl) {
        setPaymentUrl(response.paymentUrl);
        setShowWebView(true);
        // Start polling for payment status
        pollPaymentStatus(newOrderId);
      } else {
        Alert.alert('Error', 'Failed to initiate payment');
      }
    } catch (error) {
      Alert.alert('Error', 'Payment initiation failed');
    } finally {
      setLoading(false);
    }
  };

  const pollPaymentStatus = async (orderId: string) => {
    // Poll for payment status every 5 seconds
    const interval = setInterval(async () => {
      try {
        const statusResponse = await checkPaymentStatus(orderId);
        if (statusResponse.success && statusResponse.data?.status === 'SUCCESS') {
          clearInterval(interval);
          setShowWebView(false);
          onSuccess?.();
        } else if (statusResponse.success && statusResponse.data?.status === 'FAILED') {
          clearInterval(interval);
          setShowWebView(false);
          onFailure?.();
        }
      } catch (error) {
        // Silently handle payment status check error
      }
    }, 5000);

    // Clear interval after 5 minutes (timeout)
    setTimeout(() => {
      clearInterval(interval);
    }, 300000);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity style={styles.paymentOption} onPress={handlePayment}>
        {children}
      </TouchableOpacity>

      <Modal
        visible={showWebView}
        transparent
        animationType="fade"
        onRequestClose={() => setShowWebView(false)}
      >
        <View style={styles.modalOverlay}>
          <BlurView intensity={20} style={styles.blurContainer}>
            <View style={styles.webviewContainer}>
              <View style={styles.webviewHeader}>
                <ThemedText style={styles.webviewTitle}>Complete Payment</ThemedText>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setShowWebView(false)}
                >
                  <ThemedText style={styles.closeButtonText}>✕</ThemedText>
                </TouchableOpacity>
              </View>
              <WebView
                source={{ uri: paymentUrl }}
                style={styles.webview}
                onNavigationStateChange={(navState) => {
                  // You can handle navigation state changes here if needed
                }}
              />
            </View>
          </BlurView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentOption: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  blurContainer: {
    width: WEBVIEW_WIDTH,
    height: WEBVIEW_HEIGHT,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  webviewContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  webviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  webviewTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  webview: {
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#6B7280',
  },
});

export default PaymentButton;