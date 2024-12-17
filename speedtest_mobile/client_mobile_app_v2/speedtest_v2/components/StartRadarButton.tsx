import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, fonts } from '@/styles/shared';

interface StartRadarButtonProps {
  onPress: () => void;
  isRunning: boolean;
  isDisabled?: boolean;
}

export const StartRadarButton = ({
  onPress,
  isRunning,
  isDisabled = false
}: StartRadarButtonProps) => {
  const buttonStyles = [
    styles.button,
    isRunning ? styles.buttonRunning : styles.buttonNotRunning,
    isDisabled && styles.buttonDisabled
  ];
  const buttonTextStyles = [
    styles.buttonText,
    isDisabled && styles.buttonTextDisabled
  ];

  return (
    <TouchableOpacity
      style={buttonStyles}
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
    >
      <Text style={buttonTextStyles}>
        {isRunning ? 'Stop Radar' : 'Start Radar'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    marginHorizontal: 16,
    marginBottom: 32,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRunning: {
    backgroundColor: 'transparent',
    borderColor: colors.blue,
    borderWidth: 1.5
  },
  buttonNotRunning: {
    backgroundColor: colors.primary
  },
  buttonDisabled: {
    backgroundColor: colors.inactiveRadarGray,
    opacity: 0.7,
  },
  buttonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "600",
    fontFamily: fonts.MulishRegular,
  },
  buttonTextDisabled: {
    opacity: 0.7,
  },
});
