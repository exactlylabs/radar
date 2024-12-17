import React, { useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import TextComponent from "@/components/TextComponent";
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBar } from '@/components/BottomTabBar';
import { SettingsButton } from '@/components/SettingsButton';
import { StartRadarButton } from '@/components/StartRadarButton';
import { colors } from '@/styles/shared';
import { RadarIcon } from '@/components/Icons';
import radarLogo from '@/assets/images/RadarLogo.png';
import { radarService, type RadarStats } from '@/src/services/radar';
import wifiIcon from '@/assets/images/icons/wifiicon.png';
import cellTowerIcon from '@/assets/images/icons/celltowericon.png';
import activeIndicator from '@/assets/images/icons/activeindicator.png';

const getFormattedTime = () => {
  const now = new Date();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  const ampm = hours >= 12 ? 'pm' : 'am';
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, '0');
  return `${formattedHours}:${formattedMinutes} ${ampm}`;
};

export default function MyRadarScreen() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [stats, setStats] = React.useState<RadarStats>({
    wifiCount: 0,
    cellTowerCount: 0,
    items: []
  });

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
        await radarService.startScanning();
        // Mock initial stats
        setStats({
          wifiCount: 0,
          cellTowerCount: 1,
          items: []
        });
      } else {
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
            <Text
              style={[styles.statusText, isRunning && styles.statusTextActive]}
            >
              {isLoading
                ? "Loading..."
                : isRunning
                ? `Running since ${getFormattedTime()}`
                : "Not running"}
            </Text>
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
                  <Text style={styles.statCount}>{stats.wifiCount}</Text>
                  <Text style={styles.statLabel}>Wi-Fi</Text>
                </View>
                <View style={styles.statItem}>
                  <View style={styles.statLabelContainer}>
                    <View
                      style={[styles.iconBackground, styles.cellTowerIconBg]}
                    >
                      <Image source={cellTowerIcon} style={styles.statIcon} />
                    </View>
                  </View>
                  <Text style={styles.statCount}>{stats.cellTowerCount}</Text>
                  <Text style={styles.statLabel}>Cell towers</Text>
                </View>
              </View>

              <View style={styles.radarResultsContainer}>
                <Text style={styles.radarTitle}>RADAR</Text>
                <Text style={styles.noItemsText}>No items found yet.</Text>
                <TouchableOpacity style={styles.viewResultsButton}>
                  <Text style={styles.viewResultsText}>View results</Text>
                  <Text style={styles.viewResultsArrow}>›</Text>
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
          disabled={isLoading}
        />

        {/* <BottomTabBar /> */}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  placeholderWidth: {
    width: 24,
  },
  headerLogo: {
    width: 120,
    height: 29,
    resizeMode: 'contain',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
    height: 34,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.inactiveRadarGray,
  },
  statusDotActive: {
    backgroundColor: '#34C759',
  },
  activeIndicator: {
    width: 12,
    height: 12,
    resizeMode: 'contain',
  },
  statusText: {
    fontSize: 14,
    color: colors.inactiveRadarGray,
    fontWeight: '500',
  },
  statusTextActive: {
    color: colors.inactiveRadarGray,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  description: {
    textAlign: 'center',
    color: colors.white,
    fontSize: 16,
    marginTop: 24,
    opacity: 0.7,
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 48,
    marginBottom: 32,
  },
  statItem: {
    alignItems: 'center',
    gap: 12,
  },
  statCount: {
    fontSize: 32,
    color: colors.white,
    fontWeight: '600',
  },
  statLabel: {
    fontSize: 14,
    color: colors.white,
    opacity: 0.7,
  },
  radarResultsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    marginHorizontal: 0,
  },
  radarTitle: {
    fontSize: 12,
    color: colors.white,
    opacity: 0.5,
    marginBottom: 8,
    fontWeight: '600',
  },
  noItemsText: {
    fontSize: 16,
    color: colors.white,
    marginBottom: 12,
  },
  viewResultsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewResultsText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  viewResultsArrow: {
    fontSize: 14,
    color: colors.primary,
    marginLeft: 4,
  },
  statIcon: {
    width: 20,
    height: 20,
  },
  statLabelContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
  },
  iconBackground: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wifiIconBg: {
    backgroundColor: '#34C759',
  },
  cellTowerIconBg: {
    backgroundColor: '#FF9500',
  },
});
