import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/shared';

interface StartRadarButtonProps {
  onPress: () => void;
  isRunning: boolean;
}

export const StartRadarButton = ({ onPress, isRunning }: StartRadarButtonProps) => {
  return (
    <TouchableOpacity 
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.buttonText}>
        {isRunning ? 'Stop Radar' : 'Start Radar'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    marginHorizontal: 16,
    marginBottom: 32,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'MulishRegular',
  },
}); 