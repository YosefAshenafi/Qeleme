import { StyleSheet } from 'react-native';
import { practiceResultsStyles } from './practiceResults.styles';
import { practiceQuestionStyles } from './practiceQuestion.styles';
import { practiceBooksStyles } from './practiceBooks.styles';
import { practiceBookCardsStyles } from './practiceBookCards.styles';

// Composed from co-located section modules; consumers keep importing
// `PracticeScreenStyles` and using `styles.<key>` exactly as before.
export const PracticeScreenStyles = StyleSheet.create<any>({
  ...practiceResultsStyles,
  ...practiceQuestionStyles,
  ...practiceBooksStyles,
  ...practiceBookCardsStyles,
});
