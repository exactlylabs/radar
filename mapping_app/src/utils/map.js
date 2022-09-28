import L from 'leaflet';

export const mapTileUrl = MAPBOX_TILESET_URL;
export const mapTileAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Specific coordinates to fallback onto almost center point of the US
export const DEFAULT_FALLBACK_LATITUDE = 40.566296;
export const DEFAULT_FALLBACK_LONGITUDE = -97.264547;
