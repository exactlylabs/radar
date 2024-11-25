import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function OnboardingLayout() {

  return (
    <>
      <StatusBar barStyle='light-content' backgroundColor="transparent" />
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="step2" options={{ headerShown: false }} />
        <Stack.Screen name="account-email" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
