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
  
  // Sponsor animation values
  // const sponsorSlideAnim = useRef(new Animated.Value(-width)).current;
  // const sponsorOpacityAnim = useRef(new Animated.Value(0)).current;

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

    // Start the sponsor animation after the main content is shown
    // setTimeout(() => {
    //   Animated.parallel([
    //     Animated.timing(sponsorSlideAnim, {
    //       toValue: 0,
    //       duration: 800,
    //       useNativeDriver: true,
    //     }),
    //     Animated.timing(sponsorOpacityAnim, {
    //       toValue: 1,
    //       duration: 600,
    //       useNativeDriver: true,
    //     }),
    //   ]).start();
    // }, 1200);
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

      {/* Sponsored by section */}
      {/* <Animated.View
        style={{
          position: 'absolute',
          bottom: 60,
          left: 0,
          right: 0,
          transform: [{ translateX: sponsorSlideAnim }],
          opacity: sponsorOpacityAnim,
          alignItems: 'center',
          paddingHorizontal: 20,
        }}
      >
        <View
          style={{
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: 25,
            paddingVertical: 12,
            paddingHorizontal: 20,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          }}
        >
          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 14,
              fontWeight: '500',
              marginRight: 8,
              letterSpacing: 0.5,
            }}
          >
            Sponsored by
          </Text>
          <Image
            source={require('@/assets/images/sponsor/zemen-bank-logo.png')}
            style={{
              width: 80,
              height: 30,
              resizeMode: 'contain',
            }}
          />
        </View>
      </Animated.View> */}
    </View>
  );
}
