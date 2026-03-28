import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { KG_DESIGN_TOKENS } from '../../constants/DesignTokens';

interface ExplorerHeroProps {
  name?: string;
  isDarkMode?: boolean;
}

export const ExplorerHero: React.FC<ExplorerHeroProps> = ({ name, isDarkMode }) => {
  const colors = KG_DESIGN_TOKENS.colors;
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : colors.primary }]}>
        Hello, Explorer!
      </Text>
      <Text style={[styles.subtitle, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : colors.onSurfaceVariant }]}>
        Ready to learn something amazing today? Choose a path below to start your adventure.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 32,
  },
  title: {
    fontFamily: 'System',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: 'System',
    fontSize: 18,
    fontWeight: '500',
    lineHeight: 24,
    maxWidth: '90%',
  },
});
