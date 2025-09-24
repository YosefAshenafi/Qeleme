import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Dimensions, Text } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';

const { width, height } = Dimensions.get('window');

export default function CustomSplashScreen() {
  const { isDarkMode } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textScaleAnim = useRef(new Animated.Value(0.5)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start the zoom animation for icon
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Start the text animation with a slight delay
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textScaleAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(textOpacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);
  }, []);

  const themeColor = isDarkMode ? '#8B6BCE' : '#6B54AE';

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: themeColor,
        justifyContent: 'center',
        alignItems: 'center',
        width: width,
        height: height,
      }}
    >
      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          alignItems: 'center',
        }}
      >
        <Image
          source={require('@/assets/images/logo/white-logo.png')}
          style={{
            width: 150,
            height: 150,
            resizeMode: 'contain',
          }}
        />
        <Animated.View
          style={{
            transform: [{ scale: textScaleAnim }],
            opacity: textOpacityAnim,
            marginTop: 20,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 32,
              fontWeight: 'bold',
              letterSpacing: 2,
              textAlign: 'center',
            }}
          >
            Qelem
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
