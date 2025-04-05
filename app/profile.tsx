import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Animated, RefreshControl, Alert } from 'react-native';
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
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LanguageToggle } from '../components/ui/LanguageToggle';

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
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState([
    { label: t('profile.stats.mcqsCompleted'), value: '0', icon: 'questionmark.circle.fill' as const },
    { label: t('profile.stats.flashcardsClicked'), value: '0', icon: 'rectangle.stack.fill' as const },
    { label: t('profile.stats.homeworkQuestions'), value: '0', icon: 'message.fill' as const },
    { label: t('profile.stats.studyHours'), value: '0', icon: 'clock.fill' as const },
  ]);
  const colors = getColors(isDarkMode);

  // Update stats when language changes
  useEffect(() => {
    setStats([
      { label: t('profile.stats.mcqsCompleted'), value: stats[0].value, icon: 'questionmark.circle.fill' as const },
      { label: t('profile.stats.flashcardsClicked'), value: stats[1].value, icon: 'rectangle.stack.fill' as const },
      { label: t('profile.stats.homeworkQuestions'), value: stats[2].value, icon: 'message.fill' as const },
      { label: t('profile.stats.studyHours'), value: stats[3].value, icon: 'clock.fill' as const },
    ]);
  }, [t, i18n.language]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    try {
      // Fetch updated user data
      const response = await fetch('http://localhost:5001/api/auth/student/profile', {
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('@auth_token')}`
        }
      });
      
      if (response.ok) {
        const updatedUserData = await response.json();
        await login(updatedUserData);
      }

      await Promise.all([
        loadProfileImage(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadProfileImage();
    loadStats();
  }, [t]);

  const loadProfileImage = async () => {
    try {
      const imageUri = await AsyncStorage.getItem('profileImage');
      if (imageUri) {
        setProfileImage(imageUri);
      }
    } catch (error) {
      console.error(t('profile.errors.loadingImage'), error);
    }
  };

  const loadStats = async () => {
    try {
      const activitiesJson = await AsyncStorage.getItem('recentActivities');
      if (activitiesJson) {
        const activities = JSON.parse(activitiesJson);
        
        // Calculate MCQs completed
        const mcqCount = activities.filter((activity: any) => activity.type === 'mcq').length;
        
        // Calculate flashcards clicked
        const flashcardCount = activities.filter((activity: any) => activity.type === 'flashcard').length;
        
        // Calculate homework questions
        const homeworkCount = activities.filter((activity: any) => activity.type === 'homework').length;
        
        // Calculate study hours
        const studyHours = activities
          .filter((activity: any) => activity.type === 'study')
          .reduce((total: number, activity: any) => {
            const hours = parseInt(activity.duration?.replace('h', '') || '0');
            return total + hours;
          }, 0);

        setStats([
          { label: t('profile.stats.mcqsCompleted'), value: mcqCount.toString(), icon: 'questionmark.circle.fill' as const },
          { label: t('profile.stats.flashcardsClicked'), value: flashcardCount.toString(), icon: 'rectangle.stack.fill' as const },
          { label: t('profile.stats.homeworkQuestions'), value: homeworkCount.toString(), icon: 'message.fill' as const },
          { label: t('profile.stats.studyHours'), value: studyHours.toString(), icon: 'clock.fill' as const },
        ]);
      }
    } catch (error) {
      console.error(t('profile.errors.loadingStats'), error);
    }
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert(t('profile.errors.imagePermission'));
        return;
      }

      // Pick the image
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        // Save the image URI
        await AsyncStorage.setItem('profileImage', result.assets[0].uri);
        setProfileImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert(t('profile.errors.imagePicking'));
    }
  };

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
    englishName: user?.fullName || t('profile.englishName', { defaultValue: 'Yosef Ashenafi' }),
    username: user?.username ? `@${user.username}` : t('profile.username', { defaultValue: '@username' }),
    grade: user?.grade || t('profile.grade', { defaultValue: 'Grade 12' }),
    role: t('profile.role'),
    joinDate: user?.joinDate ? getBilingualDate(new Date(user.joinDate)) : getBilingualDate(new Date()),
    paymentPlan: user?.paymentPlan ? getPaymentPlanWithMonth(user.paymentPlan) : getPaymentPlanWithMonth(t('profile.paymentPlan', { defaultValue: 'Free Plan' })),
  }), [t, i18n.language, user]);

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
      <View style={[styles.header, { backgroundColor: colors.tint }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.right" size={24} color={colors.background} style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <View style={styles.headerRight}>
          <LanguageToggle colors={{ card: colors.background, text: colors.tint }} />
        </View>
      </View>
      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.tint}
            colors={[colors.tint]}
          />
        }
      >
        {/* Profile Header */}
        <View style={[styles.profileHeader, { backgroundColor: colors.tint }]}>
          <View style={styles.profileImageContainer}>
            {profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImagePlaceholder, { backgroundColor: colors.background }]}>
                <IconSymbol name="person" size={60} color={colors.tint} />
              </View>
            )}
            <TouchableOpacity 
              style={styles.profileEditButton}
              onPress={pickImage}
            >
              <IconSymbol name="pencil.circle.fill" size={24} color={colors.tint} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.englishName, { color: colors.background }]}>{profileData.englishName}</Text>
          <Text style={[styles.email, { color: colors.background }]}>{profileData.username}</Text>
          <View style={styles.roleContainer}>
            <Text style={[styles.role, { color: colors.background }]}>{profileData.role}</Text>
            <Text style={[styles.grade, { color: colors.background }]}>{profileData.grade}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsContainer}>
          {stats.map((stat, index) => (
            <View key={index} style={[styles.statCard, { backgroundColor: colors.card }]}>
              <IconSymbol name={stat.icon} size={24} color={colors.tint} />
              <Text style={[styles.statValue, { color: colors.text }]}>{stat.value}</Text>
              <Text style={[styles.statLabel, { color: colors.text }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Menu Items */}
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
                    <IconSymbol name={item.icon} size={24} color={colors.tint} />
                    <Text style={[styles.menuItemText, { color: colors.text }]}>{item.title}</Text>
                  </View>
                  <IconSymbol name="chevron.right" size={20} color={colors.text} />
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
    padding: 15,
    paddingTop: 50,
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    padding: 5,
  },
  profileHeader: {
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
  },
  profileEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  englishName: {
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
    marginBottom: 10,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: 10,
  },
  role: {
    fontSize: 16,
    fontWeight: '500',
  },
  grade: {
    fontSize: 16,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 15,
    gap: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 14,
    textAlign: 'center',
  },
  menuContainer: {
    padding: 15,
    gap: 10,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
  accordionItem: {
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2.22,
    elevation: 3,
  },
  accordionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
  },
  accordionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  accordionTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  accordionContent: {
    padding: 15,
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
    gap: 15,
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
  profileImagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 