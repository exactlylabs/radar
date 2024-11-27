export const PERMISSION_SCREENS = [
  {
    id: 'phone_access',
    path: '/permissions_1_phone_access',
    progressWidth: '16%',
  },
  {
    id: 'location_access',
    path: '/permissions_2_location_access',
    progressWidth: '32%',
  },
  {
    id: 'full_location',
    path: '/permissions_3_full_location',
    progressWidth: '50%',
  },
  {
    id: 'battery_savings',
    path: '/permissions_4_battery_savings',
    progressWidth: '66%',
  },
  {
    id: 'notifications',
    path: '/permissions_5_notifications',
    progressWidth: '83%',
  },
];

export const getNextScreen = (currentPath: string) => {
  const currentIndex = PERMISSION_SCREENS.findIndex(screen => screen.path === currentPath);
  return PERMISSION_SCREENS[currentIndex + 1]?.path;
}; 