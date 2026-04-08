import { getColors } from './Colors';

export interface CategoryConfig {
  name_en: string;
  name_am: string;
  emoji: string;
  colors: readonly [string, string];
  defaultImageUrl?: string;
}

// Dynamic color generation based on category name
const generateCategoryColors = (categoryName: string, isDark: boolean): readonly [string, string] => {
  const colors = getColors(isDark);
  
  // Generate colors based on category name hash
  const hash = categoryName.split('').reduce((acc, char) => {
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

// Default emoji mapping - can be extended or made dynamic
const getDefaultEmoji = (categoryName: string): string => {
  const emojiMap: { [key: string]: string } = {
    'Animals': '🐾',
    'Colors': '🎨',
    'Numbers': '🔢',
    'Shapes': '🔳',
    'Fruits': '🍎',
    'Vegetables': '🥦',
    'Family': '👪',
    'Body Parts': '👤',
    'Clothes': '👕',
    'Weather': '☀️',
    'Transport': '🚗',
    'Food': '🍴',
    'School': '🏫',
    'Toys': '🎁',
    'Maths': '🧮',
    'Domestic Animals': '🐕',
    'Wild Animals': '🦁',
    'Household Items': '🏠',
    'Fruits and Vegetables': '🥕',
    'School Compound': '🏫',
    'Different Activities': '🎯',
    'Foods': '🍽️'
  };
  
  return emojiMap[categoryName] || '🌟';
};

// Default image URL for categories without images
export const DEFAULT_CATEGORY_IMAGE_URL = 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=400&fit=crop&crop=center';

// Animation configuration
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

// Style configuration
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

// Get category configuration dynamically
export const getCategoryConfig = (categoryName: string, isDark: boolean = false): CategoryConfig => {
  return {
    name_en: categoryName,
    name_am: categoryName, // This should come from API or translation
    emoji: getDefaultEmoji(categoryName),
    colors: generateCategoryColors(categoryName, isDark),
    defaultImageUrl: DEFAULT_CATEGORY_IMAGE_URL
  };
};

// Get category image source
export const getCategoryImageSource = (imageUrl?: string | null, defaultUrl?: string) => {
  return imageUrl ? { uri: imageUrl } : { uri: defaultUrl || DEFAULT_CATEGORY_IMAGE_URL };
};

// Get category name based on language
export const getCategoryNameByLanguage = (category: { name_en: string; name_am: string }, language: string): string => {
  return language === 'am' ? category.name_am : category.name_en;
}; 