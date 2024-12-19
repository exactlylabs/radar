import { NativeModule, requireNativeModule } from 'expo';

declare class EndlessApsScannerModule extends NativeModule<EndlessApsScannerModule> {
  PI: number;
  requestPermissions(): boolean;
  scan(): String;
  listenOnScanResults(): void;
  startService(): void;
  stopService(): void;
  listenEvents(): void;
}

// This call loads the native module object from the JSI.
export default requireNativeModule<EndlessApsScannerModule>('EndlessApsScanner');
