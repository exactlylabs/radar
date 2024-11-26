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
      <Stack.Screen
        name="permissions_1_phone_access"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="permissions_2_location_access"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="permissions_3_full_location"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="permissions_4_battery_savings"
        options={{ headerShown: false }}
      />
      {/*
        Onboarding - Permissions - 5
      */}
    </Stack>
  );
}
