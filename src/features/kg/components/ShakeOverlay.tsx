import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, withSequence, withRepeat, Easing } from 'react-native-reanimated';
import { shakeOverlayStyles as shakeStyles } from './ShakeOverlay.styles';

interface ShakeOverlayProps {
  visible: boolean;
  onAnimationEnd?: () => void;
  language?: string;
  delay?: number;
}

export const ShakeOverlay = ({ visible, onAnimationEnd, language = 'en', delay = 2000 }: ShakeOverlayProps) => {
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      shakeX.value = withSequence(
        withTiming(-10, { duration: 50, easing: Easing.linear }),
        withRepeat(withTiming(10, { duration: 100, easing: Easing.linear }), 4, true),
        withTiming(0, { duration: 50 }),
      );

      const timer = setTimeout(() => {
        onAnimationEnd?.();
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [visible, delay]);

  const animatedStyle = useAnimatedStyle(
    () =>
      ({
        transform: [{ translateX: shakeX.value }],
      }) as any,
  );

  const getTryAgainText = () => {
    return language === 'am' ? 'ስህተት!' : 'Incorrect!';
  };

  if (!visible) return null;

  return (
    <Animated.View style={[shakeStyles.container, animatedStyle]}>
      <View style={shakeStyles.iconContainer}>
        <Text style={shakeStyles.emoji}>😢</Text>
        <Text style={shakeStyles.text}>{getTryAgainText()}</Text>
      </View>
    </Animated.View>
  );
};
