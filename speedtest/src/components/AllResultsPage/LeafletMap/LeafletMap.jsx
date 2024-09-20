import {useContext, useEffect, useRef} from "react";
import {patchVectorLayer, VECTOR_TILES_URL, vectorTileOptions} from "../../../vendor/leaflet/leaflet";
import L from 'leaflet';
import 'leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.js';
import 'leaflet/dist/leaflet.css';
import ConfigContext from "../../../context/ConfigContext";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import ReactDOM from "react-dom/client";
import MyPopup from "../MyPopup";
import maplibregl from "maplibre-gl";
import {Point} from "leaflet/dist/leaflet-src.esm";

const popupOptions = {
  keepInView: true,
  closeButton: false,
  closeOnEscapeKey: true,
  maxWidth: 285,
  offset: new Point(165,200),
}

const LeafletMap = ({maxHeight}) => {

  const map = useRef(null);
  const mapContainer = useRef(null);
  const popupRef = useRef(null);
  const config = useContext(ConfigContext);
  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  useEffect(() => {
    if(map.current || !mapContainer.current) return; // prevent double map initialization

    map.current = L
      .map(mapContainer.current, { preferCanvas: true })
      .setView([40.432, -3.72], 7);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
      minZoom: 2.5,
      noWrap: true
    }).addTo(map.current);

    const baseLayer = L.vectorGrid.protobuf(VECTOR_TILES_URL + '?client_id=' + config.clientId, vectorTileOptions).on('click', (e) => {
      const popupNode = document.createElement('div');
      popupNode.style.width = '275px';
      const popupRoot = ReactDOM.createRoot(popupNode);
      const feature = e.layer.properties;
      popupRoot.render(<MyPopup measurement={feature} provider={'leaflet-new'}/>);
      popupRef.current = L.popup(popupOptions)
          .setLatLng([feature.latitude, feature.longitude])
          .setContent(popupNode)
          .openOn(map.current);
      map.current.flyTo(L.latLng(feature.latitude, feature.longitude), map.current.getZoom() > 12 ? map.current.getZoom() : 12, {animate: false});
    });

    patchVectorLayer(baseLayer).addTo(map.current);

    return () => {
      this.map.remove();
    }
  }, []);

  const getMapContainerHeight = () => {
    if(config.widgetMode || config.webviewMode) {
      return `100%`;
    }
    if(isMediumSizeScreen || isSmallSizeScreen) return 'calc(99vh - 125px)';
    else return `calc(${maxHeight} - 70px - 173px - 53px)`;
  }

  return (
    <div id={'speedtest--all-results-page--map-container'}
         ref={mapContainer}
         style={{ height: getMapContainerHeight(), margin: 0, position: 'relative', overflowY: 'hidden' }}
    ></div>
  )
};

export default LeafletMap;