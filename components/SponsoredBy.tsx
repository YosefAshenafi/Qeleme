import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { ThemedText } from './ThemedText';
import { useTheme } from '@/contexts/ThemeContext';

interface SponsoredByProps {
  style?: any;
}

export default function SponsoredBy({ style }: SponsoredByProps) {
  const { isDarkMode } = useTheme();
  
  return (
    <View style={[styles.container, style]}>
      <View style={[styles.sponsorCard, { 
        backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)',
        borderColor: isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)',
      }]}>
        <ThemedText style={[styles.sponsorText, { 
          color: isDarkMode ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
        }]}>
          Sponsored by
        </ThemedText>
        <Image
          source={require('@/assets/images/sponsor/zemen-bank-logo.png')}
          style={styles.sponsorLogo}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 20,
    paddingHorizontal: 20,
  },
  sponsorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    paddingHorizontal: 20,
    borderRadius: 25,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3,
  },
  sponsorText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  sponsorLogo: {
    width: 80,
    height: 30,
  },
});
