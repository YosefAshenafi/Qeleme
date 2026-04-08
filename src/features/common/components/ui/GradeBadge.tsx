import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { grades } from '@/features/common/constants/Grades';
import { gradeBadgeStyles as styles } from './GradeBadge.styles';

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

  
  let normalizedGrade = grade;
  
  
  if (grade.toLowerCase() === 'kg') {
    normalizedGrade = 'KG';
  } else if (grade.toLowerCase().startsWith('grade ')) {
    
    const gradeNumber = grade.toLowerCase().replace('grade ', '');
    normalizedGrade = gradeNumber;
  }

  
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
