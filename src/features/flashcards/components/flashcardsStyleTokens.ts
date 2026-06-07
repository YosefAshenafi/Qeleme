import { Dimensions } from 'react-native';
import { SESSION_RESULTS_RING_SIZE } from '@/features/flashcards/constants/flashcardsUi';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export const CARD_WIDTH = SCREEN_WIDTH - 40;
export const CARD_HEIGHT = Math.min(Math.round(SCREEN_HEIGHT * 0.56), Math.round(CARD_WIDTH * 1.12));

export { SESSION_RESULTS_RING_SIZE };
