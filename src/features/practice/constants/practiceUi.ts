import { Dimensions } from 'react-native';

export const BRAND_BLUE = '#0F4BD7';
export const BOOK_CTA_ON = '#FFFFFF';
export const BOOKS_CANVAS = { light: '#F1F2F4', dark: '#101216' } as const;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const BOOK_CARD_IMAGE_HEIGHT = Math.min(
  Math.round(SCREEN_HEIGHT * 0.58),
  Math.round(SCREEN_WIDTH * 1.72)
);

// Portrait book cover shown on the left of each horizontal subject row card —
// same proportions as the home page subject tiles (height = width * 1.36).
export const SUBJECT_ROW_COVER_WIDTH = Math.min(100, Math.round(SCREEN_WIDTH * 0.26));
export const SUBJECT_ROW_COVER_HEIGHT = Math.round(SUBJECT_ROW_COVER_WIDTH * 1.36);

export const SESSION_RESULT_RING_SIZE = 156;
export const SESSION_RESULT_RING_STROKE = 12;

export const MODAL_OVERLAY = 'rgba(0, 0, 0, 0.5)';
