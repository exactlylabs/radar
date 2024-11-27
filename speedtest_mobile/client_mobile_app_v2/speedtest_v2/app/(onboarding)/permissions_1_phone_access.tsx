import { PermissionsAndroid } from "react-native";
import PermissionRequest from "@/components/PermissionRequest";

export default function Permissions1PhoneAccess() {
  const requestPermission = async () => {
    return await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_PHONE_STATE,
      {
        title: "Phone State Permission",
        message: "This app needs access to your phone state.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
  };

  return (
    <PermissionRequest
      title="Access to cellular and Wi-Fi reception"
      description="Your cellular and Wi-Fi signal is used to identify Wi-Fi hotspots and cell towers and to run speed tests accurately."
      buttonTitle="Enable phone access"
      progressBarWidth="16%"
      nextPath="/permissions_2_location_access"
      requestPermission={requestPermission}
      errorMessage="This app requires phone state permissions to function properly."
    />
  );
}
