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
import * as Permissions from "expo-permissions"; // Added Permissions import

export default function Permissions1PhoneAccess() {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(1)).current;

  const requestPermissions = async () => {
    const { status: phoneStatus } = await Permissions.askAsync(
      Permissions.READ_PHONE_STATE
    ); // Request phone state permissions
    const { status: networkStatus } = await Permissions.askAsync(
      Permissions.ACCESS_NETWORK_STATE
    ); // Request network state permissions
    const { status: wifiStateStatus } = await Permissions.askAsync(
      Permissions.ACCESS_WIFI_STATE
    ); // Request Wi-Fi state permissions
    const { status: changeWifiStateStatus } = await Permissions.askAsync(
      Permissions.CHANGE_WIFI_STATE
    ); // Request change Wi-Fi state permissions
    const { status: internetStatus } = await Permissions.askAsync(
      Permissions.INTERNET
    ); // Request internet permissions

    if (phoneStatus === "granted" && networkStatus === "granted" && wifiStateStatus === "granted" && changeWifiStateStatus === "granted" && internetStatus === "granted") {
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
    } else {
      // Handle permission denial
      console.log("Permissions not granted");
    }
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
            <Button title="Enable phone access" onPress={requestPermissions} />{" "}
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
