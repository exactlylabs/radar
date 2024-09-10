import {useContext, useEffect, useRef} from "react";
import {patchVectorLayer, VECTOR_TILES_URL, vectorTileOptions} from "../../../vendor/leaflet/leaflet";
import L from 'leaflet';
import 'leaflet.vectorgrid/dist/Leaflet.VectorGrid.bundled.js';
import 'leaflet/dist/leaflet.css';
import ConfigContext from "../../../context/ConfigContext";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

const LeafletMap = ({maxHeight}) => {

  const map = useRef(null);
  const mapContainer = useRef(null);
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
    patchVectorLayer(L.vectorGrid.protobuf(VECTOR_TILES_URL, vectorTileOptions)).addTo(map.current);

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