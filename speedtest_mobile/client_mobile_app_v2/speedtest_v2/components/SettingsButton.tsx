import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/styles/shared';
import { useRouter } from 'expo-router';

export const SettingsButton = () => {
  const router = useRouter();

  const handlePress = () => {
    router.push('/settings');
  };

  return (
    <TouchableOpacity 
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <Ionicons name="settings-outline" size={24} color={colors.text} />
    </TouchableOpacity>
  );
}; 