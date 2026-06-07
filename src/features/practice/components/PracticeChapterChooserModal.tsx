import React from 'react';
import { View, Modal, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { ThemedText } from '@/features/common/components/ThemedText';
import { ThemedView } from '@/features/common/components/ThemedView';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import type { Chapter, Subject } from '@/features/common/services/practiceService';
import type { BooksChapterIntent } from '@/features/practice/hooks/practiceBooksHandlers';
import { BRAND_BLUE } from '@/features/practice/constants/practiceUi';
import { PracticeScreenStyles as styles } from './PracticeScreen.styles';
import { getBooksHubPalette } from './practiceBooksPalette';

interface PracticeChapterChooserModalProps {
  visible: boolean;
  onDismiss: () => void;
  isDarkMode: boolean;
  tintColor: string;
  selectedSubject: string;
  selectedSubjectData?: Subject;
  booksChapterModeLabel: string;
  booksChapterModalStep: 'grid' | 'eitherPick';
  setBooksChapterModalStep: (step: 'grid' | 'eitherPick') => void;
  booksEitherPendingChapter: Chapter | null;
  setBooksEitherPendingChapter: (chapter: Chapter | null) => void;
  booksChapterIntent: BooksChapterIntent;
  booksModalChaptersSorted: Chapter[];
  chapterGridColumns: number;
  applyBooksChapterAndStartMcq: (chapter: Chapter, subjectId: string) => void | Promise<void>;
  applyBooksChapterAndOpenFlashcards: (chapter: Chapter, subjectName: string) => void | Promise<void>;
}

export function PracticeChapterChooserModal({
  visible,
  onDismiss,
  isDarkMode,
  tintColor,
  selectedSubject,
  selectedSubjectData,
  booksChapterModeLabel,
  booksChapterModalStep,
  setBooksChapterModalStep,
  booksEitherPendingChapter,
  setBooksEitherPendingChapter,
  booksChapterIntent,
  booksModalChaptersSorted,
  chapterGridColumns,
  applyBooksChapterAndStartMcq,
  applyBooksChapterAndOpenFlashcards,
}: PracticeChapterChooserModalProps) {
  const { t } = useTranslation();
  const { booksCardBg, booksCardBorder, booksMutedText } = getBooksHubPalette(isDarkMode);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.booksChapterModalOverlay}>
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onDismiss}
        />
        <ThemedView
          style={[
            styles.booksChapterModalCard,
            {
              backgroundColor: booksCardBg,
              borderColor: booksCardBorder,
            },
          ]}
        >
          <View
            style={[
              styles.booksChapterModalHeader,
              {
                backgroundColor: isDarkMode ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.02)',
              },
            ]}
          >
            <View style={{ flex: 1 }}>
              {booksChapterModalStep !== 'eitherPick' ? (
                <ThemedText
                  style={[
                    styles.booksChapterModalHeaderTitle,
                    { color: booksMutedText, fontWeight: '600' },
                  ]}
                >
                  Select Chapter
                </ThemedText>
              ) : null}
              <View style={{ marginTop: booksChapterModalStep === 'eitherPick' ? 0 : 6, gap: 2 }}>
                <ThemedText
                  style={[styles.booksChapterModalSubject, isDarkMode && { color: '#FFFFFF' }]}
                  numberOfLines={2}
                >
                  {selectedSubjectData?.name}
                </ThemedText>
                {booksChapterModeLabel ? (
                  <ThemedText
                    style={[styles.booksChapterModalSubtitle, { color: tintColor }]}
                    numberOfLines={2}
                  >
                    {booksChapterModeLabel}
                  </ThemedText>
                ) : null}
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                if (booksChapterModalStep === 'eitherPick') {
                  setBooksChapterModalStep('grid');
                  setBooksEitherPendingChapter(null);
                } else {
                  onDismiss();
                }
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
            >
              <IconSymbol
                name={booksChapterModalStep === 'eitherPick' ? 'chevron.left' : 'xmark.circle.fill'}
                size={24}
                color={booksMutedText}
              />
            </TouchableOpacity>
          </View>

          <View
            style={[
              styles.booksChapterModalDivider,
              { backgroundColor: isDarkMode ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.08)' },
            ]}
          />

          {booksChapterModalStep === 'eitherPick' && booksEitherPendingChapter ? (
            <View style={styles.booksChapterBody}>
              <View style={styles.booksChapterEitherActions}>
              <TouchableOpacity
                style={[styles.booksChapterEitherPill, { backgroundColor: BRAND_BLUE }]}
                onPress={() => {
                  if (!selectedSubject) return;
                  void applyBooksChapterAndStartMcq(booksEitherPendingChapter, selectedSubject);
                }}
                activeOpacity={0.9}
              >
                <IconSymbol name="doc.text.fill" size={20} color="#fff" />
                <ThemedText style={[styles.startButtonText, { color: '#fff' }]}>
                  {t('mcq.subjects.qaPractice')}
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.booksChapterEitherPill, { backgroundColor: BRAND_BLUE }]}
                onPress={() => {
                  if (!selectedSubjectData) return;
                  void applyBooksChapterAndOpenFlashcards(
                    booksEitherPendingChapter,
                    selectedSubjectData.name
                  );
                }}
                activeOpacity={0.9}
              >
                <IconSymbol name="rectangle.stack" size={20} color="#fff" />
                <ThemedText style={[styles.startButtonText, { color: '#fff' }]}>
                  {t('mcq.subjects.flashcards')}
                </ThemedText>
              </TouchableOpacity>
              </View>
            </View>
          ) : (
            <ScrollView
              style={styles.booksChapterGridScroll}
              contentContainerStyle={styles.booksChapterGridScrollContent}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.booksChapterBody}>
                <View style={styles.booksChapterGrid}>
                {booksModalChaptersSorted.length === 0 ? (
                  <ThemedText style={[styles.booksChapterGridEmpty, { color: booksMutedText }]}>
                    No chapters available.
                  </ThemedText>
                ) : (
                  booksModalChaptersSorted.map((chapter, idx) => (
                    <TouchableOpacity
                      key={`${chapter.id}-${idx}`}
                      style={[
                        styles.booksChapterGridCell,
                        { width: `${100 / chapterGridColumns}%`, maxWidth: `${100 / chapterGridColumns}%` },
                      ]}
                      onPress={() => {
                        if (!selectedSubjectData) return;
                        if (booksChapterIntent === 'either') {
                          setBooksEitherPendingChapter(chapter);
                          setBooksChapterModalStep('eitherPick');
                        } else if (booksChapterIntent === 'flashcards') {
                          void applyBooksChapterAndOpenFlashcards(chapter, selectedSubjectData.name);
                        } else {
                          void applyBooksChapterAndStartMcq(chapter, selectedSubject);
                        }
                      }}
                      activeOpacity={0.85}
                    >
                      <View
                        style={[
                          styles.booksChapterTile,
                          {
                            backgroundColor: isDarkMode ? 'rgba(255,255,255,0.04)' : 'rgba(2,6,23,0.03)',
                            borderColor: isDarkMode ? 'rgba(255,255,255,0.10)' : 'rgba(15,23,42,0.10)',
                          },
                        ]}
                      >
                        <ThemedText style={[styles.booksChapterGridCellIndexText, { color: isDarkMode ? '#FFFFFF' : BRAND_BLUE }]}>
                          {idx + 1}
                        </ThemedText>
                      </View>
                    </TouchableOpacity>
                  ))
                )}
                </View>
              </View>
            </ScrollView>
          )}
        </ThemedView>
      </View>
    </Modal>
  );
}
