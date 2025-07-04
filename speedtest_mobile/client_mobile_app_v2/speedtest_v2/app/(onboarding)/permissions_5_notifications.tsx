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
        lightColor: rgba(255, 35, 31, 0.49),
    });

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    
    if (existingStatus !== PermissionsAndroid.RESULTS.GRANTED) {
      const { status } = await Notifications.requestPermissionsAsync();
      return status;
    }

    return existingStatus;
  };

  return (
    <PermissionRequest
      title="Enable notifications"
      description="Notifications will let you know when Radar is running and when it stops."
      buttonTitle="Enable notifications"
      requestPermission={requestPermission}
      errorMessage="Push notifications are required to keep you informed about Radar's status."
    />
  );
} 