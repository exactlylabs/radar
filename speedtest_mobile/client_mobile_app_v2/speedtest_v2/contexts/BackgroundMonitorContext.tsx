import React, { createContext, useContext, useState } from 'react';
import { useForegroundService } from '../hooks/useForegroundService';

type BackgroundMonitorContextType = {
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
};

const BackgroundMonitorContext = createContext<BackgroundMonitorContextType | null>(null);

export function BackgroundMonitorProvider({ children }: { children: React.ReactNode }) {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { startService, stopService } = useForegroundService();

  const startMonitoring = () => {
    startService();
    setIsMonitoring(true);
  };

  const stopMonitoring = () => {
    stopService();
    setIsMonitoring(false);
  };

  return (
    <BackgroundMonitorContext.Provider value={{ isMonitoring, startMonitoring, stopMonitoring }}>
      {children}
    </BackgroundMonitorContext.Provider>
  );
}

export function useBackgroundMonitor() {
  const context = useContext(BackgroundMonitorContext);
  if (!context) {
    throw new Error('useBackgroundMonitor must be used within a BackgroundMonitorProvider');
  }
  return context;
}
