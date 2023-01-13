import L from 'leaflet';
import MapMarker from '../assets/map-marker.png';
import MapMarkerBg from '../assets/map-marker-shadow.png';

export const mapTileUrl = MAPBOX_TILESET_URL;
export const mapTileAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const customMarker = new L.icon({
  iconUrl: MapMarker,
  shadowUrl: MapMarkerBg,
  iconSize:     [32, 38], // size of the icon
  shadowSize:   [132, 132], // size of the shadow
  iconAnchor:   [16, 38], // point of the icon which will correspond to marker's location
  shadowAnchor: [65, 85],  // the same for the shadow
});

export const SMALL_SCREEN_MAP_HEIGHT = 400;

// Specific coordinates to fallback onto almost center point of the US
export const DEFAULT_FALLBACK_LATITUDE = 40.566296;
export const DEFAULT_FALLBACK_LONGITUDE = -97.264547;
