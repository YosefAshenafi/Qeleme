import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { sendOTP, verifyOTP } from '@/utils/otpService';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface DeleteAccountProps {
  colors: ReturnType<typeof getColors>;
  userPhoneNumber?: string;
}

export function DeleteAccount({ colors, userPhoneNumber }: DeleteAccountProps) {
  const { isDarkMode } = useTheme();
  const { deleteAccount } = useAuth();
  const { t } = useTranslation();
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(userPhoneNumber || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);

  const handleDeleteAccountPress = () => {
    Alert.alert(
      t('profile.deleteAccount'),
      t('profile.deleteAccountConfirmation'),
      [
        {
          text: t('common.cancel', { defaultValue: 'Cancel' }),
          style: 'cancel'
        },
        {
          text: t('profile.confirmDelete'),
          style: 'destructive',
          onPress: () => {
            setShowOTPModal(true);
            // If we have a phone number, send OTP automatically
            if (userPhoneNumber) {
              handleSendOTP();
            }
          }
        }
      ]
    );
  };

  const handleSendOTP = async () => {
    const phoneToUse = userPhoneNumber || phoneNumber;
    
    if (!phoneToUse.trim()) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        'Please enter your phone number first.'
      );
      return;
    }
    
    setIsSendingOTP(true);
    try {
      const result = await sendOTP(phoneToUse);
      if (result.success) {
        Alert.alert(
          t('common.success', { defaultValue: 'Success' }),
          'Verification code sent to your phone number.'
        );
      } else {
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          result.message || 'Failed to send verification code'
        );
      }
    } catch (error) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        'Failed to send verification code'
      );
    } finally {
      setIsSendingOTP(false);
    }
  };

  const handleVerifyOTP = async () => {
    const phoneToUse = userPhoneNumber || phoneNumber;
    
    if (!phoneToUse.trim() || !otp.trim()) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        'Please enter both phone number and verification code'
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOTP(phoneToUse, otp);
      if (result.success) {
        // OTP verified, proceed with account deletion
        await deleteAccount();
        Alert.alert(
          t('common.success', { defaultValue: 'Success' }),
          t('profile.accountDeleted'),
          [{ text: t('common.ok', { defaultValue: 'OK' }) }]
        );
        setShowOTPModal(false);
      } else {
        Alert.alert(
          t('common.error', { defaultValue: 'Error' }),
          result.message || 'Invalid verification code'
        );
      }
    } catch (error) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        'Failed to verify code'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOTP = () => {
    setOtp('');
    setPhoneNumber(userPhoneNumber || '');
    setShowOTPModal(false);
  };

  return (
    <>
      <View style={[styles.dangerZone, { backgroundColor: colors.card }]}>
        <View style={styles.dangerHeader}>
          <IconSymbol name="exclamationmark.triangle.fill" size={20} color="#ff6b6b" />
          <Text style={[styles.dangerTitle, { color: '#ff6b6b' }]}>
            {t('profile.dangerZone')}
          </Text>
        </View>
        
        <Text style={[styles.dangerWarning, { color: colors.text }]}>
          {t('profile.deleteAccountWarning')}
        </Text>
        
        <TouchableOpacity
          style={[styles.deleteButton, { borderColor: '#ff6b6b' }]}
          onPress={handleDeleteAccountPress}
        >
          <IconSymbol name="trash.fill" size={16} color="#ff6b6b" />
          <Text style={[styles.deleteButtonText, { color: '#ff6b6b' }]}>
            {t('profile.deleteAccount')}
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={showOTPModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancelOTP}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {t('profile.enterOTPToDelete')}
              </Text>
              <TouchableOpacity onPress={handleCancelOTP}>
                <IconSymbol name="xmark" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <Text style={[styles.modalSubtitle, { color: colors.text }]}>
              {t('profile.deleteAccountOTPSubtitle')}
            </Text>
            
            <View style={styles.otpContainer}>
              {!userPhoneNumber && (
                <TextInput
                  style={[styles.phoneInput, { 
                    color: colors.text, 
                    borderColor: colors.tint,
                    backgroundColor: isDarkMode ? colors.card : '#ffffff'
                  }]}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter your phone number (+251...)"
                  placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                  keyboardType="phone-pad"
                  autoFocus
                />
              )}
              
              <TextInput
                style={[styles.otpInput, { 
                  color: colors.text, 
                  borderColor: colors.tint,
                  backgroundColor: isDarkMode ? colors.card : '#ffffff'
                }]}
                value={otp}
                onChangeText={setOtp}
                placeholder="Enter 6-digit code"
                placeholderTextColor={isDarkMode ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)'}
                keyboardType="numeric"
                maxLength={6}
                autoFocus={!!userPhoneNumber}
              />
              
              <TouchableOpacity
                style={[styles.sendOTPButton, { backgroundColor: colors.tint }]}
                onPress={handleSendOTP}
                disabled={isSendingOTP || (!userPhoneNumber && !phoneNumber.trim())}
              >
                {isSendingOTP ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.sendOTPButtonText}>
                    {userPhoneNumber ? t('common.resend', { defaultValue: 'Resend Code' }) : t('common.send', { defaultValue: 'Send Code' })}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.cancelButton, { borderColor: colors.tint }]}
                onPress={handleCancelOTP}
              >
                <Text style={[styles.cancelButtonText, { color: colors.tint }]}>
                  {t('common.cancel', { defaultValue: 'Cancel' })}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.confirmButton, { 
                  backgroundColor: (isLoading || !otp.trim() || (!userPhoneNumber && !phoneNumber.trim())) ? '#ccc' : '#ff6b6b' 
                }]}
                onPress={handleVerifyOTP}
                disabled={isLoading || !otp.trim() || (!userPhoneNumber && !phoneNumber.trim())}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>
                    {t('profile.confirmDelete')}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dangerZone: {
    marginTop: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 107, 0.15)',
  },
  dangerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  dangerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  dangerWarning: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    opacity: 0.8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    opacity: 0.8,
  },
  otpContainer: {
    marginBottom: 20,
  },
  phoneInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
  },
  otpInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  sendOTPButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  sendOTPButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});
