import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, ViewStyle, DimensionValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';

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
  borderRadius = 8,
  animated = true
}: ImageSkeletonProps) {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      const shimmerAnimation = Animated.loop(
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        })
      );

      shimmerAnimation.start();

      return () => {
        shimmerAnimation.stop();
      };
    }
  }, [animated, shimmerAnim]);

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-150, 150],
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
        style
      ]}
    >
      {animated && (
        <Animated.View
          style={[
            styles.shimmer,
            {
              transform: [{ translateX: shimmerTranslateX }],
              backgroundColor: shimmerColor,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 200,
    opacity: 0.6,
  },
}); 