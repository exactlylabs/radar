import { NativeModules } from 'react-native';

const { ForegroundServiceModule } = NativeModules;

export const startService = () => ForegroundServiceModule.startService();
export const stopService = () => ForegroundServiceModule.stopService();
