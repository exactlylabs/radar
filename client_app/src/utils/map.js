import L from 'leaflet';

export const mapTileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const mapTileAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
export const customMarker = new L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.5.1/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [10, 41],
  popupAnchor: [2, -40],
});
