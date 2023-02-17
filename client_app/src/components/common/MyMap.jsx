import { useMap } from 'react-leaflet';
import {useEffect} from "react";
// The idea here is to remove the Ukranian flag from map's attribution
// and re-center map on marker click
export const MyMap = ({
  position,
  shouldRecenter,
  hasRecentered,
  setHasRecentered,
  onPopupClose,
  onPopupOpen,
  noZoomControl,
  userMapMovementHandler,
  userZoomHandler
}) => {
  const map = useMap();
  map.zoomControl = noZoomControl === undefined ? true : !noZoomControl;
  // Reference: https://github.com/Leaflet/Leaflet/pull/8109
  // Docs: https://react-leaflet.js.org/docs/api-map/#usemap
  map.attributionControl.setPrefix('');
  map.on('popupclose', onPopupClose);
  map.on('popupopen', onPopupOpen);
  if(shouldRecenter && position && !hasRecentered) {
    // Docs: https://leafletjs.com/reference.html#map-flyto
    map.flyTo(position, map.getZoom(), {animate: false});
    setHasRecentered(true);
  }
  if(userMapMovementHandler) {
    const moveHandler = () => userMapMovementHandler(map.getBounds());
    const zoomHandler = () => userZoomHandler(map.getBounds());
    if(map.listens('dragend')) map.off('dragend');
    map.on('dragend', moveHandler);
    if(map.listens('zoomend')) map.off('zoomend');
    map.on('zoomend', zoomHandler);
  }
  return null;
};
