import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, RefreshControl, Alert, Linking, Image, Modal } from 'react-native';
import { useColorScheme } from '../hooks/useColorScheme';
import { Colors } from '../constants/Colors';
import { IconSymbol, IconSymbolName } from '../components/ui/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AccountSettings } from '../components/profile/AccountSettings';
import { ThemeChooser } from '../components/profile/ThemeChooser';
import { DeleteAccount } from '../components/profile/DeleteAccount';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { BASE_URL } from '../config/constants';
import Constants from 'expo-constants';
import ActivityTrackingService from '../services/activityTrackingService';
import { PasswordInput } from '../components/ui/PasswordInput';

interface AccordionItemProps {
  title: string;
  icon: IconSymbolName;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  colors: any;
}

type MenuItem = {
  title: string;
  icon: IconSymbolName;
  content?: React.ReactNode;
  action?: () => void;
  customContent?: React.ReactNode;
  showChevron?: boolean;
  subtitle?: string;
};

const AccordionItem: React.FC<AccordionItemProps> = ({ title, icon, children, isOpen, onToggle, colors }) => {
  const rotateAnim = React.useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.timing(rotateAnim, {
      toValue: isOpen ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  return (
    <View style={[styles.accordionItem, { backgroundColor: colors.card }]}>
      <TouchableOpacity
        style={styles.accordionHeader}
        onPress={onToggle}
      >
        <View style={styles.accordionHeaderLeft}>
          <IconSymbol name={icon} size={24} color={colors.tint} />
          <Text style={[styles.accordionTitle, { color: colors.text }]}>{title}</Text>
        </View>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <IconSymbol name="chevron.right" size={20} color={colors.text} />
        </Animated.View>
      </TouchableOpacity>
      {isOpen && (
        <View style={styles.accordionContent}>
          {children}
        </View>
      )}
    </View>
  );
};

export default function ProfileScreen() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout, user, login } = useAuth();
  const { t, i18n } = useTranslation();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [showVersionModal, setShowVersionModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [showResetSuccessModal, setShowResetSuccessModal] = useState(false);
  const [showResetErrorModal, setShowResetErrorModal] = useState(false);
  const [resetErrorMessage, setResetErrorMessage] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const colors = getColors(isDarkMode);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Fetch updated user data
      const response = await fetch(`${BASE_URL}/api/auth/student/profile`, {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('@auth_token')}`,
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
        }
      });
      
      if (response.ok) {
        const updatedUserData = await response.json();
        await login(updatedUserData);
      }
    } catch (error) {
      // Silently handle refresh error
    }
    setRefreshing(false);
  }, []);

  const getBilingualDate = (date: Date) => {
    const monthNames: Record<string, Record<string, string>> = {
      en: {
        '1': 'January',
        '2': 'February',
        '3': 'March',
        '4': 'April',
        '5': 'May',
        '6': 'June',
        '7': 'July',
        '8': 'August',
        '9': 'September',
        '10': 'October',
        '11': 'November',
        '12': 'December'
      },
      am: {
        '1': 'ጥር',
        '2': 'የካቲት',
        '3': 'መጋቢት',
        '4': 'ሚያዝያ',
        '5': 'ግንቦት',
        '6': 'ሰኔ',
        '7': 'ሐምሌ',
        '8': 'ነሐሴ',
        '9': 'መስከረም',
        '10': 'ጥቅምት',
        '11': 'ህዳር',
        '12': 'ታህሳስ'
      }
    };

    const month = date.getMonth() + 1;
    const day = date.getDate();
    const year = date.getFullYear();
    const lang = i18n.language === 'am' ? 'am' : 'en';
    
    return `${day} ${monthNames[lang][month.toString()]} ${year}`;
  };

  const getPaymentPlanWithMonth = (plan: string) => {
    const lang = i18n.language === 'am' ? 'am' : 'en';
    const monthText = lang === 'am' ? 'ወራት' : 'months';
    
    // Extract the number of months from the plan (e.g., "Premium 3" -> 3)
    const monthCount = parseInt(plan.match(/\d+/)?.[0] || '0');
    
    if (monthCount > 0 && user?.lastPaymentDate) {
      const lastPayment = new Date(user.lastPaymentDate);
      const nextPayment = new Date(lastPayment);
      nextPayment.setMonth(nextPayment.getMonth() + monthCount);
      
      const nextPaymentDate = getBilingualDate(nextPayment);
      return `${plan} (${monthCount} ${monthText}) - ${t('profile.nextPayment', { defaultValue: 'Next payment' })}: ${nextPaymentDate}`;
    }
    
    return `${plan} (${monthText})`;
  };

  const profileData = React.useMemo(() => ({
    englishName: user?.fullName || '',
    username: user?.username ? `@${user.username}` : t('profile.username', { defaultValue: '@username' }),
    grade: user?.grade || t('profile.grade', { defaultValue: 'Grade 12' }),
    role: t('profile.role'),
    joinDate: user?.joinDate ? getBilingualDate(new Date(user.joinDate)) : getBilingualDate(new Date()),
    paymentPlan: user?.paymentPlan ? getPaymentPlanWithMonth(user.paymentPlan) : getPaymentPlanWithMonth(t('profile.paymentPlan', { defaultValue: 'Free Plan' })),
  }), [t, i18n.language, user]);

  const capitalizeName = (name: string) => {
    return name.split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch(err => {
      Alert.alert('Error', 'Could not open link');
    });
  };


  const menuItems: MenuItem[] = React.useMemo(() => [
    { 
      title: t('profile.accountSettings'),
      icon: 'person.fill' as const,
      content: <AccountSettings colors={colors} profileData={profileData} />
    },
    { 
      title: t('profile.theme'),
      icon: isDarkMode ? 'moon.fill' : 'sun.max.fill' as const,
      action: () => {
        toggleTheme();
      },
      content: <ThemeChooser colors={colors} />
    },
    { 
      title: t('profile.about'),
      icon: 'info.circle.fill' as const,
      action: () => {
        setShowAboutModal(true);
      }
    },
    { 
      title: t('profile.contactUs'),
      icon: 'phone.fill' as const,
      content: (
        <View style={styles.contactContainer}>
          <View style={styles.contactSection}>
            <View style={styles.contactRow}>
              <View style={[styles.contactIconContainer, { backgroundColor: colors.tint + '15' }]}>
                <IconSymbol name="phone.fill" size={18} color={colors.tint} />
              </View>
              <Text style={[styles.contactSectionTitle, { color: colors.text }]}>Phone</Text>
            </View>
            
            <View style={styles.contactLinksContainer}>
              <TouchableOpacity 
                style={[styles.contactLink, { backgroundColor: colors.tint + '10' }]}
                onPress={() => Linking.openURL('tel:+251911243867')}
                activeOpacity={0.7}
              >
                <Text style={[styles.contactItem, { color: colors.tint }]}>+251 911 243 867</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.contactLink, { backgroundColor: colors.tint + '10' }]}
                onPress={() => Linking.openURL('tel:+251911557216')}
                activeOpacity={0.7}
              >
                <Text style={[styles.contactItem, { color: colors.tint }]}>+251 911 557 216</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.contactLink, { backgroundColor: colors.tint + '10' }]}
                onPress={() => Linking.openURL('tel:+251913727300')}
                activeOpacity={0.7}
              >
                <Text style={[styles.contactItem, { color: colors.tint }]}>+251 913 727 300</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <View style={[styles.contactSection, { marginTop: 20 }]}>
            <View style={styles.contactRow}>
              <View style={[styles.contactIconContainer, { backgroundColor: colors.tint + '15' }]}>
                <IconSymbol name="envelope.fill" size={18} color={colors.tint} />
              </View>
              <Text style={[styles.contactSectionTitle, { color: colors.text }]}>Email</Text>
            </View>
            
            <TouchableOpacity 
              style={[styles.contactLink, { backgroundColor: colors.tint + '10', marginTop: 8 }]}
              onPress={() => Linking.openURL('mailto:contact@qelem.net')}
              activeOpacity={0.7}
            >
              <Text style={[styles.contactItem, { color: colors.tint }]}>contact@qelem.net</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
    },
    { 
      title: t('profile.version'),
      icon: 'app.badge' as const,
      subtitle: Constants.expoConfig?.version || '1.0.0',
      showChevron: false,
      action: () => {
        setShowVersionModal(true);
      }
    },
    { 
      title: t('profile.resetApp'),
      icon: 'house.fill' as const, 
      action: () => {
        setShowResetModal(true);
      }
    },
    { 
      title: t('profile.logout'),
      icon: 'rectangle.portrait.and.arrow.right' as const, 
      action: logout
    },
  ], [t, i18n.language, isDarkMode, colors, profileData]);

  const handleAccordionToggle = (title: string) => {
    setOpenAccordion(openAccordion === title ? null : title);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style="light" backgroundColor={colors.tint} />
      
      {/* Clean Header */}
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.right" size={24} color={colors.background} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: colors.background }]}>
            {t('profile.title')}
          </Text>
        </View>
        <View style={[styles.headerRight, { paddingBottom: 10 }]}>
          <LanguageToggle colors={{ card: colors.background, text: colors.tint }} />
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        {/* User Info Card */}
        <View style={[styles.userInfoCard, { backgroundColor: colors.card }]}>
          <View style={styles.userInfoHeader}>
            <View style={[styles.userAvatar, { backgroundColor: colors.tint + '20' }]}>
              <IconSymbol name="person.fill" size={32} color={colors.tint} />
            </View>
            <View style={styles.userInfoText}>
              <Text style={[styles.userName, { color: colors.text }]}>
                {capitalizeName(profileData.englishName)}
              </Text>
              <Text style={[styles.userUsername, { color: colors.text + '80' }]}>{profileData.username}</Text>
              <View style={styles.userBadges}>
                <View style={[styles.userBadge, { backgroundColor: colors.tint + '20' }]}>
                  <Text style={[styles.userBadgeText, { color: colors.tint }]}>{profileData.role}</Text>
                </View>
                <View style={[styles.userBadge, { backgroundColor: colors.tint + '20' }]}>
                  <Text style={[styles.userBadgeText, { color: colors.tint }]}>{profileData.grade}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Settings Menu */}
        <View style={styles.settingsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('profile.settings.title', { defaultValue: 'Settings' })}
          </Text>
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => (
              item.customContent ? (
                <TouchableOpacity
                  key={index}
                  style={[styles.menuItem, { backgroundColor: colors.card }]}
                  onPress={item.action}
                  accessibilityLabel={`Switch to ${isDarkMode ? 'light' : 'dark'} theme`}
                  accessibilityRole="switch"
                  accessibilityState={{ selected: isDarkMode }}
                >
                  {item.customContent}
                </TouchableOpacity>
              ) : (
                item.action ? (
                  <TouchableOpacity
                    key={index}
                    style={[styles.menuItem, { backgroundColor: colors.card }]}
                    onPress={item.action}
                  >
                    <View style={styles.menuItemLeft}>
                      <View style={[styles.menuIconContainer, { backgroundColor: colors.tint + '15' }]}>
                        <IconSymbol name={item.icon} size={20} color={colors.tint} />
                      </View>
                      <View style={styles.menuTextContainer}>
                        <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
                        {item.subtitle && (
                          <Text style={[styles.menuItemSubtitle, { color: colors.text + '60' }]}>
                            {item.subtitle}
                          </Text>
                        )}
                      </View>
                    </View>
                    {item.showChevron !== false && (
                      <IconSymbol name="chevron.right" size={16} color={colors.text + '60'} />
                    )}
                  </TouchableOpacity>
                ) : (
                  <AccordionItem
                    key={index}
                    title={item.title}
                    icon={item.icon}
                    isOpen={openAccordion === item.title}
                    onToggle={() => handleAccordionToggle(item.title)}
                    colors={colors}
                  >
                    {item.content}
                  </AccordionItem>
                )
              )
            ))}
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.settingsContainer}>
          <DeleteAccount 
            colors={colors} 
            userPhoneNumber={user?.phoneNumber} 
          />
        </View>
      </ScrollView>

      {/* About Qelem Modal */}
      <Modal
        visible={showAboutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAboutModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowAboutModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalContent, { backgroundColor: colors.card }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.modalIconContainer, { backgroundColor: colors.tint + '15' }]}>
                <IconSymbol name="info.circle.fill" size={32} color={colors.tint} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('profile.about')}
              </Text>
              <TouchableOpacity
                onPress={() => setShowAboutModal(false)}
                style={[styles.modalCloseButton, { backgroundColor: colors.cardAlt }]}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <Text style={[styles.modalText, { color: colors.text }]}>
                {t('profile.aboutInfo', 'Qelem is an innovative educational platform designed to enhance learning through interactive content, personalized experiences, and comprehensive progress tracking.')}
              </Text>
              
              <View style={[styles.modalFeatureSection, { backgroundColor: colors.cardAlt }]}>
                <Text style={[styles.modalFeatureTitle, { color: colors.tint }]}>
                  {t('profile.aboutFeatures', 'Key Features')}
                </Text>
                <View style={styles.modalFeatureList}>
                  <View style={styles.modalFeatureItem}>
                    <IconSymbol name="questionmark.circle.fill" size={20} color={colors.tint} />
                    <Text style={[styles.modalFeatureText, { color: colors.text }]}>
                      {t('profile.aboutFeature1', 'Interactive MCQ Questions')}
                    </Text>
                  </View>
                  <View style={styles.modalFeatureItem}>
                    <IconSymbol name="rectangle.stack.fill" size={20} color={colors.tint} />
                    <Text style={[styles.modalFeatureText, { color: colors.text }]}>
                      {t('profile.aboutFeature2', 'Flashcards for Active Learning')}
                    </Text>
                  </View>
                  <View style={styles.modalFeatureItem}>
                    <IconSymbol name="chart.bar.fill" size={20} color={colors.tint} />
                    <Text style={[styles.modalFeatureText, { color: colors.text }]}>
                      {t('profile.aboutFeature4', 'Comprehensive Progress Tracking')}
                    </Text>
                  </View>
                </View>
              </View>
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.tint }]}
              onPress={() => setShowAboutModal(false)}
            >
              <Text style={styles.modalButtonText}>
                {t('common.close', 'Close')}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* App Version Modal */}
      <Modal
        visible={showVersionModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowVersionModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowVersionModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalContent, { backgroundColor: colors.card }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.modalIconContainer, { backgroundColor: colors.tint + '15' }]}>
                <IconSymbol name="app.badge" size={32} color={colors.tint} />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('profile.version')}
              </Text>
              <TouchableOpacity
                onPress={() => setShowVersionModal(false)}
                style={[styles.modalCloseButton, { backgroundColor: colors.cardAlt }]}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <View style={[styles.versionContainer, { backgroundColor: colors.cardAlt }]}>
                <Text style={[styles.versionLabel, { color: colors.text + '80' }]}>
                  {t('profile.version', 'App Version')}
                </Text>
                <Text style={[styles.versionNumber, { color: colors.tint }]}>
                  {Constants.expoConfig?.version || '1.0.0'}
                </Text>
              </View>
              <Text style={[styles.modalText, { color: colors.text }]}>
                {t('profile.versionInfo', 'You are using the latest version of Qelem. Keep learning and growing!')}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: colors.tint }]}
              onPress={() => setShowVersionModal(false)}
            >
              <Text style={styles.modalButtonText}>
                {t('common.close', 'Close')}
              </Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Reset App Modal */}
      <Modal
        visible={showResetModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowResetModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalContent, { backgroundColor: colors.card }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#F44336' + '15' }]}>
                <IconSymbol name="house.fill" size={32} color="#F44336" />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('common.confirmation', 'Confirmation')}
              </Text>
              <TouchableOpacity
                onPress={() => setShowResetModal(false)}
                style={[styles.modalCloseButton, { backgroundColor: colors.cardAlt }]}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.modalText, { color: colors.text }]}>
                {t('profile.resetConfirmation', 'Are you sure you want to reset app data? This will clear all your progress and reports, but you will remain logged in.')}
              </Text>
              <View style={[styles.warningBox, { backgroundColor: '#F44336' + '15', borderColor: '#F44336' + '40' }]}>
                <IconSymbol name="info.circle.fill" size={20} color="#F44336" />
                <Text style={[styles.warningText, { color: '#F44336' }]}>
                  {t('profile.resetWarning', 'This action cannot be undone.')}
                </Text>
              </View>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButtonSecondary, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                onPress={() => setShowResetModal(false)}
              >
                <Text style={[styles.modalButtonSecondaryText, { color: colors.text }]}>
                  {t('common.cancel', 'Cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#F44336' }]}
                onPress={() => {
                  setShowResetModal(false);
                  setShowResetPasswordModal(true);
                }}
              >
                <Text style={styles.modalButtonText}>
                  {t('common.confirm', 'Confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Reset App Password Modal */}
      <Modal
        visible={showResetPasswordModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setShowResetPasswordModal(false);
          setResetPassword('');
        }}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => {
            setShowResetPasswordModal(false);
            setResetPassword('');
          }}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalContent, { backgroundColor: colors.card }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#F44336' + '15' }]}>
                <IconSymbol name="lock.fill" size={32} color="#F44336" />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('profile.enterPassword', 'Enter Password')}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowResetPasswordModal(false);
                  setResetPassword('');
                }}
                style={[styles.modalCloseButton, { backgroundColor: colors.cardAlt }]}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.modalText, { color: colors.text }]}>
                {t('profile.resetPasswordPrompt', 'Please enter your password to reset app data. This will clear all your progress and reports, but you will remain logged in.')}
              </Text>
              
              <View style={styles.passwordContainer}>
                <PasswordInput
                  value={resetPassword}
                  onChangeText={setResetPassword}
                  placeholder={t('profile.enterPassword', 'Enter Password')}
                  colors={colors}
                  isDarkMode={isDarkMode}
                  style={styles.passwordInputStyle}
                />
              </View>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButtonSecondary, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                onPress={() => {
                  setShowResetPasswordModal(false);
                  setResetPassword('');
                }}
              >
                <Text style={[styles.modalButtonSecondaryText, { color: colors.text }]}>
                  {t('common.cancel', 'Cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#F44336', opacity: isResetting || !resetPassword.trim() ? 0.6 : 1 }]}
                onPress={async () => {
                  if (!resetPassword.trim()) {
                    return;
                  }
                  
                  setIsResetting(true);
                  try {
                    // Get authentication token
                    const token = await AsyncStorage.getItem('@auth_token');
                    if (!token) {
                      throw new Error('No authentication token found');
                    }

                    // Verify password using the delete account endpoint pattern
                    // We'll send confirmation: false to verify password without deleting
                    try {
                      const verifyResponse = await fetch(`${BASE_URL}/api/account`, {
                        method: 'DELETE',
                        headers: {
                          'Authorization': `Bearer ${token}`,
                          'Accept': 'application/json',
                          'Content-Type': 'application/json',
                          'X-Requested-With': 'XMLHttpRequest',
                        },
                        body: JSON.stringify({ 
                          password: resetPassword,
                          confirmation: false // Set to false so we only verify, don't delete
                        }),
                      });

                      const responseData = await verifyResponse.json().catch(() => null);
                      
                      // If status is 400 with message about confirmation, password was correct
                      // If status is 401/403, password is invalid
                      // If status is 200, password is verified (but we won't actually delete)
                      if (verifyResponse.status === 401 || verifyResponse.status === 403) {
                        throw new Error(responseData?.message || 'Invalid password');
                      }
                      
                      // For status 400 (confirmation required) or 200, password is verified
                      // Status 400 typically means "password correct but confirmation needed"
                      if (verifyResponse.status === 400 && responseData?.message) {
                        // Check if the error is about confirmation (password was correct)
                        if (responseData.message.toLowerCase().includes('confirmation') || 
                            responseData.message.toLowerCase().includes('confirm')) {
                          // Password is correct, just needs confirmation
                          // We'll proceed with reset
                        } else {
                          // Some other error, might be invalid password
                          throw new Error(responseData.message || 'Invalid password');
                        }
                      }
                    } catch (verifyError) {
                      // If it's already an Error with message, re-throw it
                      if (verifyError instanceof Error) {
                        throw verifyError;
                      }
                      // Otherwise, it's a network error or unexpected response
                      throw new Error('Failed to verify password. Please try again.');
                    }

                    // Password verified, now clear only report/activity data
                    const trackingService = ActivityTrackingService.getInstance();
                    await trackingService.clearAllData();
                    
                    setShowResetPasswordModal(false);
                    setResetPassword('');
                    setShowResetSuccessModal(true);
                  } catch (error) {
                    console.error('Error resetting app:', error);
                    setResetErrorMessage(
                      error instanceof Error ? error.message : t('profile.resetAppError', 'Failed to reset app data. Please try again.')
                    );
                    setShowResetErrorModal(true);
                  } finally {
                    setIsResetting(false);
                  }
                }}
                disabled={isResetting || !resetPassword.trim()}
              >
                <Text style={styles.modalButtonText}>
                  {isResetting ? t('common.processing', 'Processing...') : t('common.confirm', 'Confirm')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Reset App Success Modal */}
      <Modal
        visible={showResetSuccessModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetSuccessModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowResetSuccessModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalContent, { backgroundColor: colors.card }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#4CAF50' + '15' }]}>
                <IconSymbol name="checkmark.circle.fill" size={32} color="#4CAF50" />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('common.success', 'Success')}
              </Text>
              <TouchableOpacity
                onPress={() => setShowResetSuccessModal(false)}
                style={[styles.modalCloseButton, { backgroundColor: colors.cardAlt }]}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.modalText, { color: colors.text }]}>
                {t('profile.resetAppSuccess', 'App data has been reset successfully. Your progress and reports have been cleared.')}
              </Text>
              <View style={[styles.warningBox, { backgroundColor: '#4CAF50' + '15', borderColor: '#4CAF50' + '40' }]}>
                <IconSymbol name="info.circle.fill" size={20} color="#4CAF50" />
                <Text style={[styles.warningText, { color: '#4CAF50' }]}>
                  {t('profile.resetAppSuccessNote', 'You are still logged in and can continue using the app.')}
                </Text>
              </View>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#4CAF50' }]}
                onPress={() => setShowResetSuccessModal(false)}
              >
                <Text style={styles.modalButtonText}>
                  {t('common.ok', 'OK')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Reset App Error Modal */}
      <Modal
        visible={showResetErrorModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowResetErrorModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowResetErrorModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.modalContent, { backgroundColor: colors.card }]}
          >
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.modalIconContainer, { backgroundColor: '#F44336' + '15' }]}>
                <IconSymbol name="exclamationmark.triangle.fill" size={32} color="#F44336" />
              </View>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('common.error', 'Error')}
              </Text>
              <TouchableOpacity
                onPress={() => setShowResetErrorModal(false)}
                style={[styles.modalCloseButton, { backgroundColor: colors.cardAlt }]}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBody}>
              <Text style={[styles.modalText, { color: colors.text }]}>
                {resetErrorMessage}
              </Text>
            </View>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#F44336' }]}
                onPress={() => setShowResetErrorModal(false)}
              >
                <Text style={styles.modalButtonText}>
                  {t('common.ok', 'OK')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  logo: {
    width: 150,
    height: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  userInfoCard: {
    margin: 20,
    marginTop: 10,
    padding: 20,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  userInfoText: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  userUsername: {
    fontSize: 14,
    marginBottom: 8,
  },
  userBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  userBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  userBadgeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  settingsContainer: {
    marginHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  menuContainer: {
    gap: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuItemSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  accordionItem: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  accordionContent: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  themeMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  themeMenuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  themeToggleWrapper: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  themeToggleText: {
    fontSize: 14,
    fontWeight: '500',
  },
  contactContainer: {
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  contactSection: {
    marginBottom: 0,
  },
  contactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  contactIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 0,
  },
  contactLinksContainer: {
    gap: 8,
    paddingLeft: 44,
  },
  contactLink: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactItem: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    gap: 12,
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 20,
    maxHeight: 400,
  },
  modalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  modalFeatureSection: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  modalFeatureTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  modalFeatureList: {
    gap: 12,
  },
  modalFeatureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalFeatureText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
  modalButton: {
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  versionContainer: {
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  versionLabel: {
    fontSize: 14,
    marginBottom: 8,
  },
  versionNumber: {
    fontSize: 32,
    fontWeight: '700',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  modalButtonSecondary: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  modalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 16,
  },
  warningText: {
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  passwordContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  passwordInputStyle: {
    marginBottom: 0,
  },
}); 