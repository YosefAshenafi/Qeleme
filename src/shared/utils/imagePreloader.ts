import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'image_preload_cache_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; // 7 days

interface CacheEntry {
  uri: string;
  timestamp: number;
  size: number;
}

export class ImagePreloader {
  private static instance: ImagePreloader;
  private preloadQueue: string[] = [];
  private isProcessing = false;

  static getInstance(): ImagePreloader {
    if (!ImagePreloader.instance) {
      ImagePreloader.instance = new ImagePreloader();
    }
    return ImagePreloader.instance;
  }

  // Preload a single image
  async preloadImage(url: string, priority: 'low' | 'normal' | 'high' = 'normal'): Promise<string | null> {
    try {
      // Check if already cached
      const cached = await this.getCachedImage(url);
      if (cached) {
        return cached;
      }

      // Add to queue based on priority
      if (priority === 'high') {
        this.preloadQueue.unshift(url);
      } else {
        this.preloadQueue.push(url);
      }

      // Process queue if not already processing
      if (!this.isProcessing) {
        this.processQueue();
      }

      return null;
    } catch (error) {
      console.warn('Image preload failed:', error);
      return null;
    }
  }

  // Preload multiple images
  async preloadImages(urls: string[], priority: 'low' | 'normal' | 'high' = 'normal'): Promise<void> {
    const promises = urls.map(url => this.preloadImage(url, priority));
    await Promise.allSettled(promises);
  }

  // Process the preload queue
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.preloadQueue.length > 0) {
      const url = this.preloadQueue.shift();
      if (!url) continue;

      try {
        await this.downloadAndCache(url);
      } catch (error) {
        console.warn('Failed to preload image:', url, error);
      }

      // Small delay to prevent overwhelming the network
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  // Download and cache an image
  private async downloadAndCache(url: string): Promise<void> {
    try {
      // For React Native, we'll just verify the URL is accessible
      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Cache the original URL
      await this.cacheImage(url, url, 0);
    } catch (error) {
      console.warn('Failed to verify image URL:', url, error);
      throw error;
    }
  }

  // Cache an image
  private async cacheImage(url: string, uri: string, size: number): Promise<void> {
    try {
      const key = `${CACHE_PREFIX}${url}`;
      const cacheEntry: CacheEntry = {
        uri,
        timestamp: Date.now(),
        size
      };
      
      await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
    } catch (error) {
      console.warn('Failed to cache image:', error);
    }
  }

  // Get cached image
  private async getCachedImage(url: string): Promise<string | null> {
    try {
      const key = `${CACHE_PREFIX}${url}`;
      const cached = await AsyncStorage.getItem(key);
      
      if (cached) {
        const entry: CacheEntry = JSON.parse(cached);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - entry.timestamp < CACHE_EXPIRY) {
          return entry.uri;
        } else {
          // Remove expired cache
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
      console.warn('Cache check failed:', error);
    }
    
    return null;
  }

  // Clear expired cache entries
  async clearExpiredCache(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const imageKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      const now = Date.now();
      const keysToRemove: string[] = [];
      
      for (const key of imageKeys) {
        try {
          const cached = await AsyncStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry = JSON.parse(cached);
            if (now - entry.timestamp >= CACHE_EXPIRY) {
              keysToRemove.push(key);
            }
          }
        } catch (error) {
          // If we can't parse the entry, remove it
          keysToRemove.push(key);
        }
      }
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
        console.log(`Cleared ${keysToRemove.length} expired image cache entries`);
      }
    } catch (error) {
      console.warn('Failed to clear expired cache:', error);
    }
  }

  // Get cache statistics
  async getCacheStats(): Promise<{ totalEntries: number; totalSize: number }> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const imageKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      
      let totalSize = 0;
      const now = Date.now();
      
      for (const key of imageKeys) {
        try {
          const cached = await AsyncStorage.getItem(key);
          if (cached) {
            const entry: CacheEntry = JSON.parse(cached);
            if (now - entry.timestamp < CACHE_EXPIRY) {
              totalSize += entry.size;
            }
          }
        } catch (error) {
          // Skip invalid entries
        }
      }
      
      return {
        totalEntries: imageKeys.length,
        totalSize
      };
    } catch (error) {
      console.warn('Failed to get cache stats:', error);
      return { totalEntries: 0, totalSize: 0 };
    }
  }
}

// Export singleton instance
export const imagePreloader = ImagePreloader.getInstance(); 