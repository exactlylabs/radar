// SpeedTestModule.js
import { NativeModules } from 'react-native';
import { performSpeedTest } from './speedTest';

const { SpeedTestModule } = NativeModules;

// Export a function that performs the speed test
export function triggerSpeedTest() {
  const result = performSpeedTest();
  // Pass result back if needed
  SpeedTestModule.onSpeedTestResult(result);
}
