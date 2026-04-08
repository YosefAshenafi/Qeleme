import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BRAND_BLUE_RGB } from '@/features/home/constants/homeUi';
import { HomeScreenStyles as styles } from './HomeScreen.styles';

type SubjectCoverAtmosphereProps = {
  dark: boolean;
};

export function SubjectCoverAtmosphere({ dark }: SubjectCoverAtmosphereProps) {
  return (
    <View style={styles.subjectGridAtmosphereRoot} pointerEvents="none">
      <LinearGradient
        colors={dark ? ['#1A2838', '#1F3044', '#243A4D'] : ['#D8EAF9', '#E8F3FC', '#F4F9FE']}
        locations={[0, 0.52, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={
          dark
            ? [`rgba(${BRAND_BLUE_RGB},0.2)`, `rgba(${BRAND_BLUE_RGB},0.07)`, 'transparent']
            : [`rgba(${BRAND_BLUE_RGB},0.12)`, `rgba(${BRAND_BLUE_RGB},0.045)`, 'transparent']
        }
        locations={[0, 0.42, 1]}
        start={{ x: 0.5, y: 1 }}
        end={{ x: 0.5, y: 0 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={
          dark
            ? ['rgba(186,230,253,0.14)', 'transparent', 'transparent']
            : ['rgba(255,255,255,0.5)', 'rgba(255,255,255,0.06)', 'transparent']
        }
        locations={[0, 0.38, 1]}
        start={{ x: 0.12, y: 0 }}
        end={{ x: 0.88, y: 0.78 }}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}
