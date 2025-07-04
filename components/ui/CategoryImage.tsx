import React from 'react';
import { StyleSheet, ImageStyle } from 'react-native';
import { RemoteImage } from './RemoteImage';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { getOptimizedImageUrl } from '@/utils/imageOptimizer';

interface CategoryImageProps {
  imageUrl?: string | null;
  fallbackUrl?: string;
  style?: ImageStyle;
  showProgressBar?: boolean;
  priority?: 'low' | 'normal' | 'high';
  cacheKey?: string;
  preset?: 'category' | 'subcategory' | 'thumbnail' | 'question' | 'profile';
}

export function CategoryImage({ 
  imageUrl, 
  fallbackUrl,
  style,
  showProgressBar = false,
  priority = 'normal',
  cacheKey,
  preset = 'category'
}: CategoryImageProps) {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);

  // For now, use the original URL without optimization to fix loading issues
  // const optimizedUrl = imageUrl ? getOptimizedImageUrl(imageUrl, preset) : null;
  // const optimizedFallbackUrl = fallbackUrl ? getOptimizedImageUrl(fallbackUrl, preset) : fallbackUrl;

  return (
    <RemoteImage
      remoteUrl={imageUrl}
      fallbackSource={{ uri: fallbackUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop&crop=center' }}
      style={[styles.categoryImage, style]}
      resizeMode="cover"
      showLoadingIndicator={true}
      loadingIndicatorSize="small"
      loadingIndicatorColor={colors.tint}
      showProgressBar={showProgressBar}
      priority={priority}
      cacheKey={cacheKey}
      progressive={true}
      showSkeleton={true}
    />
  );
}

const styles = StyleSheet.create({
  categoryImage: {
    width: '100%',
    height: '100%',
  },
}); 