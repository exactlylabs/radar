// app/(onboarding)/permissions_1_phone_access.tsx
import { Image, StyleSheet, Text, View, Animated } from "react-native"; // Added Animated
import Title from "@/components/Title";
import gridImage from "@/assets/images/step1grid-onboarding.png";
import TextComponent from "@/components/TextComponent";
import BgGradient from "@/components/BgGratient";
import Button from "@/components/Button";
import ButtonContainer from "@/components/ButtonContainer";
import { useRouter } from "expo-router";
import { sharedStyles } from "@/styles/shared";
import { useEffect, useRef } from "react"; // Added useEffect and useRef

// Change the component name here
export default function Permissions1PhoneAccess() {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(1)).current; // Animation value

  const handleNavigation = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      router.push("/permissions_2_location_access");
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  return (
    <BgGradient>
      <View style={styles.container}>
        <View style={styles.progressBar} />
        <Animated.View style={{ ...styles.content, opacity: slideAnim }}>
          <View style={styles.imageContainer}>
            <Image source={gridImage} />
          </View>
          <View style={styles.titleContainer}>
            <Title title="Access to cellular and Wi-Fi reception" />
          </View>
          <View style={styles.textContainer}>
            <TextComponent text="Your cellular and Wi-Fi signal is used to identify Wi-Fi hotspots and cell towers and to run speed tests accurately." />
          </View>

          <ButtonContainer>
            <Button title="Enable phone access" onPress={handleNavigation} />
          </ButtonContainer>
        </Animated.View>
      </View>
    </BgGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: sharedStyles.colors.blue200,
    marginBottom: 20,
  },
  content: {
    flex: 1,
  },
  imageContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    paddingHorizontal: 20,
    marginTop: 10,
  },
  textContainer: {
    paddingHorizontal: 20,
    paddingRight: 50,
    marginTop: 20,
  },
});
