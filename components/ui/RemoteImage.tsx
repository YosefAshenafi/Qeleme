import React, { useState } from 'react';
import { Image, ImageProps, ImageSourcePropType } from 'react-native';

interface RemoteImageProps extends Omit<ImageProps, 'source'> {
  remoteUrl?: string | null;
  fallbackSource: ImageSourcePropType;
  onError?: () => void;
}

export function RemoteImage({ 
  remoteUrl, 
  fallbackSource, 
  onError, 
  ...props 
}: RemoteImageProps) {
  const [imageError, setImageError] = useState(false);

  const handleError = () => {
    setImageError(true);
    onError?.();
  };

  const source = remoteUrl && !imageError 
    ? { uri: remoteUrl } 
    : fallbackSource;

  return (
    <Image
      {...props}
      source={source}
      onError={handleError}
    />
  );
} 