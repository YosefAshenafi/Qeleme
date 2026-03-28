import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { KG_DESIGN_TOKENS } from '../../constants/DesignTokens';

export const BadgePromo: React.FC = () => {
  const colors = KG_DESIGN_TOKENS.colors;
  
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDim]}
        style={styles.card}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Win the "Jungle Explorer" Badge</Text>
          <Text style={styles.subtitle}>Complete 3 Wild Animal lessons this week to unlock this special prize!</Text>
          
          <TouchableOpacity style={styles.button} activeOpacity={0.9}>
            <Text style={[styles.buttonText, { color: colors.primary }]}>Go To Jungle</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.watermarkContainer}>
          <Text style={styles.watermark}>M+</Text>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginBottom: 48,
  },
  card: {
    padding: 32,
    borderRadius: 48,
    overflow: 'hidden',
    shadowOpacity: 0.2,
    elevation: 8,
  },
  content: {
    maxWidth: '80%',
    zIndex: 2,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    fontWeight: '500',
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    backgroundColor: 'white',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 32,
    alignSelf: 'flex-start',
    shadowOpacity: 0.1,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '800',
  },
  watermarkContainer: {
    position: 'absolute',
    right: 24,
    top: 24,
    opacity: 0.15,
  },
  watermark: {
    fontSize: 140,
    fontWeight: '900',
    color: 'white',
    fontFamily: 'System',
    letterSpacing: -10,
  },
});
