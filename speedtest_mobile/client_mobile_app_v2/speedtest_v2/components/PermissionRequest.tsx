import { View } from "react-native";
import Title from "@/components/Title";
import TextComponent from "@/components/TextComponent";
import Button from "@/components/Button";
import ButtonContainer from "@/components/ButtonContainer";
import { sharedStyles } from "@/styles/shared";
import onboardingStyles from "@/styles/onboarding";
import AnimatedTransition from "@/components/AnimatedTransition";
import { Alert } from "react-native";
import { PermissionsAndroid } from "react-native";
import { useAnimatedTransition } from "@/hooks/useAnimatedTransition";

type PermissionRequestProps = {
  title: string;
  description: string;
  buttonTitle: string;
  progressBarWidth: string;
  nextPath: string;
  requestPermission: () => Promise<string>;
  errorMessage: string;
};

export default function PermissionRequest({
  title,
  description,
  buttonTitle,
  progressBarWidth,
  nextPath,
  requestPermission,
  errorMessage,
}: PermissionRequestProps) {
  const { slideAnim, animateAndNavigate } = useAnimatedTransition(nextPath);

  const handlePermissionRequest = async () => {
    try {
      const status = await requestPermission();
      
      if (status === PermissionsAndroid.RESULTS.GRANTED) {
        animateAndNavigate();
      } else {
        Alert.alert("Permission Required", errorMessage, [{ text: "OK" }]);
      }
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <View style={onboardingStyles.background}>
      <View style={onboardingStyles.container}>
        <View style={sharedStyles.progressBarContainer}>
          <View style={{ ...sharedStyles.progressBarFill, width: progressBarWidth }} />
        </View>
        <AnimatedTransition slideAnim={slideAnim}>
          <View style={onboardingStyles.content}>
            <View style={onboardingStyles.topContent}>
              <View style={onboardingStyles.titleContainer}>
                <Title title={title} />
              </View>
              <View style={onboardingStyles.textContainer}>
                <TextComponent text={description} />
              </View>
            </View>

            <View style={onboardingStyles.bottomContent}>
              <ButtonContainer>
                <Button title={buttonTitle} onPress={handlePermissionRequest} />
              </ButtonContainer>
            </View>
          </View>
        </AnimatedTransition>
      </View>
    </View>
  );
} 