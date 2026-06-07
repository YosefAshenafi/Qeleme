import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { EarlyPictureScreenStyles as styles } from './EarlyPictureScreen.styles';

type QuizOption = { id: string; text_en?: string; text_am?: string; isCorrect?: boolean };

interface EarlyPictureOptionsProps {
  options: QuizOption[];
  selectedAnswer: string | null;
  hoveredOption: string | null;
  isImageDragging: boolean;
  optionRowRefs: React.MutableRefObject<Record<string, View | null>>;
  onSelect: (optionId: string) => void;
  onMeasure: () => void;
}

const FUN_COLORS = ['#2196F3', '#FF9800', '#9C27B0', '#00BCD4'];

export function EarlyPictureOptions({
  options,
  selectedAnswer,
  hoveredOption,
  isImageDragging,
  optionRowRefs,
  onSelect,
  onMeasure,
}: EarlyPictureOptionsProps) {
  return (
    <View style={styles.kgOptionsContainer}>
      {options.map((option, index) => {
        const funColor = FUN_COLORS[index % FUN_COLORS.length];
        const isHovered = hoveredOption === option.id;
        const isDropTarget = isHovered;
        const textEn = option.text_en?.trim() ?? '';
        const textAm = option.text_am?.trim() ?? '';
        const showAmharic = textAm !== '' && textAm !== textEn;
        return (
          <View
            key={option.id}
            ref={(el) => {
              optionRowRefs.current[option.id] = el;
            }}
            onLayout={onMeasure}
          >
            <TouchableOpacity
              style={[
                styles.kgOptionButton,
                styles.kgOptionButtonBounce,
                isImageDragging && !isHovered && styles.kgOptionButtonDimmed,
                isHovered && styles.kgOptionButtonHovered,
                isDropTarget && styles.kgOptionButtonDropTarget,
                {
                  backgroundColor:
                    selectedAnswer !== null
                      ? option.isCorrect
                        ? '#22C55E'
                        : selectedAnswer === option.id
                          ? '#F44336'
                          : funColor
                      : isHovered
                        ? '#1565C0'
                        : funColor,
                },
              ]}
              onPress={() => onSelect(option.id)}
              activeOpacity={0.8}
              disabled={selectedAnswer !== null}
            >
              <View style={styles.optionTextRow}>
                <Text style={styles.kgOptionText}>{option.text_en}</Text>
                {showAmharic && <Text style={styles.kgOptionTextAmharic}>{option.text_am}</Text>}
              </View>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}
