import { NativeModules } from 'react-native';

const { ForegroundService } = NativeModules;

export function useForegroundService() {
  const startService = () => {
    ForegroundService.startService();
  };

  const stopService = () => {
    ForegroundService.stopService();
  };

  return { startService, stopService };
}
