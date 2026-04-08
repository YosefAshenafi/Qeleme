

export interface BookCoverData {
  coverColor: string;
  coverGradient: readonly [string, string, ...string[]];
  icon: string;
}

const SUBJECT_COLORS: Record<string, BookCoverData> = {
  'mathematics': {
    coverColor: '#4A90E2',
    coverGradient: ['#4A90E2', '#357ABD'] as const,
    icon: 'questionmark.circle.fill',
  },
  'math': {
    coverColor: '#4A90E2',
    coverGradient: ['#4A90E2', '#357ABD'] as const,
    icon: 'questionmark.circle.fill',
  },
  'physics': {
    coverColor: '#9C27B0',
    coverGradient: ['#9C27B0', '#7B1FA2'] as const,
    icon: 'chart.bar.fill',
  },
  'chemistry': {
    coverColor: '#FF9800',
    coverGradient: ['#FF9800', '#F57C00'] as const,
    icon: 'chart.bar.fill',
  },
  'biology': {
    coverColor: '#4CAF50',
    coverGradient: ['#4CAF50', '#388E3C'] as const,
    icon: 'chart.bar.fill',
  },
  'english': {
    coverColor: '#E91E63',
    coverGradient: ['#E91E63', '#C2185B'] as const,
    icon: 'doc.text.fill',
  },
  'amharic': {
    coverColor: '#FF5722',
    coverGradient: ['#FF5722', '#D84315'] as const,
    icon: 'doc.text.fill',
  },
  'history': {
    coverColor: '#795548',
    coverGradient: ['#795548', '#5D4037'] as const,
    icon: 'doc.text.fill',
  },
  'geography': {
    coverColor: '#607D8B',
    coverGradient: ['#607D8B', '#455A64'] as const,
    icon: 'globe',
  },
  'civics': {
    coverColor: '#3F51B5',
    coverGradient: ['#3F51B5', '#303F9F'] as const,
    icon: 'person.fill',
  },
  'economics': {
    coverColor: '#009688',
    coverGradient: ['#009688', '#00796B'] as const,
    icon: 'chart.bar.fill',
  },
  'general': {
    coverColor: '#9E9E9E',
    coverGradient: ['#9E9E9E', '#757575'] as const,
    icon: 'doc.text.fill',
  },
};

const DEFAULT_COLORS: BookCoverData[] = [
  {
    coverColor: '#4A90E2',
    coverGradient: ['#4A90E2', '#357ABD'] as const,
    icon: 'doc.text.fill',
  },
  {
    coverColor: '#9C27B0',
    coverGradient: ['#9C27B0', '#7B1FA2'] as const,
    icon: 'questionmark.circle.fill',
  },
  {
    coverColor: '#FF9800',
    coverGradient: ['#FF9800', '#F57C00'] as const,
    icon: 'chart.bar.fill',
  },
  {
    coverColor: '#4CAF50',
    coverGradient: ['#4CAF50', '#388E3C'] as const,
    icon: 'rectangle.stack.fill',
  },
  {
    coverColor: '#E91E63',
    coverGradient: ['#E91E63', '#C2185B'] as const,
    icon: 'doc.text.fill',
  },
  {
    coverColor: '#607D8B',
    coverGradient: ['#607D8B', '#455A64'] as const,
    icon: 'globe',
  },
];

export const getBookCover = (subjectName: string): BookCoverData => {
  const normalizedName = subjectName.toLowerCase().trim();
  
  
  for (const [key, value] of Object.entries(SUBJECT_COLORS)) {
    if (normalizedName.includes(key)) {
      return value;
    }
  }
  
  
  const hash = normalizedName.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  const index = Math.abs(hash) % DEFAULT_COLORS.length;
  return DEFAULT_COLORS[index];
};

export const getChapterCover = (chapterName: string, subjectName: string): BookCoverData => {
  const subjectCover = getBookCover(subjectName);
  
  
  const chapterNameHash = chapterName.toLowerCase().split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);
  
  
  const variation = Math.abs(chapterNameHash) % 3;
  
  switch (variation) {
    case 0:
      return {
        ...subjectCover,
        coverColor: subjectCover.coverColor,
        coverGradient: subjectCover.coverGradient,
      };
    case 1:
      
      return {
        ...subjectCover,
        coverColor: adjustColorBrightness(subjectCover.coverColor, -20),
        coverGradient: [
          adjustColorBrightness(subjectCover.coverGradient[0], -20),
          adjustColorBrightness(subjectCover.coverGradient[1], -20),
        ] as const,
      };
    case 2:
      
      return {
        ...subjectCover,
        coverColor: adjustColorBrightness(subjectCover.coverColor, 20),
        coverGradient: [
          adjustColorBrightness(subjectCover.coverGradient[0], 20),
          adjustColorBrightness(subjectCover.coverGradient[1], 20),
        ] as const,
      };
    default:
      return subjectCover;
  }
};

function adjustColorBrightness(hex: string, percent: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  return '#' + (
    0x1000000 +
    (R < 255 ? (R < 1 ? 0 : R) : 255) * 0x10000 +
    (G < 255 ? (G < 1 ? 0 : G) : 255) * 0x100 +
    (B < 255 ? (B < 1 ? 0 : B) : 255)
  ).toString(16).slice(1);
}

export const getRandomBookCover = (): BookCoverData => {
  const index = Math.floor(Math.random() * DEFAULT_COLORS.length);
  return DEFAULT_COLORS[index];
}; 