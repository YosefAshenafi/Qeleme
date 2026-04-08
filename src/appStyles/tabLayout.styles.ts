/**
 * Tab bar / header styles for `app/(tabs)/_layout.tsx`.
 *
 * Kept under `src/appStyles/` instead of beside the layout file because Expo Router
 * treats every file under `app/` as part of the route tree; a co-located `*.styles.ts`
 * next to `_layout.tsx` was incorrectly registered as a route. Non-route code belongs
 * outside `app/` so routes and typings stay accurate.
 */
import { StyleSheet } from 'react-native';

export const tabLayoutStyles = StyleSheet.create({
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandMark: {
    width: 50,
    height: 44,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
