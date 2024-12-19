import EndlessApsScannerModule from "./EndlessApsScannerModule";
import { EventSubscription } from "expo-modules-core";

export function scan(): String {
  return EndlessApsScannerModule.scan();
}

export function requestPermissions(): Boolean {
  return EndlessApsScannerModule.requestPermissions();
}

export type ScanResultReceivedEvent = {
  scanResult: string;
};

export function addScanResultsListener(listener: (event: ScanResultReceivedEvent) => void): EventSubscription {
  return EndlessApsScannerModule.addListener('onScanResults', listener);
}

export function listenOnScanResults(): void {
  return EndlessApsScannerModule.listenOnScanResults();
}

export function startService(): void {
  return EndlessApsScannerModule.startService();
}

export function stopService(): void {
  return EndlessApsScannerModule.stopService();
}

export function listenEvents(): void {
  return EndlessApsScannerModule.listenEvents();
}


