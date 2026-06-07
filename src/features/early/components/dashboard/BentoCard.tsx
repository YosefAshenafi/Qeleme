import React from 'react';
import { View, Text, TouchableOpacity, Image, type ImageSourcePropType } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { KG_DESIGN_TOKENS } from '../../constants/DesignTokens';
import { IconSymbol } from '@/features/common/components/ui/IconSymbol';
import { BentoCardStyles as styles } from './BentoCard.styles';

interface BentoCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
  imageSource?: ImageSourcePropType;
  variant: 'large' | 'small' | 'icon';
  backgroundColor?: string;
  icon?: string;
  badge?: string;
  onPress: () => void;
  isDarkMode?: boolean;
}

export const BentoCard: React.FC<BentoCardProps> = ({
  title,
  subtitle,
  imageUrl,
  imageSource,
  variant,
  backgroundColor,
  icon,
  badge,
  onPress,
  isDarkMode
}) => {
  const colors = KG_DESIGN_TOKENS.colors;
  const resolvedImageSource = imageSource || (imageUrl ? { uri: imageUrl } : null);
  const isImageVariant = variant === 'large' || variant === 'small' || (variant === 'icon' && !!resolvedImageSource);

  const cardStyle = [
    styles.container,
    variant === 'large' ? styles.large : styles.small,
    !isImageVariant && backgroundColor ? { backgroundColor } : { backgroundColor: colors.surface },
    { shadowColor: colors.primary, elevation: 4 }
  ];

  if (title !== 'Maths') {
  }

  return (
    <TouchableOpacity
      style={cardStyle}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {isImageVariant && resolvedImageSource ? (
        <>
          <Image
            source={resolvedImageSource}
            style={styles.backgroundImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['transparent', 'rgba(0, 75, 226, 0.8)']}
            style={styles.gradient}
          />
          <View style={styles.topRightIcon}>
            {icon ? (
              <Text style={styles.iconText}>{icon}</Text>
            ) : (
              <IconSymbol name="pets" size={24} color={colors.primary} />
            )}
          </View>
          <View style={styles.contentOverlay}>
            {badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
            <Text style={styles.titleLarge}>{title}</Text>
            {subtitle && <Text style={styles.subtitleLarge}>{subtitle}</Text>}
          </View>
        </>
      ) : (
        <View style={styles.iconContent}>
          <View style={[styles.iconContainer, { backgroundColor: backgroundColor || colors.tertiary }]}>
            {icon ? (
              <Text style={styles.largeIconText}>{icon}</Text>
            ) : (
              <IconSymbol name="calculate" size={32} color="white" />
            )}
          </View>
          <View>
            <Text style={[styles.titleSmall, { color: backgroundColor || colors.tertiary }]}>{title}</Text>
            {subtitle && <Text style={styles.subtitleSmall}>{subtitle}</Text>}
          </View>

          <View style={styles.bottomIconOverlay}>
            <Text style={[styles.patternText, { color: backgroundColor || colors.tertiary, opacity: 0.1 }]}>+ =</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};
