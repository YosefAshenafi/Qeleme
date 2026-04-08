import React from 'react';
import { TouchableOpacity, View, Dimensions, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol, IconSymbolName } from './IconSymbol';
import { BookCoverStyles as styles } from './BookCover.styles';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const BOOK_WIDTH = (SCREEN_WIDTH - 60) / 2; // 2 columns with padding
const BOOK_HEIGHT = BOOK_WIDTH * 1.4; // Aspect ratio for books

interface BookCoverProps {
  title: string;
  subtitle?: string;
  coverColor?: string;
  coverGradient?: readonly [string, string, ...string[]];
  icon?: IconSymbolName;
  imageUrl?: string;
  onPress: () => void;
  isSelected?: boolean;
  disabled?: boolean;
  flashcardCount?: number;
  questionCount?: number;
  /** Override default cover size (e.g. home grid tiles). */
  coverWidth?: number;
  coverHeight?: number;
  /** When true, no title/subtitle on the cover — only image or gradient + icon (meta lives outside). */
  suppressCoverText?: boolean;
  /** Remove default bottom margin (e.g. grid layout). */
  compact?: boolean;
}

export const BookCover: React.FC<BookCoverProps> = ({
  title,
  subtitle,
  coverColor = '#4A90E2',
  coverGradient = ['#4A90E2', '#357ABD'] as const,
  icon = 'doc.text.fill',
  imageUrl,
  onPress,
  isSelected = false,
  disabled = false,
  flashcardCount,
  questionCount,
  coverWidth,
  coverHeight,
  suppressCoverText = false,
  compact = false,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const outerW = coverWidth ?? BOOK_WIDTH;
  const outerH = coverHeight ?? BOOK_HEIGHT;
  const inset = compact ? 0 : 10;
  const innerW = Math.max(outerW - inset, 1);
  const innerH = Math.max(outerH - inset, 1);

  // Reset image error when imageUrl changes
  React.useEffect(() => {
    setImageError(false);
  }, [imageUrl]);
  return (
    <TouchableOpacity
      style={[
        styles.bookContainer,
        compact && styles.bookContainerCompact,
        { width: outerW, height: outerH },
        isSelected && styles.selectedBook,
        disabled && styles.disabledBook,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <ThemedView
        style={[
          styles.bookCover,
          compact && styles.bookCoverCompact,
          { backgroundColor: coverColor, width: innerW, height: innerH },
        ]}
      >
        {imageUrl && !imageError ? (
          <Image 
            source={{ uri: imageUrl }} 
            style={StyleSheet.absoluteFill}
            resizeMode="cover"
            onError={() => {
              console.log('Failed to load image:', imageUrl);
              setImageError(true);
            }}
          />
        ) : (
          <LinearGradient
            colors={coverGradient}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
        )}
        
        {/* Semi-transparent overlay for better text readability when image is present */}
        {imageUrl && !imageError && (
          <View style={styles.imageOverlay} />
        )}
        
        {/* Book spine effect */}
        <View style={styles.bookSpine} />
        
        {/* Book content - only show when no image or image failed to load */}
        {(!imageUrl || imageError) && (
          <View style={styles.bookContent}>
            <IconSymbol name={icon} size={32} color="#FFFFFF" style={styles.bookIcon} />
            {!suppressCoverText && (
              <>
                <ThemedText style={styles.bookTitle} numberOfLines={2}>
                  {title}
                </ThemedText>
                {subtitle && (
                  <ThemedText style={styles.bookSubtitle} numberOfLines={1}>
                    {subtitle}
                  </ThemedText>
                )}
              </>
            )}
          </View>
        )}
        
        
        {/* Book pages effect */}
        <View style={styles.bookPages} />
      </ThemedView>
      
      {!compact && <View style={styles.bookShadow} />}
    </TouchableOpacity>
  );
}; 