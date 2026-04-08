import React, { useEffect, useRef } from 'react';
import { View, Animated, ViewStyle, DimensionValue } from 'react-native';
import { useTheme } from '@/core/providers/ThemeProvider';
import { IMAGE_SKELETON } from './imageSkeleton.constants';
import { imageSkeletonStyles as styles } from './ImageSkeleton.styles';

interface ImageSkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  style?: ViewStyle;
  borderRadius?: number;
  animated?: boolean;
}

export function ImageSkeleton({
  width = '100%',
  height = '100%',
  style,
  borderRadius = IMAGE_SKELETON.defaultBorderRadius,
  animated = true,
}: ImageSkeletonProps) {
  const { isDarkMode } = useTheme();

  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const shimmerAnimation = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: IMAGE_SKELETON.shimmerDurationMs,
          useNativeDriver: true,
        }),
      );

      shimmerAnimation.start();

      return () => {
        shimmerAnimation.stop();
      };
    }
  }, [animated, shimmerAnim]);

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [...IMAGE_SKELETON.shimmerTranslateRange],
  });

  const backgroundColor = isDarkMode ? '#2a2a2a' : '#f0f0f0';
  const shimmerColor = isDarkMode ? '#3a3a3a' : '#e0e0e0';

  return (
    <View
      style={[
        styles.container,
        {
          width,
          height,
          borderRadius,
          backgroundColor,
        },
        style,
      ]}
    >
      {animated && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              width: IMAGE_SKELETON.shimmerWidth,
              opacity: IMAGE_SKELETON.shimmerOpacity,
              transform: [{ translateX: shimmerTranslateX }],
              backgroundColor: shimmerColor,
            },
          ]}
        />
      )}
    </View>
  );
}
