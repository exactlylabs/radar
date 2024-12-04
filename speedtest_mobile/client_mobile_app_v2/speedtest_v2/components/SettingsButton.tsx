import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/shared';

export const SettingsButton = () => {
  return (
    <TouchableOpacity activeOpacity={0.7}>
      <Ionicons name="settings-outline" size={24} color={colors.text} />
    </TouchableOpacity>
  );
}; 