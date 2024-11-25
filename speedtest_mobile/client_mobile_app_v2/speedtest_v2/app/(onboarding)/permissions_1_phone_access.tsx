import {
  StyleSheet,
  Text,
  View,
  Animated,
  PermissionsAndroid,

} from "react-native";
import Title from "@/components/Title";
import TextComponent from "@/components/TextComponent";
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

      // ACCESS_NETWORK_STATE, ACCESS_WIFI_STATE, and INTERNET
      // are automatically granted by including them in AndroidManifest.xml
      // CHANGE_WIFI_STATE might need to be handled differently

      if (phoneGranted === PermissionsAndroid.RESULTS.GRANTED) {
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
    <View style={styles.background}>
      <View style={styles.container}>
        <View style={sharedStyles.progressBarContainer}>
          <View style={styles.progressBarFill} />
        </View>
        <Animated.View style={{ ...styles.content, opacity: slideAnim }}>
          <View style={styles.topContent}>
            <View style={styles.titleContainer}>
              <Title title="Access to cellular and Wi-Fi reception" />
            </View>
            <View style={styles.textContainer}>
              <TextComponent text="Your cellular and Wi-Fi signal is used to identify Wi-Fi hotspots and cell towers and to run speed tests accurately." />
            </View>
          </View>

          <View style={styles.bottomContent}>
            <ButtonContainer>
              <Button title="Enable phone access" onPress={requestPermissions} />
            </ButtonContainer>
          </View>
        </Animated.View>
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
    width: "15%",
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
