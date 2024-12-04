import React from 'react';
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

export default function RadarScreen() {
  const [isRunning, setIsRunning] = React.useState(false);

  return (
    <LinearGradient
      colors={[colors.backgroundGradientStart, colors.backgroundGradientEnd]}
      style={styles.container}
    >
      <StatusBar style="light" backgroundColor="transparent" />
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
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Not running</Text>
          </View>
        </View>

        <View style={styles.content}>
          <RadarIcon size={140} opacity={0.15} color={colors.radarIconBg} />
          <TextComponent text="When Radar is running, Wi-Fi hotspots, cell towers around you, and speed tests will appear here." centered />
        </View>

        <StartRadarButton 
          onPress={() => setIsRunning(!isRunning)}
          isRunning={isRunning}
        />

        <BottomTabBar />
      </SafeAreaView>
    </LinearGradient>
  );
}

// @ToDo move this to sharedStyles
const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    backgroundColor: colors.inactive,
  },
  statusText: {
    fontSize: 14,
    color: colors.inactive,
    fontWeight: '500',
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
    color: colors.text,
    fontSize: 16,
    marginTop: 24,
    opacity: 0.7,
    lineHeight: 24,
  },
}); 