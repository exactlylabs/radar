import * as Battery from "expo-battery";
import { Linking } from "react-native";
import { PermissionsAndroid } from "react-native";
import PermissionRequest from "@/components/PermissionRequest";

export default function Permissions4BatterySavings() {
  const requestPermission = async () => {
    const isBatterySavingEnabled = await Battery.isLowPowerModeEnabledAsync();
    if (isBatterySavingEnabled) {
      await Linking.openSettings();
      return PermissionsAndroid.RESULTS.DENIED;
    }
    return PermissionsAndroid.RESULTS.GRANTED;
  };

  return (
    <PermissionRequest
      title="Disable your battery saving settings"
      description="Your current battery settings might impact your results. Make sure to disable your battery saving settings on your device."
      buttonTitle="Update settings"
      progressBarWidth="66%"
      nextPath="/permissions_5_notifications"
      requestPermission={requestPermission}
      errorMessage="Please disable battery saving mode to ensure accurate measurements."
    />
  );
}
