import { StyleSheet, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
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
      colors={isDarkMode ? ['#1A1B2E', '#2D1B4E'] : ['#F5F3FF', '#FFFFFF']}
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
                  <Ionicons name="arrow-back" size={24} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                </TouchableOpacity>
                <ThemedText style={[styles.title, { color: colors.text }]}>Choose Your Plan</ThemedText>
                <ThemedText style={[styles.subtitle, { color: colors.text + '80' }]}>Select the plan that best suits your learning needs</ThemedText>
              </View>

              <View style={styles.paymentOptionsContainer}>
                {/* Free Trial Plan */}
                <TouchableOpacity 
                  onPress={() => router.replace('/(tabs)')} 
                  style={[styles.paymentOption, {
                    borderColor: isDarkMode ? '#6D28D9' : '#7C3AED',
                    borderWidth: 2,
                  }]}
                >
                  <LinearGradient
                    colors={isDarkMode ? ['#2D1B4E', '#1A1B2E'] : ['#FFFFFF', '#F5F3FF']}
                    style={styles.paymentOptionGradient}
                  >
                    <View style={styles.paymentOptionHeader}>
                      <ThemedText style={[styles.paymentOptionTitle, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>Free Trial</ThemedText>
                      <View style={[styles.badge, { backgroundColor: isDarkMode ? '#6D28D9' : '#EDE9FE' }]}>
                        <ThemedText style={[styles.badgeText, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>Basic trial</ThemedText>
                      </View>
                    </View>
                    <View style={styles.featuresContainer}>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                        <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>20 Questions</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                        <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>20 Flashcards</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                        <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>20 Homework Helps</ThemedText>
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <ThemedText style={[styles.paymentOptionPrice, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>ETB 0</ThemedText>
                      <ThemedText style={[styles.paymentOptionPeriod, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}></ThemedText>
                    </View>
                  </LinearGradient>
                </TouchableOpacity>

                {/* 6 Month Plan */}
                <PaymentButton
                  amount={499}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                >
                  <LinearGradient
                    colors={['#7C3AED', '#5B21B6']}
                    style={styles.paymentOptionGradient}
                  >
                    <View style={styles.paymentOptionHeader}>
                      <ThemedText style={[styles.paymentOptionTitle, { color: '#FFFFFF' }]}>6 Month Plan</ThemedText>
                      <View style={[styles.badge, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                        <ThemedText style={[styles.badgeText, { color: '#FFFFFF' }]}>Most Popular</ThemedText>
                      </View>
                    </View>
                    <View style={styles.featuresContainer}>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>Unlimited Questions</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>Unlimited Flashcards</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>Unlimited Homework Helps</ThemedText>
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <ThemedText style={[styles.paymentOptionPrice, { color: '#FFFFFF' }]}>ETB 499</ThemedText>
                      <ThemedText style={[styles.paymentOptionPeriod, { color: '#FFFFFF' }]}>/6 months</ThemedText>
                    </View>
                  </LinearGradient>
                </PaymentButton>

                {/* 12 Month Plan */}
                <PaymentButton
                  amount={799}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                >
                  <LinearGradient
                    colors={['#4F46E5', '#3730A3']}
                    style={styles.paymentOptionGradient}
                  >
                    <View style={styles.paymentOptionHeader}>
                      <ThemedText style={[styles.paymentOptionTitle, { color: '#FFFFFF' }]}>12 Month Plan</ThemedText>
                      <View style={[styles.badge, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                        <ThemedText style={[styles.badgeText, { color: '#FFFFFF' }]}>Best Value</ThemedText>
                      </View>
                    </View>
                    <View style={styles.featuresContainer}>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>Unlimited Questions</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>Unlimited Flashcards</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>Unlimited Homework Helps</ThemedText>
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <ThemedText style={[styles.paymentOptionPrice, { color: '#FFFFFF' }]}>ETB 799</ThemedText>
                      <ThemedText style={[styles.paymentOptionPeriod, { color: '#FFFFFF' }]}>/12 months</ThemedText>
                    </View>
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
    lineHeight: 24,
  },
  paymentOptionsContainer: {
    gap: 20,
  },
  paymentOption: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  paymentOptionGradient: {
    padding: 24,
  },
  paymentOptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  paymentOptionTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  featuresContainer: {
    gap: 16,
    marginBottom: 24,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontSize: 16,
    lineHeight: 24,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  paymentOptionPrice: {
    paddingTop: 5,
    fontSize: 28,
    fontWeight: '700',
  },
  paymentOptionPeriod: {
    fontSize: 16,
  },
}); 