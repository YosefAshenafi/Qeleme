/**
 * Styles for `app/+not-found.tsx`.
 *
 * Kept under `src/appStyles/` instead of beside the screen because files under `app/`
 * that are not real routes (e.g. `+not-found.styles.ts`) can still be picked up by
 * Expo Router and break typed `Href` paths. Shared non-route modules live in `src/`.
 */
import { StyleSheet } from 'react-native';

export const notFoundStyles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
