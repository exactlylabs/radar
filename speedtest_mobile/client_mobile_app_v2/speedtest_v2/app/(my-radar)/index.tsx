import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import TextComponent from "@/components/TextComponent";
import { LinearGradient } from 'expo-linear-gradient';
import { SettingsButton } from '@/components/SettingsButton';
import { StartRadarButton } from '@/components/StartRadarButton';
import { colors } from '@/styles/shared';
import { RadarIcon } from '@/components/Icons';
import radarLogo from '@/assets/images/RadarLogo.png';
import { radarService, type RadarStats } from '@/src/services/radar';
import wifiIcon from '@/assets/images/icons/wifiicon.png';
import cellTowerIcon from '@/assets/images/icons/celltowericon.png';
import activeIndicator from '@/assets/images/icons/activeindicator.png';

const getFormattedTime = (startTime: number | null) => {
  if (startTime === null) {
    return "Not running";
  }
  const now = Date.now();
  const elapsedTime = now - startTime;
  const hours = Math.floor((elapsedTime / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((elapsedTime / (1000 * 60)) % 60);
  const ampm = hours >= 12 ? 'pm' : 'am';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export default function MyRadarScreen() {
  const [isRunning, setIsRunning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<RadarStats>({
    wifiCount: 0,
    cellTowerCount: 0,
    items: []
  });
  const [startTime, setStartTime] = useState<number | null>(null);
  const [startTimeFormatted, setStartTimeFormatted] = useState<string | null>(null);

  useEffect(() => {
    loadRunningState();
  }, []);

  const loadRunningState = async () => {
    try {
      setIsLoading(true);
      // @ToDo implement fetch running state
      await new Promise(resolve => setTimeout(resolve, 500));
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to load running state:', error);
      setIsLoading(false);
    }
  };

  const toggleRadar = useCallback(async () => {
    try {
      const newState = !isRunning;
      setIsRunning(newState);

      if (newState) {
        const now = new Date();
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        setStartTimeFormatted(formattedTime);
        await radarService.startScanning();
        // @ToDO Mocked data. Fetch real results
        setStats({
          wifiCount: 0,
          cellTowerCount: 1,
          items: []
        });
      } else {
        setStartTimeFormatted(null);
        await radarService.stopScanning();
      }
    } catch (error) {
      console.error('Failed to toggle radar:', error);
      setIsRunning(!isRunning);
    }
  }, [isRunning]);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
        style={[StyleSheet.absoluteFillObject]}
      />
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <View style={styles.placeholderWidth}></View>
            <Image source={radarLogo} style={styles.headerLogo} />
            <SettingsButton />
          </View>

          <View style={styles.statusContainer}>
            {isRunning ? (
              <Image source={activeIndicator} style={styles.activeIndicator} />
            ) : (
              <View style={[styles.statusDot]} />
            )}
            <TextComponent
              text={isLoading ? "Loading..." : (isRunning ? `Started at ${startTimeFormatted}` : "Not running")}
              style={[styles.statusText, isRunning && styles.statusTextActive]}
            />
          </View>
        </View>

        <View style={styles.content}>
          {isRunning ? (
            <>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <View style={styles.statLabelContainer}>
                    <View style={[styles.iconBackground, styles.wifiIconBg]}>
                      <Image source={wifiIcon} style={styles.statIcon} />
                    </View>
                  </View>
                  <TextComponent text={stats.wifiCount.toString()} style={styles.statCount} />
                  <TextComponent text="Wi-Fi" style={styles.statLabel} />
                </View>
                <View style={styles.statItem}>
                  <View style={styles.statLabelContainer}>
                    <View
                      style={[styles.iconBackground, styles.cellTowerIconBg]}
                    >
                      <Image source={cellTowerIcon} style={styles.statIcon} />
                    </View>
                  </View>
                  <TextComponent text={stats.cellTowerCount.toString()} style={styles.statCount} />
                  <TextComponent text="Cell towers" style={styles.statLabel} />
                </View>
              </View>

              <View style={styles.radarResultsContainer}>
                <TextComponent text="RADAR" style={styles.radarTitle} />
                <TextComponent text="No items found yet." style={styles.noItemsText} />
                <TouchableOpacity style={styles.viewResultsButton}>
                  <TextComponent text="View results" style={styles.viewResultsText} />
                  <TextComponent text="›" style={styles.viewResultsArrow} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <RadarIcon size={140} color={colors.radarIconBg} />
              <TextComponent
                text="When Radar is running, Wi-Fi hotspots, cell towers around you, and speed tests will appear here."
                centered
              />
            </>
          )}
        </View>

        <StartRadarButton
          onPress={toggleRadar}
          isRunning={isRunning}
          isDisabled={isLoading}
        />

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  safeArea: {
    flex: 1,
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 4,
    marginTop: 40,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  placeholderWidth: {
    width: 24,
  },
  headerLogo: {
    width: 120,
    height: 29,
    resizeMode: "contain",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 16,
    height: 34,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray300,
  },
  statusDotActive: {
    backgroundColor: colors.success,
  },
  activeIndicator: {
    width: 12,
    height: 12,
    resizeMode: "contain",
  },
  statusText: {
    fontSize: 14,
    color: colors.gray300,
    fontWeight: "500",
  },
  statusTextActive: {
    color: colors.gray300,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
  },
  description: {
    textAlign: "center",
    color: colors.white,
    fontSize: 16,
    marginTop: 24,
    opacity: 0.7,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 48,
    marginBottom: 32,
  },
  statItem: {
    alignItems: "center",
    gap: 12,
  },
  statCount: {
    fontSize: 20,
    color: colors.veryLightBlue,
    fontWeight: "600",
    marginBottom: -5,
  },
  statLabel: {
    fontSize: 13,
    color: colors.lightGray,
  },
  radarResultsContainer: {
    backgroundColor: colors.radarResultsBg,
    borderRadius: 16,
    padding: 16,
    width: "100%",
    marginHorizontal: 0,
  },
  radarTitle: {
    fontSize: 12,
    color: colors.lightGray,
    marginBottom: 8,
    fontWeight: "700",
  },
  noItemsText: {
    fontSize: 15,
    color: colors.white,
    opacity: 0.4,
    marginBottom: 12,
  },
  viewResultsButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  viewResultsText: {
    fontSize: 14,
    color: colors.blue,
    fontWeight: "500",
  },
  viewResultsArrow: {
    fontSize: 14,
    color: colors.blue,
    marginLeft: 4,
  },
  statIcon: {
    width: 20,
    height: 20,
  },
  statLabelContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  wifiIconBg: {
    backgroundColor: colors.wifiIconBg,
  },
  cellTowerIconBg: {
    backgroundColor: colors.cellTowerIconBg,
  },
});
