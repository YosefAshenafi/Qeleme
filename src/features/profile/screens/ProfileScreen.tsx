import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Switch,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';

import { IconSymbol } from '@/shared/components/ui/IconSymbol';
import { AccountSettings } from '@/shared/components/profile/AccountSettings';
import { DeleteAccount } from '@/shared/components/profile/DeleteAccount';
import { getColors } from '@/shared/constants/Colors';
import { useTheme } from '@/core/providers/ThemeProvider';
import { useAuth } from '@/core/providers/AuthProvider';
import { BASE_URL } from '@/shared/config/constants';
import ActivityTrackingService from '@/shared/services/activityTrackingService';
import { ProfileScreenStyles as styles } from './ProfileScreen.styles';

const BRAND_BLUE = '#0F4BD7';

export default function ProfileScreen() {
  const { isDarkMode, toggleTheme } = useTheme();
  const { logout, user, login } = useAuth();
  const { t, i18n } = useTranslation();
  const colors = getColors(isDarkMode);
  const insets = useSafeAreaInsets();

  const [refreshing, setRefreshing] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showSecurityModal, setShowSecurityModal] = useState(false);
  const [showAboutModal, setShowAboutModal] = useState(false);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  useEffect(() => {
    const loadPrefs = async () => {
      try {
        const push = await AsyncStorage.getItem('@prefs_push_notifications');
        if (push !== null) setPushNotificationsEnabled(push === 'true');
        
        const savedLanguage = await AsyncStorage.getItem('@prefs_language');
        if (savedLanguage) {
          setCurrentLanguage(savedLanguage);
          i18n.changeLanguage(savedLanguage);
        }
      } catch {
        // ignore
      }
    };
    loadPrefs();
  }, []);

  const handleLanguageChange = async (language: string) => {
    try {
      setCurrentLanguage(language);
      i18n.changeLanguage(language);
      await AsyncStorage.setItem('@prefs_language', language);
    } catch (error) {
      console.error('Error saving language preference:', error);
    }
  };

  const setPref = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // ignore
    }
  };

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

  const displayName = useMemo(() => {
    const name = user?.fullName?.trim() || user?.username?.trim() || '';
    if (!name) return t('profile.username', { defaultValue: 'Student' });
    return name
      .split(' ')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(' ');
  }, [t, user?.fullName, user?.username]);

  const membershipLabel = useMemo(() => {
    const plan = (user?.paymentPlan || user?.type || '').toString();
    const lower = plan.toLowerCase();
    if (lower.includes('premium') || lower.includes('gold') || lower.includes('silver') || lower.includes('bronze') || lower.includes('platinum')) {
      return t('profile.membership.premium', { defaultValue: 'Premium Member' });
    }
    return t('profile.membership.member', { defaultValue: 'Member' });
  }, [t, user?.paymentPlan, user?.type]);

  const profileData = useMemo(() => {
    const username = user?.username ? `@${user.username}` : '@';
    return {
      englishName: user?.fullName || '',
      username,
      grade: user?.grade || t('profile.grade', { defaultValue: 'Grade' }),
      role: t('profile.role', { defaultValue: 'Student' }),
      joinDate: user?.joinDate ? new Date(user.joinDate).toLocaleDateString(i18n.language === 'am' ? 'am-ET' : 'en-US') : new Date().toLocaleDateString(),
      paymentPlan: user?.paymentPlan || t('profile.paymentPlan', { defaultValue: 'Free Plan' }),
    };
  }, [i18n.language, t, user?.fullName, user?.grade, user?.joinDate, user?.paymentPlan, user?.username]);

  const handleImagePicker = async () => {
    try {
      // Request permission
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          t('profile.imagePicker.permissionRequired', { defaultValue: 'Permission Required' }),
          t('profile.imagePicker.permissionMessage', { defaultValue: 'Please grant permission to access your photo library to change your profile picture.' })
        );
        return;
      }

      // Show options
      Alert.alert(
        t('profile.imagePicker.selectPhoto', { defaultValue: 'Select Photo' }),
        '',
        [
          {
            text: t('profile.imagePicker.cancel', { defaultValue: 'Cancel' }),
            style: 'cancel',
          },
          {
            text: t('profile.imagePicker.camera', { defaultValue: 'Camera' }),
            onPress: async () => {
              try {
                const cameraResult = await ImagePicker.launchCameraAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.7,
                });

                console.log('Camera result:', cameraResult);

                if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets[0]) {
                  await uploadProfileImage(cameraResult.assets[0].uri);
                }
              } catch (cameraError) {
                console.error('Camera error:', cameraError);
                Alert.alert(
                  t('profile.imagePicker.cameraError', { defaultValue: 'Camera Error' }),
                  t('profile.imagePicker.cameraErrorMessage', { defaultValue: 'Failed to access camera. Please check permissions.' })
                );
              }
            },
          },
          {
            text: t('profile.imagePicker.gallery', { defaultValue: 'Gallery' }),
            onPress: async () => {
              try {
                const libraryResult = await ImagePicker.launchImageLibraryAsync({
                  mediaTypes: ImagePicker.MediaTypeOptions.Images,
                  allowsEditing: true,
                  aspect: [1, 1],
                  quality: 0.7,
                });

                console.log('Library result:', libraryResult);

                if (!libraryResult.canceled && libraryResult.assets && libraryResult.assets[0]) {
                  await uploadProfileImage(libraryResult.assets[0].uri);
                }
              } catch (libraryError) {
                console.error('Library error:', libraryError);
                Alert.alert(
                  t('profile.imagePicker.galleryError', { defaultValue: 'Gallery Error' }),
                  t('profile.imagePicker.galleryErrorMessage', { defaultValue: 'Failed to access gallery. Please check permissions.' })
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        t('profile.imagePicker.error', { defaultValue: 'Error' }),
        t('profile.imagePicker.errorMessage', { defaultValue: 'Failed to select image. Please try again.' })
      );
    }
  };

  const uploadProfileImage = async (imageUri: string) => {
    try {
      console.log('Updating profile image locally:', imageUri);
      
      // Save profile image to AsyncStorage for persistence
      await AsyncStorage.setItem('@profile_image', imageUri);
      
      // Update user data with the local image URI
      const updatedUser = {
        ...user!,
        profileImage: imageUri,
      };
      
      console.log('Updating user data with local profile image:', updatedUser.profileImage);
      await login(updatedUser);
      
      Alert.alert(
        t('profile.imagePicker.success', { defaultValue: 'Success' }),
        t('profile.imagePicker.successMessage', { defaultValue: 'Profile picture updated successfully!' })
      );
    } catch (error) {
      console.error('Error updating profile image:', error);
      Alert.alert(
        t('profile.imagePicker.error', { defaultValue: 'Error' }),
        t('profile.imagePicker.errorMessage', { defaultValue: 'Failed to update profile picture. Please try again.' })
      );
    }
  };

  // Load profile image from AsyncStorage on component mount
  useEffect(() => {
    const loadProfileImage = async () => {
      try {
        const savedProfileImage = await AsyncStorage.getItem('@profile_image');
        if (savedProfileImage && user && !user.profileImage) {
          // Update user data with saved profile image if it doesn't exist
          const updatedUser = {
            ...user,
            profileImage: savedProfileImage,
          };
          await login(updatedUser);
        }
      } catch (error) {
        console.error('Error loading profile image:', error);
      }
    };

    if (user) {
      loadProfileImage();
    }
  }, [user]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <StatusBar style={isDarkMode ? 'light' : 'dark'} />

      <View style={[styles.header, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.headerLeft}>
          <Image
            source={require('../../../../assets/images/logo.png')}
            style={styles.brandMark}
            resizeMode="contain"
          />
        </View>
        <View style={styles.headerRightWrap} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BRAND_BLUE} colors={[BRAND_BLUE]} />
        }
      >
        {/* Profile hero */}
        <View style={styles.hero}>
          <View style={styles.avatarWrap}>
            <View style={[styles.avatarRing, { borderColor: BRAND_BLUE + '35' }]}>
              <View style={[styles.avatar, { backgroundColor: colors.card }]}>
                {user?.profileImage ? (
                  <Image source={{ uri: user.profileImage }} style={styles.avatarImage} />
                ) : (
                  <IconSymbol name="person.fill" size={42} color={BRAND_BLUE} />
                )}
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.avatarCamera, { backgroundColor: BRAND_BLUE }]}
              onPress={handleImagePicker}
            >
              <IconSymbol name="photo" size={16} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={[styles.name, { color: colors.text }]}>{displayName}</Text>
          <View style={styles.memberRow}>
            <IconSymbol name="checkmark.circle.fill" size={14} color={BRAND_BLUE} />
            <Text style={[styles.memberText, { color: colors.text + '80' }]}>{membershipLabel}</Text>
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: BRAND_BLUE }]}
            onPress={() => setShowAccountModal(true)}
          >
            <Text style={styles.primaryBtnText}>{t('profile.editProfile', { defaultValue: 'Edit Profile' })}</Text>
          </TouchableOpacity>
        </View>

        {/* Account management */}
        <Text style={[styles.groupLabel, { color: colors.text + '60' }]}>
          {t('profile.groups.accountManagement', { defaultValue: 'ACCOUNT MANAGEMENT' })}
        </Text>
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.row} onPress={() => setShowAccountModal(true)}>
            <View style={[styles.rowIcon, { backgroundColor: BRAND_BLUE + '12' }]}>
              <IconSymbol name="person.fill" size={18} color={BRAND_BLUE} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {t('profile.personalInformation', { defaultValue: 'Personal Information' })}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.text + '70' }]}>
                {t('profile.personalInformationSubtitle', { defaultValue: 'Name, username, grade' })}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.text + '50'} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity style={styles.row} onPress={() => setShowSecurityModal(true)}>
            <View style={[styles.rowIcon, { backgroundColor: BRAND_BLUE + '12' }]}>
              <IconSymbol name="hand.raised.fill" size={18} color={BRAND_BLUE} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {t('profile.securityPrivacy', { defaultValue: 'Security & Privacy' })}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.text + '70' }]}>
                {t('profile.securityPrivacySubtitle', { defaultValue: 'Account deletion' })}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.text + '50'} />
          </TouchableOpacity>
        </View>

        {/* App customization */}
        <Text style={[styles.groupLabel, { color: colors.text + '60' }]}>
          {t('profile.groups.appCustomization', { defaultValue: 'APP CUSTOMIZATION' })}
        </Text>
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: BRAND_BLUE + '12' }]}>
              <IconSymbol name={isDarkMode ? 'moon.fill' : 'sun.max.fill'} size={18} color={BRAND_BLUE} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {t('profile.themeMode', { defaultValue: 'Theme Mode' })}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.text + '70' }]}>
                {isDarkMode
                  ? t('profile.themeModeDark', { defaultValue: 'Dark mode' })
                  : t('profile.themeModeLight', { defaultValue: 'Light mode' })}
              </Text>
            </View>
            <Switch value={isDarkMode} onValueChange={toggleTheme} />
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: BRAND_BLUE + '12' }]}>
              <IconSymbol name="globe" size={18} color={BRAND_BLUE} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {t('profile.language', { defaultValue: 'Language' })}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.text + '70' }]}>
                {currentLanguage === 'am' 
                  ? t('profile.languageAmharic', { defaultValue: 'Amharic' })
                  : t('profile.languageEnglish', { defaultValue: 'English' })}
              </Text>
            </View>
            <Switch
              value={currentLanguage === 'am'}
              onValueChange={(value) => handleLanguageChange(value ? 'am' : 'en')}
            />
          </View>
        </View>

        {/* App customization continued */}
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 12 }]}>
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: BRAND_BLUE + '12' }]}>
              <IconSymbol name="bell.fill" size={18} color={BRAND_BLUE} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>
                {t('profile.pushNotifications', { defaultValue: 'Push Notifications' })}
              </Text>
              <Text style={[styles.rowSubtitle, { color: colors.text + '70' }]}>
                {t('profile.pushNotificationsSubtitle', { defaultValue: 'Real-time updates' })}
              </Text>
            </View>
            <Switch
              value={pushNotificationsEnabled}
              onValueChange={(v) => {
                setPushNotificationsEnabled(v);
                setPref('@prefs_push_notifications', String(v));
              }}
            />
          </View>
        </View>

        {/* About / reset */}
        <Text style={[styles.groupLabel, { color: colors.text + '60' }]}>
          {t('profile.groups.about', { defaultValue: 'ABOUT' })}
        </Text>
        <View style={[styles.groupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TouchableOpacity style={styles.row} onPress={() => setShowAboutModal(true)}>
            <View style={[styles.rowIcon, { backgroundColor: BRAND_BLUE + '12' }]}>
              <IconSymbol name="info.circle.fill" size={18} color={BRAND_BLUE} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{t('profile.about', { defaultValue: 'About' })}</Text>
              <Text style={[styles.rowSubtitle, { color: colors.text + '70' }]}>{t('profile.version', { defaultValue: 'Version' })} {Constants.expoConfig?.version || '1.0.0'}</Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.text + '50'} />
          </TouchableOpacity>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <TouchableOpacity
            style={styles.row}
            onPress={() => {
              Alert.alert(
                t('common.confirmation', { defaultValue: 'Confirmation' }),
                t('profile.resetProgressConfirm', { defaultValue: 'Reset your learning progress on this device?' }),
                [
                  { text: t('common.cancel', { defaultValue: 'Cancel' }), style: 'cancel' },
                  {
                    text: t('common.confirm', { defaultValue: 'Confirm' }),
                    style: 'destructive',
                    onPress: async () => {
                      const tracking = ActivityTrackingService.getInstance();
                      await tracking.clearAllData();
                    },
                  },
                ]
              );
            }}
          >
            <View style={[styles.rowIcon, { backgroundColor: BRAND_BLUE + '12' }]}>
              <IconSymbol name="house.fill" size={18} color={BRAND_BLUE} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowTitle, { color: colors.text }]}>{t('profile.resetProgress', { defaultValue: 'Reset Progress' })}</Text>
              <Text style={[styles.rowSubtitle, { color: colors.text + '70' }]}>
                {t('profile.resetProgressSubtitle', { defaultValue: 'Clears reports and activity on this device' })}
              </Text>
            </View>
            <IconSymbol name="chevron.right" size={18} color={colors.text + '50'} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[styles.signOutBtn, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={logout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={18} color="#EF4444" />
          <Text style={[styles.signOutText, { color: '#EF4444' }]}>{t('profile.logout', { defaultValue: 'Sign Out' })}</Text>
        </TouchableOpacity>

        <Text style={[styles.footerText, { color: colors.text + '60' }]}>
          {t('profile.version', { defaultValue: 'Version' })} {Constants.expoConfig?.version || '1.0.0'}
        </Text>
      </ScrollView>

      {/* Personal Information modal */}
      <Modal visible={showAccountModal} animationType="slide" onRequestClose={() => setShowAccountModal(false)}>
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: Math.max(insets.top, 14) }]}>
            <TouchableOpacity onPress={() => setShowAccountModal(false)} style={[styles.headerIconBtn, { backgroundColor: colors.card }]}>
              <IconSymbol name="chevron.left" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('profile.personalInformation', { defaultValue: 'Personal Information' })}
            </Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
            <AccountSettings colors={colors} profileData={profileData as any} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Security modal */}
      <Modal visible={showSecurityModal} animationType="slide" onRequestClose={() => setShowSecurityModal(false)}>
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: Math.max(insets.top, 14) }]}>
            <TouchableOpacity onPress={() => setShowSecurityModal(false)} style={[styles.headerIconBtn, { backgroundColor: colors.card }]}>
              <IconSymbol name="chevron.left" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('profile.securityPrivacy', { defaultValue: 'Security & Privacy' })}
            </Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            <DeleteAccount colors={colors} userPhoneNumber={user?.phoneNumber} />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* About modal */}
      <Modal visible={showAboutModal} animationType="slide" onRequestClose={() => setShowAboutModal(false)}>
        <SafeAreaView style={[styles.modalSafe, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: Math.max(insets.top, 14) }]}>
            <TouchableOpacity onPress={() => setShowAboutModal(false)} style={[styles.headerIconBtn, { backgroundColor: colors.card }]}>
              <IconSymbol name="chevron.left" size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('profile.about', { defaultValue: 'About' })}
            </Text>
            <View style={{ width: 40 }} />
          </View>
          <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 24 }}>
            <View style={[styles.aboutCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.aboutTitle, { color: colors.text }]}>
                {t('profile.appName', { defaultValue: 'MegaTest' })}
              </Text>
              <Text style={[styles.aboutSub, { color: colors.text + '70' }]}>
                {t('profile.version', { defaultValue: 'Version' })} {Constants.expoConfig?.version || '1.0.0'}
              </Text>
              <Text style={[styles.aboutBody, { color: colors.text + '80' }]}>
                {t('profile.aboutInfo', { defaultValue: 'An educational platform designed to help you learn with practice questions, flashcards, and progress tracking.' })}
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}
 
