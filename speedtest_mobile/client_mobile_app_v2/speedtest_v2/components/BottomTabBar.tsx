import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, fonts } from '@/styles/shared';
import { RadarIcon, SpeedometerIcon, MapIcon } from './Icons';

// @ToDo add functionality for switching tabs
export const BottomTabBar = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
        <RadarIcon size={24} color={colors.bgLightBlueButtomPrimary} />
        <Text style={[styles.tabText, styles.activeTabText]}>My Radar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
        <SpeedometerIcon size={24} color={colors.gray400} />
        <Text style={styles.tabText}>Speed tests</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.tab} activeOpacity={0.7}>
        <MapIcon size={24} color={colors.gray400} />
        <Text style={styles.tabText}>Explore</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.tabBarBackground,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 0,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  tabText: {
    color: colors.white,
    fontSize: 12,
    opacity: 0.7,
  },
  activeTabText: {
    opacity: 1,
    color: colors.primary,
  },
});
