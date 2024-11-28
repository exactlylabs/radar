import * as Notifications from 'expo-notifications';
import PermissionRequest from "@/components/PermissionRequest";
import { PermissionsAndroid } from "react-native";
import { Alert } from "react-native";

// Set up notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export default function Permissions5Notifications() {
  const requestPermission = async () => {
    await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
    });

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== PermissionsAndroid.RESULTS.GRANTED) {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== PermissionsAndroid.RESULTS.GRANTED) {
      Alert.alert(
        "Permission Required",
        "Push notifications are required to keep you informed about Radar's status.",
        [{ text: "OK" }]
      );
      return PermissionsAndroid.RESULTS.DENIED;
    }

    return finalStatus;
  };

  return (
    <PermissionRequest
      title="Enable notifications"
      description="Notifications will let you know when Radar is running and when it stops."
      buttonTitle="Enable notifications"
      requestPermission={requestPermission}
      errorMessage="Please enable notifications to stay informed about Radar's status."
    />
  );
} 