import { useMap } from 'react-leaflet';

// The idea here is to remove the Ukranian flag from map's attribution
export const MyMap = () => {
  const map = useMap();
  // Reference: https://github.com/Leaflet/Leaflet/pull/8109
  // Docs: https://react-leaflet.js.org/docs/api-map/#usemap
  map.attributionControl.setPrefix('');
  return null;
};
