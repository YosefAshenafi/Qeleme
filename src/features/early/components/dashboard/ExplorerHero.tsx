import React from 'react';
import { View, Text } from 'react-native';
import { KG_DESIGN_TOKENS } from '../../constants/DesignTokens';
import { ExplorerHeroStyles as styles } from './ExplorerHero.styles';

interface ExplorerHeroProps {
  name?: string;
  isDarkMode?: boolean;
}

export const ExplorerHero: React.FC<ExplorerHeroProps> = ({ name, isDarkMode }) => {
  const colors = KG_DESIGN_TOKENS.colors;
  
  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: isDarkMode ? '#FFFFFF' : colors.primary }]}>
        Hello, {name?.trim() ? name.trim().split(/\s+/)[0] : 'Explorer'}!
      </Text>
      <Text style={[styles.subtitle, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : colors.onSurfaceVariant }]}>
        Ready to learn something amazing today? Choose a path below to start your adventure.
      </Text>
    </View>
  );
};
