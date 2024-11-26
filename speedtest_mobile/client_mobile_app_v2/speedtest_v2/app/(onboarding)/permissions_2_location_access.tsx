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
  const { slideAnim, animateAndNavigate } = useAnimatedTransition("/permissions_3_full_location");

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status === 'granted') {
        animateAndNavigate();
      } else {
        Alert.alert(
          "Permission Required",
          "This app requires location permissions to function properly.",
          [{ text: "OK" }]
        );
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
                <Title title="Access to your location" />
              </View>
              <View style={onboardingStyles.textContainer}>
                <TextComponent text="Your location is used to map Wi-Fi hotspots and cell towers, and to provide you with the locations where wireless quality is being measured." />
              </View>
            </View>

            <View style={onboardingStyles.bottomContent}>
              <ButtonContainer>
                <Button title="Enable location access" onPress={requestPermissions} />
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
    width: "32%",
  },
});
