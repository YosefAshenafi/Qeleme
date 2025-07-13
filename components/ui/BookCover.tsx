import React from 'react';
import { StyleSheet, TouchableOpacity, View, Dimensions, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ThemedText } from '../ThemedText';
import { ThemedView } from '../ThemedView';
import { IconSymbol, IconSymbolName } from './IconSymbol';

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
}) => {
  const [imageError, setImageError] = React.useState(false);
  
  // Reset image error when imageUrl changes
  React.useEffect(() => {
    setImageError(false);
  }, [imageUrl]);
  return (
    <TouchableOpacity
      style={[
        styles.bookContainer,
        isSelected && styles.selectedBook,
        disabled && styles.disabledBook,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
    >
      <ThemedView style={[styles.bookCover, { backgroundColor: coverColor }]}>
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
            <ThemedText style={styles.bookTitle} numberOfLines={2}>
              {title}
            </ThemedText>
            {subtitle && (
              <ThemedText style={styles.bookSubtitle} numberOfLines={1}>
                {subtitle}
              </ThemedText>
            )}
            
            {/* Content count badge */}
            {(flashcardCount !== undefined || questionCount !== undefined) && (
              <View style={styles.countBadge}>
                <ThemedText style={styles.countText}>
                  {flashcardCount !== undefined ? `${flashcardCount} cards` : `${questionCount} questions`}
                </ThemedText>
              </View>
            )}
          </View>
        )}
        
        {/* Book pages effect */}
        <View style={styles.bookPages} />
      </ThemedView>
      
      {/* Book shadow */}
      <View style={styles.bookShadow} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  bookContainer: {
    width: BOOK_WIDTH,
    height: BOOK_HEIGHT,
    marginBottom: 20,
    alignItems: 'center',
  },
  selectedBook: {
    transform: [{ scale: 1.05 }],
  },
  disabledBook: {
    opacity: 0.5,
  },
  bookCover: {
    width: BOOK_WIDTH - 10,
    height: BOOK_HEIGHT - 10,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  bookSpine: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  bookContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookIcon: {
    marginBottom: 12,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
    lineHeight: 18,
  },
  bookSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 8,
  },
  countBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  countText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  bookPages: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  bookShadow: {
    position: 'absolute',
    bottom: -5,
    left: 5,
    right: 5,
    height: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    zIndex: -1,
  },
}); 