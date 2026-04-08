import React from 'react';
import { Modal, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { termsModalStyles as styles } from './TermsModal.styles';

interface TermsModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ visible, onClose }) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View 
          style={[styles.content, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}
          pointerEvents="box-none"
        >
          <View pointerEvents="auto">
            <View style={[styles.header, { borderBottomColor: isDarkMode ? '#3C3C3E' : '#E5E7EB' }]}>
              <ThemedText style={[styles.title, { color: colors.text }]}>{t('signup.terms.title')}</ThemedText>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#A0A0A5' : '#6B7280'} />
              </TouchableOpacity>
            </View>
            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={true}
              nestedScrollEnabled={true}
              contentContainerStyle={styles.scrollContent}
            >
              <ThemedText style={[styles.text, { color: colors.text }]}>
                {t('signup.terms.content')}
              </ThemedText>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};
