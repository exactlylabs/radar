import {ReactElement} from "react";
import L from "leaflet";
import {MapContainer, TileLayer, useMap} from "react-leaflet";
import {DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE, mapTileAttribution, mapTileUrl} from "../../utils/map";
import {styles} from "./styles/MyMap.style";

const CustomMap = (): null => {
  const map = useMap();
  // Reference: https://github.com/Leaflet/Leaflet/pull/8109
  // Docs: https://react-leaflet.js.org/docs/api-map/#usemap
  map.attributionControl.setPrefix('');
  // Limit map bounds to display only the US
  const topLeftBoundingPoint = L.latLng(53.979627, -136.862828);
  const bottomRightBoundingPoint = L.latLng(19.133341, -49.716708);
  const bounds = L.latLngBounds(topLeftBoundingPoint, bottomRightBoundingPoint);
  map.setMaxBounds(bounds);
  map.setMinZoom(4);
  map.on('drag', () => { map.panInsideBounds(bounds, {animate: false}) });
  return null;
}

const MyMap = (): ReactElement => {
  return (
    <MapContainer center={[DEFAULT_FALLBACK_LATITUDE, DEFAULT_FALLBACK_LONGITUDE]}
                  zoom={4}
                  scrollWheelZoom
                  style={styles.MapContainer()}
    >
      <CustomMap />
      <TileLayer attribution={mapTileAttribution} url={mapTileUrl} />
      <TileLayer attribution={mapTileAttribution} url={"http://127.0.0.1:5000/test/{z}/{x}/{z}"} />
    </MapContainer>
  )
}

export default MyMap;