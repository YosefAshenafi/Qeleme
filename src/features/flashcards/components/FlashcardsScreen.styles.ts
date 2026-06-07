import { StyleSheet } from 'react-native';
import { flashcardsCoreStyles } from './flashcardsStyles.core';
import { flashcardsSessionStyles } from './flashcardsStyles.session';

// Composed from co-located section modules; consumers keep importing
// `FlashcardsScreenStyles` and using `styles.<key>` exactly as before.
export const FlashcardsScreenStyles = StyleSheet.create<any>({
  ...flashcardsCoreStyles,
  ...flashcardsSessionStyles,
});
