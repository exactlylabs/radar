import { Stack } from 'expo-router';

export default function OnboardingLayout() {

  return (
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="step2" options={{ headerShown: false }} />
        <Stack.Screen name="account-email" options={{ headerShown: false }} />
      </Stack>
  );
}
