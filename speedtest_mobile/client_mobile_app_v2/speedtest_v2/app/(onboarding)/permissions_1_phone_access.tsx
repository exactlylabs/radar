import {
  StyleSheet,
  Text,
  View,
  Animated,
  PermissionsAndroid,
  Alert,
} from "react-native";
import Title from "@/components/Title";
import TextComponent from "@/components/TextComponent";
import Button from "@/components/Button";
import ButtonContainer from "@/components/ButtonContainer";
import { useRouter } from "expo-router";
import { sharedStyles } from "@/styles/shared";
import onboardingStyles from "@/styles/onboarding";
import { useEffect, useRef } from "react";
import AnimatedTransition, { useAnimatedTransition } from "@/components/AnimatedTransition";

export default function Permissions1PhoneAccess() {
  const { slideAnim, animateAndNavigate } = useAnimatedTransition("/permissions_2_location_access");

  const requestPermissions = async () => {
    try {
      const phoneGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
        {
          title: "Phone State Permission",
          message: "This app needs access to your phone state.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      if (phoneGranted === PermissionsAndroid.RESULTS.GRANTED) {
        animateAndNavigate();
      } else {
        Alert.alert(
          "Permission Required",
          "This app requires phone state permissions to function properly.",
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
                <Title title="Access to cellular and Wi-Fi reception" />
              </View>
              <View style={onboardingStyles.textContainer}>
                <TextComponent text="Your cellular and Wi-Fi signal is used to identify Wi-Fi hotspots and cell towers and to run speed tests accurately." />
              </View>
            </View>

            <View style={onboardingStyles.bottomContent}>
              <ButtonContainer>
                <Button title="Enable phone access" onPress={requestPermissions} />
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
    width: "15%",
  }
});
