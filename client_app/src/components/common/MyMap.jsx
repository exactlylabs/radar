import { useMap } from 'react-leaflet';

// The idea here is to remove the Ukranian flag from map's attribution
// and re-center map on marker click
export const MyMap = ({ position, shouldRecenter, onPopupClose, onPopupOpen, noZoomControl }) => {
  const map = useMap();
  map.zoomControl = !!noZoomControl;
  // Reference: https://github.com/Leaflet/Leaflet/pull/8109
  // Docs: https://react-leaflet.js.org/docs/api-map/#usemap
  map.attributionControl.setPrefix('');
  map.on('popupclose', onPopupClose);
  map.on('popupopen', onPopupOpen);
  if(shouldRecenter && position) {
    // Docs: https://leafletjs.com/reference.html#map-flyto
    map.flyTo(position, map.getZoom(), {duration: 0.1, easeLinearity: 0.0});
  }
  return null;
};
