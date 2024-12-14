import React, { useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, StyleSheet, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import TextComponent from "@/components/TextComponent";
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabBar } from '@/components/BottomTabBar';
import { SettingsButton } from '@/components/SettingsButton';
import { StartRadarButton } from '@/components/StartRadarButton';
import { colors } from '@/styles/shared';
import { RadarIcon } from '@/components/Icons';
import radarLogo from '@/assets/images/RadarLogo.png';

export default function MyRadarScreen() {
  const [isRunning, setIsRunning] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

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

      // @ToDo implement execution of radar service
      await new Promise(resolve => setTimeout(resolve, 300));

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
            <Image
              source={radarLogo}
              style={styles.headerLogo}
            />
            <SettingsButton />
          </View>

          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              isRunning && styles.statusDotActive
            ]} />
            <Text style={[
              styles.statusText,
              isRunning && styles.statusTextActive
            ]}>
              {isLoading ? 'Loading...' : (isRunning ? 'Running' : 'Not running')}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <RadarIcon size={140} color={colors.radarIconBg} />
          <TextComponent text="When Radar is running, Wi-Fi hotspots, cell towers around you, and speed tests will appear here." centered />
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
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.inactiveRadarGray,
  },
  statusDotActive: {
    backgroundColor: colors.success,
  },
  statusText: {
    fontSize: 14,
    color: colors.inactiveRadarGray,
    fontWeight: '500',
  },
  statusTextActive: {
    color: colors.success,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: -40,
  },
  description: {
    textAlign: 'center',
    color: colors.white,
    fontSize: 16,
    marginTop: 24,
    opacity: 0.7,
    lineHeight: 24,
  },
});
