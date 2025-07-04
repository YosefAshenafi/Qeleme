import React, { useState, useEffect, useRef } from 'react';
import { 
  Image, 
  ImageProps, 
  ImageSourcePropType, 
  View, 
  ActivityIndicator, 
  StyleSheet,
  Animated,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/contexts/ThemeContext';
import { getColors } from '@/constants/Colors';
import { ImageSkeleton } from './ImageSkeleton';

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

const CACHE_PREFIX = 'remote_image_cache_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

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

  // Generate cache key if not provided
  const getCacheKey = () => {
    return cacheKey || `${CACHE_PREFIX}${remoteUrl}`;
  };

  // Check cache for existing image
  const checkCache = async () => {
    if (!remoteUrl) return null;
    
    try {
      const key = getCacheKey();
      const cached = await AsyncStorage.getItem(key);
      
      if (cached) {
        const { uri, timestamp } = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - timestamp < CACHE_EXPIRY) {
          return uri;
        } else {
          // Remove expired cache
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Cache check failed:', error);
    }
    
    return null;
  };

  // Save image to cache
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
      console.warn('Cache save failed:', error);
    }
  };

  // Load image with progress tracking
  const loadImage = async () => {
    if (!remoteUrl || imageError) return;

    setIsLoading(true);
    setProgress(0);
    
    // Start loading animation
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
      // Check cache first
      const cachedUri = await checkCache();
      if (cachedUri) {
        setCachedImageUri(cachedUri);
        setIsLoading(false);
        setImageLoaded(true);
        fadeInImage();
        return;
      }

      // For React Native, we'll use a simpler approach
      // Just cache the URL and let React Native handle the image loading
      await saveToCache(remoteUrl);
      setCachedImageUri(remoteUrl);
      setImageLoaded(true);
      fadeInImage();
      
    } catch (error) {
      console.warn('Image load failed:', error);
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
      console.log('Loading image:', remoteUrl);
      loadImage();
    }
  }, [remoteUrl, imageError]);

  const source = cachedImageUri 
    ? { uri: cachedImageUri }
    : remoteUrl && !imageError 
    ? { uri: remoteUrl }
    : fallbackSource;

  console.log('Image source:', source);

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
      {/* Skeleton Loading */}
      {isLoading && showSkeleton && (
        <ImageSkeleton 
          width="100%" 
          height="100%" 
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }}
        />
      )}
      
      {/* Main Image */}
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
      
      {/* Loading Overlay */}
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
      
      {/* Progress Bar */}
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

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  progressContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  progressBackground: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'right',
  },
}); 