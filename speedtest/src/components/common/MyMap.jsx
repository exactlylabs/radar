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
  userZoomHandler,
  userOnMoveHandler,
  setMap
}) => {
  const map = useMap();

  useEffect(() => {
    // Handy reference to map on parent component to handle
    // new requests with bounding box. Cannot use the useMap
    // hook in parent component as the useMap hook requires
    // usage in a child component of <MapContainer>
    if(map) {
      setMap && setMap(map);
      map.zoomControl = noZoomControl === undefined ? true : !noZoomControl;
      // Reference: https://github.com/Leaflet/Leaflet/pull/8109
      // Docs: https://react-leaflet.js.org/docs/api-map/#usemap
      map.attributionControl.setPrefix('');
      if(onPopupClose) {
        map.on('popupclose', onPopupClose);
      }
      if(onPopupOpen) {
        map.on('popupopen', onPopupOpen);
      }
    }
  }, [map]);

  if(shouldRecenter && position && !hasRecentered) {
    // Docs: https://leafletjs.com/reference.html#map-flyto
    map.flyTo(position, map.getZoom(), {animate: false});
    setHasRecentered(true);
  }

  if(userMapMovementHandler && userZoomHandler && userOnMoveHandler) {
    const moveHandler = () => userMapMovementHandler(map.getBounds());
    const zoomHandler = () => userZoomHandler(map.getBounds());
    if(map.listens('dragend')) map.off('dragend');
    map.on('dragend', moveHandler);
    if(map.listens('zoomend')) map.off('zoomend');
    map.on('zoomend', zoomHandler);
    if(map.listens('drag')) map.off('drag');
    map.on('drag', userOnMoveHandler);
  }

  return null;
};
