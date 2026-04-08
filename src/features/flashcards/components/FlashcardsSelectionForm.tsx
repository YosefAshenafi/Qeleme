import React from 'react';
import { Modal, ScrollView, StatusBar, TouchableOpacity, View } from 'react-native';
import { ThemedView } from '@/features/common/components/ThemedView';
import { ThemedText } from '@/features/common/components/ThemedText';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import type { Chapter, Grade, Subject } from '@/features/common/services/flashcardService';
import {
  CHAPTER_INPUT_DISABLED_BG_DARK,
  CHAPTER_INPUT_DISABLED_BG_LIGHT,
  CHAPTER_INPUT_DISABLED_BORDER_DARK,
  CHAPTER_INPUT_DISABLED_BORDER_LIGHT,
  CHAPTER_PLACEHOLDER_MUTED_DARK,
  CHAPTER_PLACEHOLDER_MUTED_LIGHT,
  MODAL_OVERLAY_BACKGROUND,
} from '@/features/flashcards/constants/flashcardsUi';
import { extractNumberFromName } from '@/features/flashcards/utils/sortByNumberInName';
import { FlashcardsScreenStyles as styles } from './FlashcardsScreen.styles';
import { FlashcardsScreenTopBar } from './FlashcardsScreenTopBar';

type ColorTokens = {
  background: string;
  text: string;
  tint: string;
  cardAlt: string;
  border: string;
};

type FlashcardsSelectionFormProps = {
  colors: ColorTokens;
  isDarkMode: boolean;
  isPreSelected: boolean;
  subjectLabel: string;
  chapterLabel: string;
  preSelectedSuffix: string;
  selectSubjectPlaceholder: string;
  selectChapterPlaceholder: string;
  startButtonLabel: string;
  noChaptersLabel: string;
  selectedSubject: string;
  selectedChapter: string;
  selectedGradeData: Grade | null | undefined;
  selectedSubjectData: Subject | null | undefined;
  showSubjectDropdown: boolean;
  showChapterDropdown: boolean;
  onToggleSubjectDropdown: () => void;
  onToggleChapterDropdown: () => void;
  onCloseSubjectDropdown: () => void;
  onCloseChapterDropdown: () => void;
  onSelectSubject: (subjectId: string) => void;
  onSelectChapter: (chapterId: string) => void;
  onStart: () => void;
};

export function FlashcardsSelectionForm({
  colors,
  isDarkMode,
  isPreSelected,
  subjectLabel,
  chapterLabel,
  preSelectedSuffix,
  selectSubjectPlaceholder,
  selectChapterPlaceholder,
  startButtonLabel,
  noChaptersLabel,
  selectedSubject,
  selectedChapter,
  selectedGradeData,
  selectedSubjectData,
  showSubjectDropdown,
  showChapterDropdown,
  onToggleSubjectDropdown,
  onToggleChapterDropdown,
  onCloseSubjectDropdown,
  onCloseChapterDropdown,
  onSelectSubject,
  onSelectChapter,
  onStart,
}: FlashcardsSelectionFormProps) {
  const subjectBorderColor = isPreSelected
    ? isDarkMode
      ? '#FFFFFF'
      : colors.tint
    : isDarkMode
      ? '#FFFFFF'
      : colors.border;

  return (
    <>
      <StatusBar translucent={false} backgroundColor="#FFFFFF" barStyle="dark-content" />
      <FlashcardsScreenTopBar />
      <ThemedView style={[styles.formContainer, { backgroundColor: colors.background }]}>
        <ThemedView style={[styles.formContent, { backgroundColor: colors.background }]}>
          <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.formLabel, { color: colors.tint }]}>
              {subjectLabel}
              {isPreSelected && (
                <ThemedText style={[styles.preSelectedLabel, { color: colors.tint }]}>
                  {' '}
                  ({preSelectedSuffix})
                </ThemedText>
              )}
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.formInput,
                {
                  backgroundColor: colors.cardAlt,
                  borderColor: subjectBorderColor,
                  borderWidth: isPreSelected ? 2 : 1,
                },
              ]}
              onPress={onToggleSubjectDropdown}
            >
              <ThemedText style={[styles.formInputText, { color: colors.text }]}>
                {selectedSubject
                  ? selectedGradeData?.subjects?.find((s: Subject) => s.id === selectedSubject)?.name
                  : selectSubjectPlaceholder}
              </ThemedText>
              <IconSymbol name="chevron.right" size={20} color={colors.tint} />
            </TouchableOpacity>
            {showSubjectDropdown && (
              <Modal
                visible={showSubjectDropdown}
                transparent
                animationType="fade"
                onRequestClose={onCloseSubjectDropdown}
              >
                <TouchableOpacity
                  style={[styles.modalOverlay, { backgroundColor: MODAL_OVERLAY_BACKGROUND }]}
                  activeOpacity={1}
                  onPress={onCloseSubjectDropdown}
                >
                  <ThemedView style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <ScrollView>
                      {selectedGradeData?.subjects
                        ?.sort((a, b) => extractNumberFromName(a.name) - extractNumberFromName(b.name))
                        .map((subject: Subject, index: number) => (
                          <TouchableOpacity
                            key={`subject-${subject.id}-${index}`}
                            style={[
                              styles.modalItem,
                              { backgroundColor: colors.background, borderBottomColor: colors.border },
                            ]}
                            onPress={() => onSelectSubject(subject.id)}
                          >
                            <ThemedText style={[styles.modalItemText, { color: colors.text }]}>
                              {subject.name}
                            </ThemedText>
                            <IconSymbol name="chevron.right" size={20} color={colors.tint} />
                          </TouchableOpacity>
                        ))}
                    </ScrollView>
                  </ThemedView>
                </TouchableOpacity>
              </Modal>
            )}
          </ThemedView>

          <ThemedView style={[styles.formGroup, { backgroundColor: colors.background }]}>
            <ThemedText style={[styles.formLabel, { color: colors.tint }]}>{chapterLabel}</ThemedText>
            <TouchableOpacity
              style={[
                styles.formInput,
                { backgroundColor: colors.cardAlt, borderColor: isDarkMode ? '#FFFFFF' : colors.border },
                !selectedSubject && {
                  backgroundColor: isDarkMode ? CHAPTER_INPUT_DISABLED_BG_DARK : CHAPTER_INPUT_DISABLED_BG_LIGHT,
                  borderColor: isDarkMode ? CHAPTER_INPUT_DISABLED_BORDER_DARK : CHAPTER_INPUT_DISABLED_BORDER_LIGHT,
                },
              ]}
              onPress={() => selectedSubject && onToggleChapterDropdown()}
              disabled={!selectedSubject}
            >
              <ThemedText
                style={[
                  styles.formInputText,
                  { color: colors.text },
                  !selectedSubject && {
                    color: isDarkMode ? CHAPTER_PLACEHOLDER_MUTED_DARK : CHAPTER_PLACEHOLDER_MUTED_LIGHT,
                  },
                ]}
              >
                {selectedChapter
                  ? selectedSubjectData?.chapters?.find((c: Chapter) => c.id === selectedChapter)?.name
                  : selectChapterPlaceholder}
              </ThemedText>
              <IconSymbol
                name="chevron.right"
                size={20}
                color={
                  !selectedSubject
                    ? isDarkMode
                      ? CHAPTER_PLACEHOLDER_MUTED_DARK
                      : CHAPTER_PLACEHOLDER_MUTED_LIGHT
                    : colors.tint
                }
              />
            </TouchableOpacity>
            {showChapterDropdown && selectedSubject && (
              <Modal
                visible={showChapterDropdown}
                transparent
                animationType="fade"
                onRequestClose={onCloseChapterDropdown}
              >
                <TouchableOpacity
                  style={[styles.modalOverlay, { backgroundColor: MODAL_OVERLAY_BACKGROUND }]}
                  activeOpacity={1}
                  onPress={onCloseChapterDropdown}
                >
                  <ThemedView style={[styles.modalContent, { backgroundColor: colors.background }]}>
                    <ScrollView>
                      {selectedSubjectData?.chapters
                        ?.sort((a, b) => extractNumberFromName(a.name) - extractNumberFromName(b.name))
                        .map((chapter: Chapter, index: number) => (
                          <TouchableOpacity
                            key={`chapter-${chapter.id}-${index}`}
                            style={[
                              styles.modalItem,
                              { backgroundColor: colors.background, borderBottomColor: colors.border },
                            ]}
                            onPress={() => onSelectChapter(chapter.id)}
                          >
                            <ThemedText style={[styles.modalItemText, { color: colors.text }]}>
                              {chapter.name}
                            </ThemedText>
                            <IconSymbol name="chevron.right" size={20} color={colors.tint} />
                          </TouchableOpacity>
                        )) || (
                        <View
                          style={[
                            styles.modalItem,
                            { backgroundColor: colors.background, borderBottomColor: colors.border },
                          ]}
                        >
                          <ThemedText style={[styles.modalItemText, { color: colors.text, opacity: 0.7 }]}>
                            {noChaptersLabel}
                          </ThemedText>
                        </View>
                      )}
                    </ScrollView>
                  </ThemedView>
                </TouchableOpacity>
              </Modal>
            )}
          </ThemedView>

          <TouchableOpacity
            style={[
              styles.startButton,
              { backgroundColor: colors.tint },
              (!selectedSubject || !selectedChapter) && { opacity: 0.5 },
            ]}
            onPress={onStart}
            disabled={!selectedSubject || !selectedChapter}
          >
            <ThemedText style={[styles.startButtonText, { color: '#fff' }]}>{startButtonLabel}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    </>
  );
}
