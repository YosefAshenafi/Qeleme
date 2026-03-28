import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { KG_DESIGN_TOKENS } from '../../constants/DesignTokens';
import { IconSymbol } from '@/shared/components/ui/IconSymbol';

const { width } = Dimensions.get('window');

interface BentoCardProps {
  title: string;
  subtitle?: string;
  imageUrl?: string | null;
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
  variant, 
  backgroundColor, 
  icon, 
  badge, 
  onPress,
  isDarkMode 
}) => {
  const colors = KG_DESIGN_TOKENS.colors;
  const isImageVariant = variant === 'large' || variant === 'small' || (variant === 'icon' && imageUrl);

  const cardStyle = [
    styles.container,
    variant === 'large' ? styles.large : styles.small,
    !isImageVariant && backgroundColor ? { backgroundColor } : { backgroundColor: colors.surface },
    { shadowColor: colors.primary, elevation: 4 }
  ];

  return (
    <TouchableOpacity 
      style={cardStyle} 
      activeOpacity={0.9} 
      onPress={onPress}
    >
      {isImageVariant && imageUrl ? (
        <>
          <Image 
            source={{ uri: imageUrl }} 
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

const styles = StyleSheet.create({
  container: {
    borderRadius: 32,
    overflow: 'hidden',
    marginBottom: 0,
    position: 'relative',
    borderBottomWidth: 4,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  large: {
    width: '100%',
    height: 240,
  },
  small: {
    width: '100%',
    height: 240,
  },
  backgroundImage: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
    height: '100%',
  },
  topRightIcon: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.2,
    elevation: 4,
  },
  iconText: {
    fontSize: 24,
  },
  contentOverlay: {
    position: 'absolute',
    bottom: 32,
    left: 24,
    right: 24,
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  titleLarge: {
    color: 'white',
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  subtitleLarge: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 4,
  },
  iconContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    transform: [{ rotate: '3deg' }],
  },
  largeIconText: {
    fontSize: 32,
  },
  titleSmall: {
    fontSize: 24,
    fontWeight: '800',
  },
  subtitleSmall: {
    color: 'rgba(0,0,0,0.6)',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 4,
  },
  bottomIconOverlay: {
    position: 'absolute',
    bottom: -10,
    right: -10,
  },
  patternText: {
    fontSize: 64,
    fontWeight: '900',
  },
});
