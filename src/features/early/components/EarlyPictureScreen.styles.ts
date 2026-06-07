import { StyleSheet } from 'react-native';
import { earlyPictureCoreStyles } from './earlyPictureStyles.core';
import { earlyPictureResultsStyles } from './earlyPictureStyles.results';

// Composed from co-located section modules; consumers keep importing
// `EarlyPictureScreenStyles` and using `styles.<key>` exactly as before.
export const EarlyPictureScreenStyles = StyleSheet.create<any>({
  ...earlyPictureCoreStyles,
  ...earlyPictureResultsStyles,
});
