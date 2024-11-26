import { StyleSheet, View } from "react-native";
import Title from "@/components/Title";
import TextComponent from "@/components/TextComponent";
import Button from "@/components/Button";
import ButtonContainer from "@/components/ButtonContainer";
import { sharedStyles } from "@/styles/shared";
import onboardingStyles from "@/styles/onboarding";
import AnimatedTransition, { useAnimatedTransition } from "@/components/AnimatedTransition";
import * as Location from 'expo-location';

export default function Permissions2LocationAccess() {
  const { slideAnim, animateAndNavigate } = useAnimatedTransition("/permissions_3_location_all_time");

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestBackgroundPermissionsAsync();

      if (status === 'granted') {
        animateAndNavigate();
      } else {
        // TODO: Show error message ?
        console.log("Location permission denied");
      }
    } catch (err) {
      console.warn(err);
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
                <Title title="Allow access to your location all the time" />
              </View>
              <View style={onboardingStyles.textContainer}>
                <TextComponent text="Your location is needed even when the app is closed so that Radar works in the background." />
              </View>
            </View>

            <View style={onboardingStyles.bottomContent}>
              <ButtonContainer>
                <Button title="Update location settings" onPress={requestPermissions} />
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
    width: "50%",
  },
});
