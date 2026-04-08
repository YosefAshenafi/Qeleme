import { Dimensions } from 'react-native';

export const BRAND_BLUE = '#0F4BD7';
export const BOOK_CTA_ON = '#FFFFFF';
export const BOOKS_CANVAS = { light: '#F1F2F4', dark: '#101216' } as const;

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const BOOK_CARD_IMAGE_HEIGHT = Math.min(
  Math.round(SCREEN_HEIGHT * 0.58),
  Math.round(SCREEN_WIDTH * 1.72)
);

export const SESSION_RESULT_RING_SIZE = 220;
export const SESSION_RESULT_RING_STROKE = 14;

export const MODAL_OVERLAY = 'rgba(0, 0, 0, 0.5)';
