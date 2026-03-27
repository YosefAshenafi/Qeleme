import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Text, useColorScheme } from 'react-native';

export default function CustomSplashScreen() {
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const textScaleAnim = useRef(new Animated.Value(0.5)).current;
  const textOpacityAnim = useRef(new Animated.Value(0)).current;
  const lineScaleAnim = useRef(new Animated.Value(0)).current;
  const subtitleOpacityAnim = useRef(new Animated.Value(0)).current;

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

    // Start the line animation
    setTimeout(() => {
      Animated.timing(lineScaleAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }).start();
    }, 600);

    // Start the subtitle animation
    setTimeout(() => {
      Animated.timing(subtitleOpacityAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }).start();
    }, 800);
  }, []);

  return (
    <View 
      style={{
        flex: 1,
        backgroundColor: '#2563EB', // Blue background as shown in design
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* Background watermark M */}
      <View
        style={{
          position: 'absolute',
          opacity: 0.1,
        }}
      >
        <Text
          style={{
            color: 'white',
            fontSize: 200,
            fontWeight: 'bold',
          }}
        >
          M
        </Text>
      </View>

      <Animated.View
        style={{
          transform: [{ scale: scaleAnim }],
          opacity: opacityAnim,
          alignItems: 'center',
        }}
      >
        {/* White square with rounded corners containing the MegaTest icon */}
        <View
          style={{
            width: 120,
            height: 120,
            backgroundColor: 'white',
            borderRadius: 20,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <Image
            source={require('../../../assets/images/logo.png')}
            style={{ width: 90, height: 90 }}
            resizeMode="contain"
          />
        </View>

        {/* White horizontal line */}
        <Animated.View
          style={{
            width: 60,
            height: 2,
            backgroundColor: 'white',
            marginBottom: 15,
            transform: [{ scaleX: lineScaleAnim }],
            opacity: textOpacityAnim,
          }}
        />

        {/* MegaTest text */}
        <Animated.View
          style={{
            transform: [{ scale: textScaleAnim }],
            opacity: textOpacityAnim,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: 'white',
              fontSize: 36,
              fontWeight: 'bold',
              letterSpacing: 2,
              textAlign: 'center',
            }}
          >
            MegaTest
          </Text>
          
          {/* Subtitle text */}
          <Animated.View
            style={{
              opacity: subtitleOpacityAnim,
              marginTop: 8,
            }}
          >
            <Text
              style={{
                color: 'rgba(255, 255, 255, 0.7)',
                fontSize: 12,
                fontWeight: '300',
                letterSpacing: 3,
                textAlign: 'center',
              }}
            >
              THE ACADEMIC VANGUARD
            </Text>
          </Animated.View>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
