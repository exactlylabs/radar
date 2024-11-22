import { DefaultTheme } from '@react-navigation/native';
import { DarkTheme } from '@react-navigation/native';
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'react-native';

export default function OnboardingAccountLayout() {

  return (
    <ThemeProvider value={DefaultTheme}> 
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
      </Stack>
    </ThemeProvider>
  );
}
