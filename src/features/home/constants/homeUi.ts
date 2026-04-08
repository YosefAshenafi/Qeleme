import { Dimensions } from 'react-native';

export const SCREEN_WIDTH = Dimensions.get('window').width;

export const HOME_CANVAS = { light: '#F1F2F4', dark: '#101216' } as const;
export const WELCOME_CARD_BG = { light: '#E8F0FE', dark: '#1E2A3D' } as const;

export const HOME_GRID_GAP = 12;
export const BOOK_GRID_CARD_WIDTH = (SCREEN_WIDTH - 40 - HOME_GRID_GAP) / 2;

export const SUBJECT_COVER_INNER_WIDTH = Math.min(120, Math.round(BOOK_GRID_CARD_WIDTH * 0.62));
export const SUBJECT_COVER_INNER_HEIGHT = Math.round(SUBJECT_COVER_INNER_WIDTH * 1.36);
export const SUBJECT_GRID_TOP_BAND_HEIGHT = SUBJECT_COVER_INNER_HEIGHT + 32;
export const HOME_BOOK_CARD_WIDTH = (SCREEN_WIDTH - 60) / 2.2;

export const BRAND_BLUE_RGB = '15,75,215';
