import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KG_DESIGN_TOKENS } from '../../constants/DesignTokens';
import i18n from 'i18next';

interface QuizSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onSoundToggle: (value: boolean) => void;
  autoAdvanceDelay: number;
  onDelayChange: (delay: number) => void;
  onLogout: () => void;
}

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  label: {
    fontSize: 16,
    color: '#374151',
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#D1D5DB',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#004be2',
  },
  toggleKnob: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
  },
  toggleKnobActive: {
    alignSelf: 'flex-end',
  },
  delayContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    marginBottom: 24,
  },
  delayOption: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  delayOptionActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#004be2',
  },
  delayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  delayTextActive: {
    color: '#004be2',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 16,
    marginTop: 8,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
  },
  doneButton: {
    backgroundColor: '#004be2',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export const QuizSettingsModal: React.FC<QuizSettingsModalProps> = ({
  visible,
  onClose,
  soundEnabled,
  onSoundToggle,
  autoAdvanceDelay,
  onDelayChange,
  onLogout,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={modalStyles.overlay}>
        <View style={modalStyles.content}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>
              {i18n.language === 'am' ? 'ቅንብሮች' : 'Settings'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          {/* Sound Toggle */}
          <View style={modalStyles.row}>
            <View style={modalStyles.labelContainer}>
              <Ionicons name="volume-high" size={24} color={KG_DESIGN_TOKENS.colors.primary} />
              <Text style={modalStyles.label}>
                {i18n.language === 'am' ? 'ድምጽ' : 'Sound Effects'}
              </Text>
            </View>
            <TouchableOpacity
              style={[modalStyles.toggle, soundEnabled && modalStyles.toggleActive]}
              onPress={() => onSoundToggle(!soundEnabled)}
            >
              <View style={[modalStyles.toggleKnob, soundEnabled && modalStyles.toggleKnobActive]} />
            </TouchableOpacity>
          </View>

          {/* Delay Setting */}
          <View style={modalStyles.row}>
            <View style={modalStyles.labelContainer}>
              <Ionicons name="time" size={24} color={KG_DESIGN_TOKENS.colors.primary} />
              <Text style={modalStyles.label}>
                {i18n.language === 'am' ? 'የቀጣይ ጥያቄ ቆይታ' : 'Next Question Delay'}
              </Text>
            </View>
          </View>
          <View style={modalStyles.delayContainer}>
            {[1000, 2000, 3000].map((delay) => (
              <TouchableOpacity
                key={delay}
                style={[modalStyles.delayOption, autoAdvanceDelay === delay && modalStyles.delayOptionActive]}
                onPress={() => onDelayChange(delay)}
              >
                <Text style={[modalStyles.delayText, autoAdvanceDelay === delay && modalStyles.delayTextActive]}>
                  {delay / 1000}s
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Logout Button */}
          <TouchableOpacity style={modalStyles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text style={modalStyles.logoutText}>
              {i18n.language === 'am' ? 'ውጣ' : 'Sign Out'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={modalStyles.doneButton} onPress={onClose}>
            <Text style={modalStyles.doneText}>
              {i18n.language === 'am' ? 'ጨርሻለሁ' : 'Done'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
