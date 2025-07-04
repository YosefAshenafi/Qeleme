import { getColors } from './Colors';

export interface SubcategoryConfig {
  name_en: string;
  name_am: string;
  emoji: string;
  colors: readonly [string, string];
  defaultImageUrl?: string;
}

// Dynamic color generation based on subcategory name
const generateSubcategoryColors = (subcategoryName: string, isDark: boolean): readonly [string, string] => {
  const colors = getColors(isDark);
  
  // Generate colors based on subcategory name hash
  const hash = subcategoryName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const hue1 = Math.abs(hash) % 360;
  const hue2 = (hue1 + 60) % 360;
  
  const saturation = isDark ? 70 : 80;
  const lightness1 = isDark ? 60 : 70;
  const lightness2 = isDark ? 50 : 60;
  
  const color1 = `hsl(${hue1}, ${saturation}%, ${lightness1}%)`;
  const color2 = `hsl(${hue2}, ${saturation}%, ${lightness2}%)`;
  
  return [color1, color2] as const;
};

// Default emoji mapping for subcategories
const getDefaultSubcategoryEmoji = (subcategoryName: string): string => {
  const emojiMap: { [key: string]: string } = {
    'Numbers 1-10': '1️⃣',
    'Numbers 11-20': '🔟',
    '1-10 Counting': '👆',
    '11-20 Counting': '✌️',
    'Fill in the Blanks': '📝',
    'Middle Number 1-10': '5️⃣',
    'Middle Number 11-20': '1️⃣5️⃣',
    'Addition': '➕',
    'Subtraction': '➖',
    'Multiplication': '✖️',
    'Division': '➗',
  };
  
  return emojiMap[subcategoryName] || '📚';
};

// Default image URL for subcategories without images
export const DEFAULT_SUBCATEGORY_IMAGE_URL = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop&crop=center';

// Animation configuration (same as categories for consistency)
export const ANIMATION_CONFIG = {
  header: {
    damping: 15,
    stiffness: 100
  },
  cards: {
    spring: {
      damping: 15,
      stiffness: 100
    },
    timing: {
      duration: 800
    }
  },
  floating: {
    duration: 2000
  }
};

// Style configuration (same as categories for consistency)
export const STYLE_CONFIG = {
  card: {
    aspectRatio: 1,
    borderRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8
  },
  welcome: {
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8
  }
};

// Get subcategory configuration dynamically
export const getSubcategoryConfig = (subcategoryName: string, isDark: boolean = false): SubcategoryConfig => {
  return {
    name_en: subcategoryName,
    name_am: subcategoryName, // This should come from API or translation
    emoji: getDefaultSubcategoryEmoji(subcategoryName),
    colors: generateSubcategoryColors(subcategoryName, isDark),
    defaultImageUrl: DEFAULT_SUBCATEGORY_IMAGE_URL
  };
};

// Get subcategory image source
export const getSubcategoryImageSource = (imageUrl?: string | null, defaultUrl?: string) => {
  return imageUrl ? { uri: imageUrl } : { uri: defaultUrl || DEFAULT_SUBCATEGORY_IMAGE_URL };
};

// Get subcategory name based on language
export const getSubcategoryNameByLanguage = (subcategory: { name_en: string; name_am: string }, language: string): string => {
  return language === 'am' ? subcategory.name_am : subcategory.name_en;
}; 