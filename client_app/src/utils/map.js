import L from 'leaflet';

export const mapTileUrl = `https://api.mapbox.com/styles/v1/eugedamm/cl6gn9zaj007n15nte2uyks96/tiles/512/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`;
export const mapTileAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const customMarker = new L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40],
});

export const SMALL_SCREEN_MAP_HEIGHT = 400;
