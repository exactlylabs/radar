import React from 'react';
import { TouchableOpacity, Image } from 'react-native';
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
      <Image source={require('@/assets/images/icons/gearicon.png')} style={{ width: 24, height: 24, tintColor: colors.white }} />
    </TouchableOpacity>
  );
};
