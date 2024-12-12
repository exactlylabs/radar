import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '@/styles/shared';

interface StartRadarButtonProps {
  onPress: () => void;
  isRunning: boolean;
  disabled?: boolean;
}

export const StartRadarButton = ({
  onPress,
  isRunning,
  disabled = false
}: StartRadarButtonProps) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled
      ]}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={disabled}
    >
      <Text style={[
        styles.buttonText,
        disabled && styles.buttonTextDisabled
      ]}>
        {isRunning ? 'Stop Radar' : 'Start Radar'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.bgLightBlueButtomPrimary,
    marginHorizontal: 16,
    marginBottom: 32,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: colors.inactive,
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "MulishRegular",
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
});
