import { StyleSheet, TouchableOpacity, View, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PaymentButton from '@/components/PaymentButton';

import { ThemedText } from '@/components/ThemedText';

export default function PaymentScreen() {
  const handlePaymentSuccess = () => {
    router.replace('/(tabs)');
  };

  const handlePaymentFailure = () => {
    // Handle payment failure
  };

  return (
    <LinearGradient
      colors={['#F8F9FA', '#FFFFFF']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => router.back()}
              >
                <Ionicons name="arrow-back" size={24} color="#1F2937" />
              </TouchableOpacity>
              <ThemedText style={styles.title}>Choose Your Plan</ThemedText>
              <ThemedText style={styles.subtitle}>Select the plan that best suits you</ThemedText>
            </View>

            <View style={styles.paymentOptionsContainer}>
              <TouchableOpacity 
                onPress={() => router.replace('/(tabs)')} 
                style={styles.paymentOption}
              >
                <LinearGradient
                  colors={['#F3F4F6', '#E5E7EB']}
                  style={styles.paymentOptionGradient}
                >
                  <ThemedText style={styles.paymentOptionTitle}>Free Trial</ThemedText>
                  <ThemedText style={styles.paymentOptionDescription}>
                    Try Qelem for 7 days with limited features
                  </ThemedText>
                </LinearGradient>
              </TouchableOpacity>
              <PaymentButton
                amount={299}
                onSuccess={handlePaymentSuccess}
                onFailure={handlePaymentFailure}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
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
  keyboardView: {
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
    color: '#1F2937',
    marginBottom: 8,
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  paymentOptionsContainer: {
    gap: 16,
  },
  paymentOption: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.3,
    borderColor: '#7C3AED',
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