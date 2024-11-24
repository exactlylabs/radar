import {
  Image,
  StyleSheet,
  Text,
  View,
  Animated,
  PermissionsAndroid,
} from "react-native";
import Title from "@/components/Title";
import gridImage from "@/assets/images/step1grid-onboarding.png";
import TextComponent from "@/components/TextComponent";
import BgGradient from "@/components/BgGratient";
import Button from "@/components/Button";
import ButtonContainer from "@/components/ButtonContainer";
import { useRouter } from "expo-router";
import { sharedStyles } from "@/styles/shared";
import { useEffect, useRef } from "react";

export default function Permissions1PhoneAccess() {
  const router = useRouter();
  const slideAnim = useRef(new Animated.Value(1)).current;

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

      const networkGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_NETWORK_STATE,
        {
          title: "Network State Permission",
          message: "This app needs access to your network state.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      const wifiStateGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_WIFI_STATE,
        {
          title: "Wi-Fi State Permission",
          message: "This app needs access to your Wi-Fi state.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      const changeWifiStateGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.CHANGE_WIFI_STATE,
        {
          title: "Change Wi-Fi State Permission",
          message: "This app needs permission to change Wi-Fi state.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      const internetGranted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.INTERNET,
        {
          title: "Internet Permission",
          message: "This app needs access to the internet.",
          buttonNeutral: "Ask Me Later",
          buttonNegative: "Cancel",
          buttonPositive: "OK",
        }
      );

      if (
        phoneGranted === PermissionsAndroid.RESULTS.GRANTED &&
        networkGranted === PermissionsAndroid.RESULTS.GRANTED &&
        wifiStateGranted === PermissionsAndroid.RESULTS.GRANTED &&
        changeWifiStateGranted === PermissionsAndroid.RESULTS.GRANTED &&
        internetGranted === PermissionsAndroid.RESULTS.GRANTED
      ) {
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
        console.log("Permissions not granted");
      }
    } catch (err) {
      console.warn(err);
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
