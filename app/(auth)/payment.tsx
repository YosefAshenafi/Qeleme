import { StyleSheet, TouchableOpacity, View, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import PaymentButton from '@/components/PaymentButton';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';

export default function PaymentScreen() {
  const router = useRouter();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();

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
                <ThemedText style={[styles.title, { color: colors.text }]}>{t('payment.title')}</ThemedText>
                <ThemedText style={[styles.subtitle, { color: colors.text + '80' }]}>{t('payment.subtitle')}</ThemedText>
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
                    colors={[isDarkMode ? '#2D1B4D' : '#FFFFFF', isDarkMode ? '#2D1B4D' : '#FFFFFF']}
                    style={styles.paymentOptionGradient}
                  >
                    <View style={styles.paymentOptionHeader}>
                      <ThemedText style={[styles.paymentOptionTitle, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>{t('payment.plans.freeTrial.title')}</ThemedText>
                      {/* <View style={[styles.badge, { backgroundColor: isDarkMode ? '#6D28D9' : '#EDE9FE' }]}>
                        <ThemedText style={[styles.badgeText, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>Starter</ThemedText>
                      </View> */}
                    </View>
                    <View style={styles.featuresContainer}>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                        <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>{t('payment.plans.freeTrial.features.questions')}</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                        <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>{t('payment.plans.freeTrial.features.flashcards')}</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="checkmark-circle" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                        <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>{t('payment.plans.freeTrial.features.homework')}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <ThemedText style={[styles.paymentOptionPrice, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>{t('payment.plans.freeTrial.price')}</ThemedText>
                      <ThemedText style={[styles.paymentOptionPeriod, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}></ThemedText>
                    </View>
                    <TouchableOpacity 
                      style={[styles.getStartedButton, { backgroundColor: isDarkMode ? '#6D28D9' : '#6B54AE' }]}
                      onPress={() => router.replace('/(tabs)')}
                    >
                      <ThemedText style={styles.getStartedButtonText}>{t('payment.plans.freeTrial.getStarted')}</ThemedText>
                    </TouchableOpacity>
                  </LinearGradient>
                </TouchableOpacity>

                {/* 6 Month Plan */}
                <PaymentButton
                  amount={499}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                >
                  <LinearGradient
                    colors={[isDarkMode ? '#4B3A7A' : '#6B54AE', isDarkMode ? '#4B3A7A' : '#6B54AE']}
                    style={styles.paymentOptionGradient}
                  >
                    <View style={styles.paymentOptionHeader}>
                      <ThemedText style={[styles.paymentOptionTitle, { color: '#FFFFFF' }]}>{t('payment.plans.sixMonth.title')}</ThemedText>
                      <View style={[styles.badge, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                        <ThemedText style={[styles.badgeText, { color: '#FFFFFF' }]}>{t('payment.plans.sixMonth.badge')}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.featuresContainer}>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>{t('payment.plans.sixMonth.features.questions')}</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>{t('payment.plans.sixMonth.features.flashcards')}</ThemedText>
                      </View>
                      <View style={styles.featureItem}>
                        <Ionicons name="infinite" size={20} color="#FFFFFF" />
                        <ThemedText style={[styles.featureText, { color: '#FFFFFF' }]}>{t('payment.plans.sixMonth.features.homework')}</ThemedText>
                      </View>
                    </View>
                    <View style={styles.priceContainer}>
                      <ThemedText style={[styles.paymentOptionPrice, { color: '#FFFFFF' }]}>{t('payment.plans.sixMonth.price')}</ThemedText>
                      <ThemedText style={[styles.paymentOptionPeriod, { color: '#FFFFFF' }]}>{t('payment.plans.sixMonth.period')}</ThemedText>
                    </View>
                    <View style={[styles.getStartedButton, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]}>
                      <ThemedText style={styles.getStartedButtonText}>{t('payment.plans.sixMonth.getStarted')}</ThemedText>
                    </View>
                  </LinearGradient>
                </PaymentButton>

                {/* 12 Month Plan */}
                <PaymentButton
                  amount={799}
                  onSuccess={handlePaymentSuccess}
                  onFailure={handlePaymentFailure}
                >
                  <View style={[styles.paymentOption, {
                    borderColor: isDarkMode ? '#6D28D9' : '#7C3AED',
                    borderWidth: 2,
                  }]}>
                    <LinearGradient
                      colors={[isDarkMode ? '#2D1B4D' : '#FFFFFF', isDarkMode ? '#2D1B4D' : '#FFFFFF']}
                      style={styles.paymentOptionGradient}
                    >
                      <View style={styles.paymentOptionHeader}>
                        <ThemedText style={[styles.paymentOptionTitle, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>{t('payment.plans.twelveMonth.title')}</ThemedText>
                        <View style={[styles.badge, { backgroundColor: isDarkMode ? '#6D28D9' : '#EDE9FE' }]}>
                          <ThemedText style={[styles.badgeText, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>{t('payment.plans.twelveMonth.badge')}</ThemedText>
                        </View>
                      </View>
                      <View style={styles.featuresContainer}>
                        <View style={styles.featureItem}>
                          <Ionicons name="infinite" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                          <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>{t('payment.plans.twelveMonth.features.questions')}</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                          <Ionicons name="infinite" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                          <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>{t('payment.plans.twelveMonth.features.flashcards')}</ThemedText>
                        </View>
                        <View style={styles.featureItem}>
                          <Ionicons name="infinite" size={20} color={isDarkMode ? '#A78BFA' : '#7C3AED'} />
                          <ThemedText style={[styles.featureText, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>{t('payment.plans.twelveMonth.features.homework')}</ThemedText>
                        </View>
                      </View>
                      <View style={styles.priceContainer}>
                        <ThemedText style={[styles.paymentOptionPrice, { color: isDarkMode ? '#A78BFA' : '#7C3AED' }]}>{t('payment.plans.twelveMonth.price')}</ThemedText>
                        <ThemedText style={[styles.paymentOptionPeriod, { color: isDarkMode ? '#E9D8FD' : '#4C1D95' }]}>{t('payment.plans.twelveMonth.period')}</ThemedText>
                      </View>
                      <View style={[styles.getStartedButton, { backgroundColor: isDarkMode ? '#6D28D9' : '#6B54AE' }]}>
                        <ThemedText style={styles.getStartedButtonText}>{t('payment.plans.twelveMonth.getStarted')}</ThemedText>
                      </View>
                    </LinearGradient>
                  </View>
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
  getStartedButton: {
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  getStartedButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
}); 