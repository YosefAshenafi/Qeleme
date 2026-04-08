import React from 'react';
import { Modal, View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/constants/Colors';
import { ThemedText } from '@/components/ThemedText';
import { grades, Grade } from '@/constants/Grades';

interface GradePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (value: string, childIndex?: number) => void;
  selectedChildIndex: number | null;
  selectedGrade: Grade | '';
  childrenGrades?: (Grade | '')[];
}

export const GradePickerModal: React.FC<GradePickerModalProps> = ({
  visible,
  onClose,
  onSelect,
  selectedChildIndex,
  selectedGrade,
  childrenGrades,
}) => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  const currentGrade = selectedChildIndex !== null && childrenGrades
    ? childrenGrades[selectedChildIndex]
    : selectedGrade;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.content, { backgroundColor: isDarkMode ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={[styles.header, { borderBottomColor: isDarkMode ? '#3C3C3E' : '#E5E7EB' }]}>
            <ThemedText style={[styles.title, { color: colors.text }]}>{t('signup.grade.title')}</ThemedText>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={isDarkMode ? '#A0A0A5' : '#6B7280'} />
            </TouchableOpacity>
          </View>
          <ScrollView style={styles.scrollView}>
            {grades.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  styles.option,
                  currentGrade === item.value && [
                    styles.optionSelected,
                    { backgroundColor: isDarkMode ? '#2C2C2E' : '#EEF2FF' }
                  ]
                ]}
                onPress={() => onSelect(item.value, selectedChildIndex ?? undefined)}
              >
                <ThemedText style={[
                  styles.optionText,
                  { color: isDarkMode ? colors.text : '#1F2937' },
                  currentGrade === item.value && styles.optionTextSelected
                ]}>
                  {item.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxHeight: '70%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    maxHeight: 400,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  optionSelected: {},
  optionText: {
    fontSize: 16,
  },
  optionTextSelected: {
    fontWeight: '600',
  },
});
