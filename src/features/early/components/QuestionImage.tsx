import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import i18n from 'i18next';
import { ThemedText } from '@/features/common/components/ThemedText';
import { ImageSkeleton } from '@/features/common/components/ui/ImageSkeleton';
import { getColors } from '@/features/common/constants/Colors';
import type { Question } from '../hooks/useQuizData';
import { EarlyPictureScreenStyles as styles } from './EarlyPictureScreen.styles';

type QuestionImageProps = {
  question: Question;
  setImageStates: React.Dispatch<React.SetStateAction<Record<number, { loading: boolean; error: boolean; loaded: boolean }>>>;
  colors: ReturnType<typeof getColors>;
};

export const QuestionImage = React.memo(({ question, setImageStates, colors }: QuestionImageProps) => {
  const imageUri = typeof question.image === 'string' ? question.image.trim() : '';
  const [imageReady, setImageReady] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageReady(false);
    setImageFailed(false);
  }, [question.id, imageUri]);

  if (!imageUri) {
    return (
      <View style={styles.imageErrorContainer}>
        <ThemedText style={[styles.imageErrorText, { color: colors.text }]}>
          {i18n.t('mcq.pictureQuiz.noImage', 'No image for this question')}
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={questionImageInner.container}>
      {!imageReady && !imageFailed && (
        <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
          <ImageSkeleton width="100%" height="100%" borderRadius={0} />
        </View>
      )}
      {imageFailed ? (
        <View style={styles.imageErrorContainer}>
          <ThemedText style={[styles.imageErrorText, { color: colors.text }]}>
            {i18n.t('mcq.pictureQuiz.imageLoadError', 'Could not load image')}
          </ThemedText>
        </View>
      ) : (
        <Image
          style={[styles.questionImage, !imageReady && questionImageInner.hiddenWhileLoading]}
          source={{ uri: imageUri }}
          resizeMode="contain"
          onLoad={() => {
            setImageReady(true);
            setImageStates((prev) => ({
              ...prev,
              [question.id]: { loading: false, error: false, loaded: true },
            }));
          }}
          onError={() => {
            setImageFailed(true);
            setImageReady(false);
            setImageStates((prev) => ({
              ...prev,
              [question.id]: { loading: false, error: true, loaded: false },
            }));
          }}
        />
      )}
    </View>
  );
});

QuestionImage.displayName = 'QuestionImage';

const questionImageInner = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  hiddenWhileLoading: {
    opacity: 0,
  },
});
