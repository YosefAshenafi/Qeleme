import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Alert, ActivityIndicator } from 'react-native';
import { getColors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { sendOTP, verifyOTP } from '@/utils/otpService';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { PasswordInput } from '@/components/ui/PasswordInput';

interface DeleteAccountProps {
  colors: ReturnType<typeof getColors>;
  userPhoneNumber?: string;
}

export function DeleteAccount({ colors, userPhoneNumber }: DeleteAccountProps) {
  const { isDarkMode } = useTheme();
  const { deleteAccount } = useAuth();
  const { t } = useTranslation();
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState(userPhoneNumber || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOTP, setIsSendingOTP] = useState(false);

  const handleDeleteAccountPress = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = () => {
    setShowConfirmModal(false);
    setShowOTPModal(true);
    // If we have a phone number, send OTP automatically
    if (userPhoneNumber) {
      handleSendOTP();
    }
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
    
    if (!phoneToUse.trim() || !otp.trim() || !password.trim()) {
      Alert.alert(
        t('common.error', { defaultValue: 'Error' }),
        t('profile.enterAllFields', { defaultValue: 'Please enter phone number, verification code, and password' })
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOTP(phoneToUse, otp);
      if (result.success) {
        // OTP verified, proceed with account deletion using password
        await deleteAccount(password);
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
        error instanceof Error ? error.message : 'Failed to delete account'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelOTP = () => {
    setOtp('');
    setPassword('');
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
        <Text style={[styles.noticeTitle, { color: colors.text }]}>
          {t('profile.importantNotice')}
        </Text>
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

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showConfirmModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <TouchableOpacity
          style={styles.confirmModalOverlay}
          activeOpacity={1}
          onPress={() => setShowConfirmModal(false)}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[styles.confirmModalContent, { backgroundColor: colors.card }]}
          >
            <View style={[styles.confirmModalHeader, { borderBottomColor: colors.border }]}>
              <View style={[styles.confirmModalIconContainer, { backgroundColor: '#F44336' + '15' }]}>
                <IconSymbol name="hand.raised.fill" size={32} color="#F44336" />
              </View>
              <Text style={[styles.confirmModalTitle, { color: colors.text }]}>
                {t('profile.deleteAccount')}
              </Text>
              <TouchableOpacity
                onPress={() => setShowConfirmModal(false)}
                style={[styles.confirmModalCloseButton, { backgroundColor: colors.cardAlt }]}
              >
                <IconSymbol name="xmark.circle.fill" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.confirmModalBody}>
              <Text style={[styles.confirmModalText, { color: colors.text }]}>
                {t('profile.deleteAccountConfirmation')}
              </Text>
              <View style={[styles.confirmWarningBox, { backgroundColor: '#F44336' + '15', borderColor: '#F44336' + '40' }]}>
                <IconSymbol name="info.circle.fill" size={20} color="#F44336" />
                <Text style={[styles.confirmWarningText, { color: '#F44336' }]}>
                  {t('profile.deleteAccountWarning')}
                </Text>
              </View>
            </View>

            <View style={styles.confirmModalButtonContainer}>
              <TouchableOpacity
                style={[styles.confirmModalButtonSecondary, { backgroundColor: colors.cardAlt, borderColor: colors.border }]}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={[styles.confirmModalButtonSecondaryText, { color: colors.text }]}>
                  {t('common.cancel', 'Cancel')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmModalButton, { backgroundColor: '#F44336' }]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.confirmModalButtonText}>
                  {t('profile.confirmDelete')}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

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
              
              <PasswordInput
                value={password}
                onChangeText={setPassword}
                placeholder={t('profile.enterPassword')}
                colors={colors}
                isDarkMode={isDarkMode}
                style={styles.passwordInput}
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
                  backgroundColor: (isLoading || !otp.trim() || !password.trim() || (!userPhoneNumber && !phoneNumber.trim())) ? '#ccc' : '#ff6b6b' 
                }]}
                onPress={handleVerifyOTP}
                disabled={isLoading || !otp.trim() || !password.trim() || (!userPhoneNumber && !phoneNumber.trim())}
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
  noticeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
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
  passwordInput: {
    marginBottom: 12,
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
  confirmModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmModalContent: {
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  confirmModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    gap: 12,
  },
  confirmModalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmModalTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
  },
  confirmModalCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmModalBody: {
    padding: 20,
  },
  confirmModalText: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  confirmWarningBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  confirmWarningText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    flex: 1,
  },
  confirmModalButtonContainer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 0,
  },
  confirmModalButtonSecondary: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  confirmModalButtonSecondaryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  confirmModalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
