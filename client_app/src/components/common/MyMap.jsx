import { useMap } from 'react-leaflet';

export const MyMap = () => {
  const map = useMap();
  map.attributionControl.setPrefix(''); // Remove Ukranian flag from attribution
  return null;
};
