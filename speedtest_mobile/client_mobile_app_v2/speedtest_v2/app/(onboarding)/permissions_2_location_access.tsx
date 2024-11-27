import * as Location from 'expo-location';
import PermissionRequest from "@/components/PermissionRequest";

export default function Permissions2LocationAccess() {
  const requestPermission = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status;
  };

  return (
    <PermissionRequest
      title="Access to your location"
      description="Your location is used to map Wi-Fi hotspots and cell towers, and to provide you with the locations where wireless quality is being measured."
      buttonTitle="Enable location access"
      requestPermission={requestPermission}
      errorMessage="This app requires location permissions to function properly."
    />
  );
}
