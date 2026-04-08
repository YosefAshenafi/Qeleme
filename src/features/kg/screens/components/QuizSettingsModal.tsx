import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { KG_DESIGN_TOKENS } from '../../constants/DesignTokens';
import i18n from 'i18next';
import { quizSettingsModalStyles as modalStyles } from './QuizSettingsModal.styles';

interface QuizSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onSoundToggle: (value: boolean) => void;
  autoAdvanceDelay: number;
  onDelayChange: (delay: number) => void;
  onLogout: () => void;
}

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
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={modalStyles.overlay}>
        <View style={modalStyles.content}>
          <View style={modalStyles.header}>
            <Text style={modalStyles.title}>{i18n.language === 'am' ? 'ቅንብሮች' : 'Settings'}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={28} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={modalStyles.row}>
            <View style={modalStyles.labelContainer}>
              <Ionicons name="volume-high" size={24} color={KG_DESIGN_TOKENS.colors.primary} />
              <Text style={modalStyles.label}>{i18n.language === 'am' ? 'ድምጽ' : 'Sound Effects'}</Text>
            </View>
            <TouchableOpacity
              style={[modalStyles.toggle, soundEnabled && modalStyles.toggleActive]}
              onPress={() => onSoundToggle(!soundEnabled)}
            >
              <View style={[modalStyles.toggleKnob, soundEnabled && modalStyles.toggleKnobActive]} />
            </TouchableOpacity>
          </View>

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

          <TouchableOpacity style={modalStyles.logoutButton} onPress={onLogout}>
            <Ionicons name="log-out-outline" size={24} color="#EF4444" />
            <Text style={modalStyles.logoutText}>{i18n.language === 'am' ? 'ውጣ' : 'Sign Out'}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={modalStyles.doneButton} onPress={onClose}>
            <Text style={modalStyles.doneText}>{i18n.language === 'am' ? 'ጨርሻለሁ' : 'Done'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};
