import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { useTranslation } from 'react-i18next';
import { BRAND_BLUE } from '@/features/practice/constants/practiceUi';
import { AUTO_NEXT_DELAY_OPTIONS } from '@/features/practice/hooks/usePracticeSettings';

type Props = {
  visible: boolean;
  onClose: () => void;
  autoNextEnabled: boolean;
  onToggleAutoNext: (value: boolean) => void;
  autoNextDelay: number;
  onChangeDelay: (ms: number) => void;
};

export function PracticeSettingsModal({
  visible,
  onClose,
  autoNextEnabled,
  onToggleAutoNext,
  autoNextDelay,
  onChangeDelay,
}: Props) {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  const { t } = useTranslation();

  const sheetBg = isDarkMode ? '#1B1F27' : '#FFFFFF';
  const muted = colors.text + (isDarkMode ? 'A0' : '99');
  const trackOff = isDarkMode ? '#3A4252' : '#D8DEE8';
  const chipIdleBg = isDarkMode ? '#252B36' : '#F1F4F9';
  const chipIdleBorder = isDarkMode ? '#333B49' : '#E5E9F0';

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable style={[styles.sheet, { backgroundColor: sheetBg }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.grabber} />

          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{t('mcq.settings.title')}</Text>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={26} color={muted} />
            </TouchableOpacity>
          </View>

          {/* Auto Next toggle */}
          <View style={styles.row}>
            <View style={[styles.rowIcon, { backgroundColor: BRAND_BLUE + '14' }]}>
              <Ionicons name="play-forward" size={20} color={BRAND_BLUE} />
            </View>
            <View style={styles.rowText}>
              <Text style={[styles.rowLabel, { color: colors.text }]}>{t('mcq.settings.autoNext')}</Text>
              <Text style={[styles.rowDesc, { color: muted }]}>{t('mcq.settings.autoNextDescription')}</Text>
            </View>
            <TouchableOpacity
              onPress={() => onToggleAutoNext(!autoNextEnabled)}
              activeOpacity={0.85}
              accessibilityRole="switch"
              accessibilityState={{ checked: autoNextEnabled }}
              style={[styles.toggle, { backgroundColor: autoNextEnabled ? BRAND_BLUE : trackOff }]}
            >
              <View style={[styles.toggleKnob, autoNextEnabled && styles.toggleKnobOn]} />
            </TouchableOpacity>
          </View>

          {/* Wait time chips */}
          <View style={[styles.waitBlock, { opacity: autoNextEnabled ? 1 : 0.45 }]} pointerEvents={autoNextEnabled ? 'auto' : 'none'}>
            <Text style={[styles.waitLabel, { color: muted }]}>{t('mcq.settings.waitTime')}</Text>
            <View style={styles.chipsRow}>
              {AUTO_NEXT_DELAY_OPTIONS.map((ms) => {
                const active = autoNextDelay === ms;
                return (
                  <TouchableOpacity
                    key={ms}
                    onPress={() => onChangeDelay(ms)}
                    activeOpacity={0.85}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: active ? BRAND_BLUE : chipIdleBg,
                        borderColor: active ? BRAND_BLUE : chipIdleBorder,
                      },
                    ]}
                  >
                    <Text style={[styles.chipText, { color: active ? '#FFFFFF' : colors.text }]}>{`${ms / 1000}s`}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <TouchableOpacity style={[styles.doneBtn, { backgroundColor: BRAND_BLUE }]} onPress={onClose} activeOpacity={0.9}>
            <Text style={styles.doneText}>{t('mcq.settings.done')}</Text>
          </TouchableOpacity>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 28,
    gap: 18,
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(148,163,184,0.5)',
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowIcon: {
    width: 40,
    height: 40,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowText: {
    flex: 1,
    gap: 2,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: '800',
  },
  rowDesc: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 16,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 999,
    padding: 3,
    justifyContent: 'center',
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignSelf: 'flex-start',
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
  waitBlock: {
    gap: 10,
  },
  waitLabel: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 7,
  },
  chip: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '800',
  },
  doneBtn: {
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
});
