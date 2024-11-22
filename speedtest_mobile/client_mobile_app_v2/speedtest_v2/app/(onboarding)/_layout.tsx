import { Stack } from 'expo-router';

export default function OnboardingLayout() {

  return (
      <Stack>
        <Stack.Screen name="step1" options={{ headerShown: false }} />
        <Stack.Screen name="step2" options={{ headerShown: false }} />
        {/* Onboarding - Account
        Onboarding - Account (Invalid email)
        Onboarding - Account (Entering email)
        Onboarding - Account (Verify email - resend code)
        Onboarding - Account (Verify email - code resent)
        Onboarding - Account (Verify email - entering code)
        Onboarding - Account (Verify email - invalid code) */}
        <Stack.Screen name="permissions_1_phone_access" options={{ headerShown: false }} />
        {/* Onboarding - Permissions - 2
        Onboarding - Permissions - 3
        Onboarding - Permissions - 4
        Onboarding - Permissions - 5 */}
      </Stack>
  );
}
