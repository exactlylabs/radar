import React, { useEffect } from "react";
import { useForegroundService } from "@/hooks/useForegroundService";

export function BackgroundMonitorService() {
  const { startService, stopService } = useForegroundService();

  useEffect(() => {
    startService();

    return () => {
      stopService();
    };
  }, []);

  // Este componente no renderiza nada visualmente
  return null;
}
