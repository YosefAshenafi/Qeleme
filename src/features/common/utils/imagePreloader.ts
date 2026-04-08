import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'image_preload_cache_';
const CACHE_EXPIRY = 7 * 24 * 60 * 60 * 1000; 

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

  
  async preloadImage(url: string, priority: 'low' | 'normal' | 'high' = 'normal'): Promise<string | null> {
    try {
      
      const cached = await this.getCachedImage(url);
      if (cached) {
        return cached;
      }

      
      if (priority === 'high') {
        this.preloadQueue.unshift(url);
      } else {
        this.preloadQueue.push(url);
      }

      
      if (!this.isProcessing) {
        this.processQueue();
      }

      return null;
    } catch (error) {
      return null;
    }
  }

  
  async preloadImages(urls: string[], priority: 'low' | 'normal' | 'high' = 'normal'): Promise<void> {
    const promises = urls.map(url => this.preloadImage(url, priority));
    await Promise.allSettled(promises);
  }

  
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
      }

      
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  
  private async downloadAndCache(url: string): Promise<void> {
    try {
      
      const response = await fetch(url, { method: 'HEAD' });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      
      await this.cacheImage(url, url, 0);
    } catch (error) {
      throw error;
    }
  }

  
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
    }
  }

  
  private async getCachedImage(url: string): Promise<string | null> {
    try {
      const key = `${CACHE_PREFIX}${url}`;
      const cached = await AsyncStorage.getItem(key);
      
      if (cached) {
        const entry: CacheEntry = JSON.parse(cached);
        const now = Date.now();
        
        
        if (now - entry.timestamp < CACHE_EXPIRY) {
          return entry.uri;
        } else {
          
          await AsyncStorage.removeItem(key);
        }
      }
    } catch (error) {
    }
    
    return null;
  }

  
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
          
          keysToRemove.push(key);
        }
      }
      
      if (keysToRemove.length > 0) {
        await AsyncStorage.multiRemove(keysToRemove);
      }
    } catch (error) {
    }
  }

  
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
        }
      }
      
      return {
        totalEntries: imageKeys.length,
        totalSize
      };
    } catch (error) {
      return { totalEntries: 0, totalSize: 0 };
    }
  }
}

export const imagePreloader = ImagePreloader.getInstance(); 