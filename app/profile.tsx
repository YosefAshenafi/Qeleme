import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Animated, RefreshControl, Alert, Linking } from 'react-native';
import { useColorScheme } from '../hooks/useColorScheme';
import { Colors } from '../constants/Colors';
import { IconSymbol, IconSymbolName } from '../components/ui/IconSymbol';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AccountSettings } from '../components/profile/AccountSettings';
import { ThemeChooser } from '../components/profile/ThemeChooser';
import { getColors } from '../constants/Colors';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { LanguageSelector } from '../components/LanguageSelector';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageToggle } from '../components/ui/LanguageToggle';
import { BASE_URL } from '../config/constants';
import Constants from 'expo-constants';

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
        Alert.alert(
          'About Qelem',
          'Qelem is an innovative educational platform designed to enhance learning through interactive content, personalized experiences, and comprehensive progress tracking.'
        );
      }
    },
    { 
      title: t('profile.version'),
      icon: 'app.badge' as const,
      subtitle: Constants.expoConfig?.version || '1.0.0',
      showChevron: false,
      action: () => {
        Alert.alert(
          t('profile.version'),
          `Version ${Constants.expoConfig?.version || '1.0.0'}`
        );
      }
    },
    { 
      title: t('profile.resetApp'),
      icon: 'house.fill' as const, 
      action: () => {
        Alert.alert(
          t('common.confirmation', { defaultValue: 'Confirmation' }),
          t('profile.resetConfirmation', { defaultValue: 'Are you sure you want to reset the app? This will take you back to the onboarding screen.' }),
          [
            {
              text: t('common.cancel', { defaultValue: 'Cancel' }),
              style: 'cancel'
            },
            {
              text: t('common.confirm', { defaultValue: 'Confirm' }),
              onPress: () => router.replace('/(auth)/onboarding'),
              style: 'destructive'
            }
          ]
        );
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
        <View style={styles.headerRight}>
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
      </ScrollView>
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
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
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
}); 