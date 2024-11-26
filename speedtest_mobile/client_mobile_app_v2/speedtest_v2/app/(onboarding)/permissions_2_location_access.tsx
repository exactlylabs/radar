import { StyleSheet, View } from "react-native";
import Title from "@/components/Title";
import TextComponent from "@/components/TextComponent";
import Button from "@/components/Button";
import ButtonContainer from "@/components/ButtonContainer";
import { sharedStyles } from "@/styles/shared";
import AnimatedTransition, { useAnimatedTransition } from "@/components/AnimatedTransition";
import * as Location from 'expo-location';

export default function Permissions2LocationAccess() {
  const { slideAnim, animateAndNavigate } = useAnimatedTransition("/permissions_3_location_all_time");

  const requestPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

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
    <View style={styles.background}>
      <View style={styles.container}>
        <View style={sharedStyles.progressBarContainer}>
          <View style={styles.progressBarFill} />
        </View>
        <AnimatedTransition slideAnim={slideAnim}>
          <View style={styles.content}>
            <View style={styles.topContent}>
              <View style={styles.titleContainer}>
                <Title title="Access to your location" />
              </View>
              <View style={styles.textContainer}>
                <TextComponent text="Your location is used to map Wi-Fi hotspots and cell towers, and to provide you with the locations where wireless quality is being measured." />
              </View>
            </View>

            <View style={styles.bottomContent}>
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
  background: {
    flex: 1,
    backgroundColor: sharedStyles.colors.blueBackground,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  progressBarFill: {
    ...sharedStyles.progressBarFill,
    width: "30%",
  },
  content: {
    flex: 1,
  },
  topContent: {
    flex: 1,
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  textContainer: {
    paddingHorizontal: 20,
    paddingRight: 50,
    marginTop: 16,
  },
  bottomContent: {
    marginBottom: 20,
  },
});
