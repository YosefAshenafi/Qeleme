import { StyleSheet, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PaymentButton from '@/components/PaymentButton';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';

export default function PaymentScreen() {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  const handlePaymentSuccess = () => {
    router.replace('/(tabs)');
  };

  const handlePaymentFailure = () => {
    // Handle payment failure
  };

  return (
    <LinearGradient
      colors={isDarkMode ? ['#000000', '#1C1C1E'] : ['#F8F9FA', '#FFFFFF']}
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
                  <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#A0A0A5' : '#1F2937'} />
                </TouchableOpacity>
                <ThemedText style={[styles.title, { color: colors.text }]}>Choose Your Plan</ThemedText>
                <ThemedText style={[styles.subtitle, { color: colors.text + '80' }]}>Select the plan that best suits you</ThemedText>
              </View>

              <View style={styles.paymentOptionsContainer}>
                {/* Free Trial Plan */}
                <TouchableOpacity 
                  onPress={() => router.replace('/(tabs)')} 
                  style={[styles.paymentOption, {
                    borderColor: isDarkMode ? '#3C3C3E' : '#7C3AED'
                  }]}
                >
                  <LinearGradient
                    colors={isDarkMode ? ['#2C2C2E', '#1C1C1E'] : ['#F3F4F6', '#E5E7EB']}
                    style={styles.paymentOptionGradient}
                  >
                    <ThemedText style={[styles.paymentOptionTitle, { color: colors.text }]}>Free Trial</ThemedText>
                    <ThemedText style={[styles.paymentOptionDescription, { color: colors.text + '80' }]}>
                      20 Questions
                    </ThemedText>
                    <ThemedText style={[styles.paymentOptionDescription, { color: colors.text + '80' }]}>
                      20 Flashcards
                    </ThemedText>
                    <ThemedText style={[styles.paymentOptionDescription, { color: colors.text + '80' }]}>
                      20 Homework/Assignment Helps
                    </ThemedText>
                    <ThemedText style={[styles.paymentOptionPrice, { color: colors.text }]}>
                      ETB 0
                    </ThemedText>
                  </LinearGradient>
                </TouchableOpacity>

                {/* 6 Month Plan */}
                <PaymentButton
                  amount={499}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                >
                  <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    style={styles.paymentOptionGradient}
                  >
                    <ThemedText style={[styles.paymentOptionTitle, { color: '#FFFFFF' }]}>
                      6 Month Plan
                    </ThemedText>
                    <ThemedText style={[styles.paymentOptionDescription, { color: '#FFFFFF' }]}>
                      Unlimited Questions
                    </ThemedText>
                    <ThemedText style={[styles.paymentOptionDescription, { color: '#FFFFFF' }]}>
                      Unlimited Flashcards
                    </ThemedText>
                    <ThemedText style={[styles.paymentOptionDescription, { color: '#FFFFFF' }]}>
                      Unlimited Homework/Assignment Helps
                    </ThemedText>
                    <ThemedText style={[styles.paymentOptionPrice, { color: '#FFFFFF' }]}>
                      ETB 499
                    </ThemedText>
                  </LinearGradient>
                </PaymentButton>

                {/* 12 Month Plan */}
                <PaymentButton
                  amount={799}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                >
                  <LinearGradient
                    colors={['#4F46E5', '#7C3AED']}
                    style={styles.paymentOptionGradient}
                  >
                    <ThemedText style={[styles.paymentOptionTitle, { color: '#FFFFFF' }]}>
                      12 Month Plan
                    </ThemedText>
                    <ThemedText style={[styles.paymentOptionDescription, { color: '#FFFFFF' }]}>
                      Unlimited Questions
                    </ThemedText>
                    <ThemedText style={[styles.paymentOptionDescription, { color: '#FFFFFF' }]}>
                      Unlimited Flashcards
                    </ThemedText>
                    <ThemedText style={[styles.paymentOptionDescription, { color: '#FFFFFF' }]}>
                      Unlimited Homework/Assignment Helps
                    </ThemedText>
                    <ThemedText style={[styles.paymentOptionPrice, { color: '#FFFFFF' }]}>
                      ETB 799
                    </ThemedText>
                  </LinearGradient>
                </PaymentButton>
              </View>
            </View>
          </ScrollView>
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
    paddingTop: 10,
  },
  subtitle: {
    fontSize: 16,
  },
  paymentOptionsContainer: {
    gap: 16,
  },
  paymentOption: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 0.3,
  },
  paymentOptionGradient: {
    padding: 24,
    gap: 8,
  },
  paymentOptionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  paymentOptionDescription: {
    fontSize: 16,
  },
  paymentOptionPrice: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 8,
  },
}); 