import * as Location from 'expo-location';
import PermissionRequest from "@/components/PermissionRequest";

export default function Permissions3FullLocation() {
  const requestPermission = async () => {
    const { status } = await Location.requestBackgroundPermissionsAsync();
    return status;
  };

  return (
    <PermissionRequest
      title="Allow access to your location all the time"
      description="Your location is needed even when the app is closed so that Radar works in the background."
      buttonTitle="Update location settings"
      requestPermission={requestPermission}
      errorMessage="This app requires access to your location all the time to function properly."
    />
  );
}
