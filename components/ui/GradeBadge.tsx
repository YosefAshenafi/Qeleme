import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { grades } from '@/constants/Grades';

interface GradeBadgeProps {
  grade?: string;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'outlined' | 'minimal';
}

export function GradeBadge({ 
  grade, 
  size = 'medium', 
  variant = 'default' 
}: GradeBadgeProps) {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  if (!grade) {
    return null;
  }

  // Normalize the grade format to match our constants
  let normalizedGrade = grade;
  
  // Handle different grade formats from the server
  if (grade.toLowerCase() === 'kg') {
    normalizedGrade = 'KG';
  } else if (grade.toLowerCase().startsWith('grade ')) {
    // Extract the number from "grade 3" format
    const gradeNumber = grade.toLowerCase().replace('grade ', '');
    normalizedGrade = gradeNumber;
  }

  // Find the grade label from the grades array
  const gradeData = grades.find(g => g.value === normalizedGrade);
  const gradeLabel = gradeData?.label || `Grade ${normalizedGrade}`;

  const sizeConfig = {
    small: {
      container: styles.smallContainer,
      text: styles.smallText,
      icon: styles.smallIcon,
    },
    medium: {
      container: styles.mediumContainer,
      text: styles.mediumText,
      icon: styles.mediumIcon,
    },
    large: {
      container: styles.largeContainer,
      text: styles.largeText,
      icon: styles.largeIcon,
    },
  };

  const variantConfig = {
    default: {
      container: [sizeConfig[size].container, { backgroundColor: colors.tint }],
      text: [sizeConfig[size].text, { color: '#FFFFFF' }],
      icon: [sizeConfig[size].icon, { color: '#FFFFFF' }],
    },
    outlined: {
      container: [
        sizeConfig[size].container, 
        { 
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderColor: colors.tint,
        }
      ],
      text: [sizeConfig[size].text, { color: colors.tint }],
      icon: [sizeConfig[size].icon, { color: colors.tint }],
    },
    minimal: {
      container: [
        sizeConfig[size].container, 
        { 
          backgroundColor: colors.cardAlt,
        }
      ],
      text: [sizeConfig[size].text, { color: colors.text }],
      icon: [sizeConfig[size].icon, { color: colors.tint }],
    },
  };

  const config = variantConfig[variant];

  if (variant === 'default') {
    return (
      <LinearGradient
        colors={[colors.tint, colors.tint + 'DD']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[config.container, styles.gradientContainer]}
      >
        <Text style={config.icon}>🎓</Text>
        <Text style={config.text} numberOfLines={1}>
          {gradeLabel}
        </Text>
      </LinearGradient>
    );
  }

  return (
    <View style={config.container}>
      <Text style={config.icon}>🎓</Text>
      <Text style={config.text} numberOfLines={1}>
        {gradeLabel}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  gradientContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  // Small size
  smallContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  smallText: {
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  smallIcon: {
    fontSize: 12,
  },
  // Medium size
  mediumContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  mediumText: {
    fontSize: 14,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  mediumIcon: {
    fontSize: 14,
  },
  // Large size
  largeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  largeText: {
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.4,
  },
  largeIcon: {
    fontSize: 16,
  },
});
