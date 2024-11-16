import React from "react";
import { BackgroundMonitorProvider } from "./contexts/BackgroundMonitorContext";
import { BackgroundMonitorService } from "./components/BackgroundMonitorService";

export default function App() {
  return (
    <BackgroundMonitorProvider>
      <BackgroundMonitorService />
      {/* the rest of the app */}
    </BackgroundMonitorProvider>
  );
}
