import {
  StyleSheet,
  View,
  Alert,
  Linking,
  Platform,
} from "react-native";

import * as Battery from "expo-battery";
import Title from "@/components/Title";
import TextComponent from "@/components/TextComponent";
import Button from "@/components/Button";
import ButtonContainer from "@/components/ButtonContainer";
import { sharedStyles } from "@/styles/shared";
import onboardingStyles from "@/styles/onboarding";
import AnimatedTransition, { useAnimatedTransition } from "@/components/AnimatedTransition";

export default function Permissions4BatterySavings() {
  const { slideAnim, animateAndNavigate } = useAnimatedTransition("/next_screen_path");

  const handleUpdateSettings = async () => {
    const isBatterySavingEnabled = await Battery.isLowPowerModeEnabledAsync();
    if (true ||isBatterySavingEnabled) {
      Alert.alert(
        "Update Settings",
        "Please disable your battery saving settings on your device.",
        [
          {
            text: "OK",
            onPress: () =>
              Linking.openSettings(),
          },
        ]
      );
    }
  };

  return (
    <View style={onboardingStyles.background}>
      <View style={onboardingStyles.container}>
        <View style={sharedStyles.progressBarContainer}>
          <View style={styles.progressBarFill} />
        </View>
        <AnimatedTransition slideAnim={slideAnim}>
          <View style={onboardingStyles.content}>
            <View style={onboardingStyles.topContent}>
              <View style={onboardingStyles.titleContainer}>
                <Title title="Disable your battery saving settings" />
              </View>
              <View style={onboardingStyles.textContainer}>
                <TextComponent text="Your current battery settings might impact your results. Make sure to disable your battery saving settings on your device." />
              </View>
            </View>

            <View style={onboardingStyles.bottomContent}>
              <ButtonContainer>
                <Button title="Update settings" onPress={handleUpdateSettings} />
              </ButtonContainer>
            </View>
          </View>
        </AnimatedTransition>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  progressBarFill: {
    ...sharedStyles.progressBarFill,
    width: "66%",
  },
});
