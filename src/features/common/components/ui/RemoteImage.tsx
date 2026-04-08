import React, { useState, useEffect, useRef } from 'react';
import {
  Image,
  ImageProps,
  ImageSourcePropType,
  View,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/core/providers/ThemeProvider';
import { getColors } from '@/features/common/constants/Colors';
import { ImageSkeleton } from './ImageSkeleton';
import { REMOTE_IMAGE_CACHE } from './remoteImage.constants';
import { remoteImageStyles as styles } from './RemoteImage.styles';

interface RemoteImageProps extends Omit<ImageProps, 'source'> {
  remoteUrl?: string | null;
  fallbackSource: ImageSourcePropType;
  onError?: () => void;
  onLoad?: () => void;
  showLoadingIndicator?: boolean;
  loadingIndicatorSize?: 'small' | 'large';
  loadingIndicatorColor?: string;
  showProgressBar?: boolean;
  cacheKey?: string;
  priority?: 'low' | 'normal' | 'high';
  progressive?: boolean;
  showSkeleton?: boolean;
}

export function RemoteImage({ 
  remoteUrl, 
  fallbackSource, 
  onError, 
  onLoad,
  showLoadingIndicator = true,
  loadingIndicatorSize = 'small',
  loadingIndicatorColor,
  showProgressBar = false,
  cacheKey,
  priority = 'normal',
  progressive = true,
  showSkeleton = true,
  style,
  ...props 
}: RemoteImageProps) {
  const { isDarkMode } = useTheme();
  const colors = getColors(isDarkMode);
  
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cachedImageUri, setCachedImageUri] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const loadingAnim = useRef(new Animated.Value(0)).current;
  
  const indicatorColor = loadingIndicatorColor || colors.tint;

  
  const getCacheKey = () => {
    return cacheKey || `${REMOTE_IMAGE_CACHE.prefix}${remoteUrl}`;
  };

  
  const checkCache = async () => {
    if (!remoteUrl) return null;
    
    try {
      const key = getCacheKey();
      const cached = await AsyncStorage.getItem(key);
      
      if (cached) {
        const { uri, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        
        if (now - timestamp < REMOTE_IMAGE_CACHE.expiryMs) {
          return uri;
        } else {
          
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
    }
    
    return null;
  };

  
  const saveToCache = async (uri: string) => {
    if (!remoteUrl) return;
    
    try {
      const key = getCacheKey();
      const cacheData = {
        uri,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
    }
  };

  
  const loadImage = async () => {
    if (!remoteUrl || imageError) return;

    setIsLoading(true);
    setProgress(0);
    
    
    Animated.loop(
      Animated.sequence([
        Animated.timing(loadingAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(loadingAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();

    try {
      
      const cachedUri = await checkCache();
      if (cachedUri) {
        setCachedImageUri(cachedUri);
        setIsLoading(false);
        setImageLoaded(true);
        fadeInImage();
        return;
      }

      
      
      await saveToCache(remoteUrl);
      setCachedImageUri(remoteUrl);
      setImageLoaded(true);
      fadeInImage();
      
    } catch (error) {
      setImageError(true);
      onError?.();
    } finally {
      setIsLoading(false);
      loadingAnim.stopAnimation();
    }
  };

  const fadeInImage = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  useEffect(() => {
    if (remoteUrl && !imageError) {
      loadImage();
    }
  }, [remoteUrl, imageError]);

  const source = cachedImageUri 
    ? { uri: cachedImageUri }
    : remoteUrl && !imageError 
    ? { uri: remoteUrl }
    : fallbackSource;


  const handleLoad = () => {
    setImageLoaded(true);
    fadeInImage();
    onLoad?.();
  };

  const handleError = () => {
    setImageError(true);
    setIsLoading(false);
    onError?.();
  };

  const loadingRotation = loadingAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      
      {isLoading && showSkeleton && (
        <ImageSkeleton 
          width="100%" 
          height="100%" 
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
        />
      )}
      
      
      <Animated.Image
        {...props}
        source={source}
        onLoad={handleLoad}
        onError={handleError}
        style={[
          styles.image,
          { opacity: fadeAnim },
          style
        ]}
      />
      
      
      {isLoading && showLoadingIndicator && !showSkeleton && (
        <View style={styles.loadingOverlay}>
          <LinearGradient
            colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.1)']}
            style={styles.loadingGradient}
          >
            <Animated.View style={[
              styles.loadingContainer,
              { transform: [{ rotate: loadingRotation }] }
            ]}>
              <ActivityIndicator 
                size={loadingIndicatorSize} 
                color={indicatorColor}
              />
            </Animated.View>
          </LinearGradient>
        </View>
      )}
      
      
      {isLoading && showProgressBar && progress > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBackground}>
            <Animated.View 
              style={[
                styles.progressFill,
                { 
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: indicatorColor
                }
              ]} 
            />
          </View>
          <Animated.Text style={[
            styles.progressText,
            { color: indicatorColor }
          ]}>
            {Math.round(progress)}%
          </Animated.Text>
        </View>
      )}
    </View>
  );
}