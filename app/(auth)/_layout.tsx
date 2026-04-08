import { Stack } from 'expo-router';

/**
 * Auth stack — MegaTest student signup only (no parent / multi-child flows).
 * Route file names match `app/(auth)/*.tsx` re-exports.
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="login" />
      <Stack.Screen name="signup" />
      <Stack.Screen name="forgot-password" />
      <Stack.Screen name="reset-password" />
      <Stack.Screen name="otp" />
      <Stack.Screen name="plan-selection" />
      <Stack.Screen name="payment" />
      <Stack.Screen name="payment-success" />
      <Stack.Screen name="onboarding" />
    </Stack>
  );
}
