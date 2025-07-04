// Image optimization utilities for better performance

export interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  crop?: 'center' | 'top' | 'bottom' | 'left' | 'right';
}

// Default optimization options for different use cases
export const IMAGE_OPTIMIZATION_PRESETS = {
  thumbnail: {
    width: 100,
    height: 100,
    quality: 80,
    format: 'webp' as const,
    fit: 'cover' as const,
    crop: 'center' as const,
  },
  category: {
    width: 300,
    height: 200,
    quality: 85,
    format: 'webp' as const,
    fit: 'cover' as const,
    crop: 'center' as const,
  },
  subcategory: {
    width: 250,
    height: 180,
    quality: 85,
    format: 'webp' as const,
    fit: 'cover' as const,
    crop: 'center' as const,
  },
  question: {
    width: 400,
    height: 300,
    quality: 90,
    format: 'webp' as const,
    fit: 'contain' as const,
  },
  profile: {
    width: 150,
    height: 150,
    quality: 90,
    format: 'jpeg' as const,
    fit: 'cover' as const,
    crop: 'center' as const,
  },
};

// Optimize image URL for better performance
export function optimizeImageUrl(
  originalUrl: string, 
  options: ImageOptimizationOptions = {}
): string {
  if (!originalUrl) return originalUrl;

  // If it's already an optimized URL, return as is
  if (originalUrl.includes('w=') || originalUrl.includes('width=')) {
    return originalUrl;
  }

  // For Unsplash URLs, use their optimization parameters
  if (originalUrl.includes('unsplash.com')) {
    const params = new URLSearchParams();
    
    if (options.width) params.append('w', options.width.toString());
    if (options.height) params.append('h', options.height.toString());
    if (options.quality) params.append('q', options.quality.toString());
    if (options.fit) params.append('fit', options.fit);
    if (options.crop) params.append('crop', options.crop);
    if (options.format) params.append('fm', options.format);
    
    const separator = originalUrl.includes('?') ? '&' : '?';
    return `${originalUrl}${separator}${params.toString()}`;
  }

  // For other URLs, try to use a CDN or image optimization service
  // You can integrate with services like Cloudinary, ImageKit, etc.
  if (originalUrl.includes('cloudinary.com')) {
    // Cloudinary optimization
    return optimizeCloudinaryUrl(originalUrl, options);
  }

  // For other URLs, return as is (you can add more optimizations here)
  return originalUrl;
}

// Optimize Cloudinary URLs
function optimizeCloudinaryUrl(url: string, options: ImageOptimizationOptions): string {
  // This is a basic implementation - you can enhance it based on your Cloudinary setup
  const baseUrl = url.split('/upload/')[0] + '/upload/';
  const imagePath = url.split('/upload/')[1];
  
  if (!imagePath) return url;

  const transformations: string[] = [];
  
  if (options.width || options.height) {
    const size = `${options.width || 'auto'},${options.height || 'auto'}`;
    transformations.push(`c_scale,w_${size}`);
  }
  
  if (options.quality) {
    transformations.push(`q_${options.quality}`);
  }
  
  if (options.format) {
    transformations.push(`f_${options.format}`);
  }
  
  if (options.fit === 'cover') {
    transformations.push('c_fill');
  } else if (options.fit === 'contain') {
    transformations.push('c_scale');
  }
  
  if (options.crop) {
    transformations.push(`g_${options.crop}`);
  }

  const transformationString = transformations.join(',');
  return `${baseUrl}${transformationString}/${imagePath}`;
}

// Get optimized URL for different use cases
export function getOptimizedImageUrl(
  originalUrl: string, 
  preset: keyof typeof IMAGE_OPTIMIZATION_PRESETS
): string {
  const options = IMAGE_OPTIMIZATION_PRESETS[preset];
  return optimizeImageUrl(originalUrl, options);
}

// Batch optimize multiple URLs
export function batchOptimizeUrls(
  urls: string[], 
  preset: keyof typeof IMAGE_OPTIMIZATION_PRESETS
): string[] {
  return urls.map(url => getOptimizedImageUrl(url, preset));
}

// Check if image URL is optimized
export function isOptimizedUrl(url: string): boolean {
  return url.includes('w=') || 
         url.includes('width=') || 
         url.includes('q=') || 
         url.includes('quality=') ||
         url.includes('c_scale') ||
         url.includes('f_');
}

// Get image dimensions from URL (if available)
export function getImageDimensionsFromUrl(url: string): { width?: number; height?: number } {
  const urlParams = new URLSearchParams(url.split('?')[1] || '');
  
  const width = urlParams.get('w') || urlParams.get('width');
  const height = urlParams.get('h') || urlParams.get('height');
  
  return {
    width: width ? parseInt(width, 10) : undefined,
    height: height ? parseInt(height, 10) : undefined,
  };
}

// Generate responsive image URLs for different screen densities
export function getResponsiveImageUrls(
  baseUrl: string, 
  sizes: { width: number; height: number }[]
): string[] {
  return sizes.map(size => 
    optimizeImageUrl(baseUrl, {
      width: size.width,
      height: size.height,
      quality: 85,
      format: 'webp',
      fit: 'cover',
      crop: 'center',
    })
  );
}

// Preload optimized images
export async function preloadOptimizedImages(
  urls: string[], 
  preset: keyof typeof IMAGE_OPTIMIZATION_PRESETS
): Promise<void> {
  const optimizedUrls = batchOptimizeUrls(urls, preset);
  
  // In React Native, we'll use fetch to preload images
  const preloadPromises = optimizedUrls.map(async (url) => {
    try {
      const response = await fetch(url, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.warn(`Failed to preload image: ${url}`, error);
    }
  });
  
  await Promise.allSettled(preloadPromises);
} 