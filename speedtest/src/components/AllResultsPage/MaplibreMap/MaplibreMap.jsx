import {useContext, useEffect, useRef} from "react";
import ReactDOM from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {VECTOR_TILES_URL} from "../../../utils/leaflet";
import {
  DEFAULT_DOWNLOAD_FILTER_HIGH,
  DEFAULT_DOWNLOAD_FILTER_LOW,
  DEFAULT_DOWNLOAD_FILTER_MID, DEFAULT_DOWNLOAD_FILTER_NONE
} from "../../../utils/colors";
import ConfigContext from "../../../context/ConfigContext";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import MyPopup from "../MyPopup";

const popupOptions = {
  offset: [20, -28],
  closeButton: false,
  closeOnMove: false,
  closeOnClick: true,
  anchor: 'top-left',
  maxWidth: 'none',
  subpixelPositioning: true
}

const MaplibreMap = ({maxHeight, centerCoordinates}) => {

  const mapContainer = useRef(null);
  const map = useRef(null);
  const popupRef = useRef(new maplibregl.Popup(popupOptions));

  const config = useContext(ConfigContext);
  const {isSmallSizeScreen, isMediumSizeScreen} = useViewportSizes();

  useEffect(() => {
    if(map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      center: centerCoordinates,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [`https://api.mapbox.com/styles/v1/exactlylabs/cl7iwvbaz000l15mmms6da3kx/tiles/512/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`],
            tileSize: 512
          }
        },
        layers: [
          {
            id: 'base-tiles',
            type: 'raster',
            source: 'raster-tiles',
          }
        ]
      },
      zoom: 7
    });

    map.current.addControl(new maplibregl.NavigationControl());

    map.current.on('load', () => {
      // Add vector tile source and layer here
      map.current.addSource('custom-tiles', {
        type: 'vector',
        tiles: [VECTOR_TILES_URL + '?client_id=' + config.clientId],
        minzoom: 0,
        maxzoom: 14,
      });

      map.current.addLayer({
        id: 'circle-layer',
        type: 'circle',
        source: 'custom-tiles',
        'source-layer': 'tests',
        paint: {
          'circle-radius': [
            'interpolate',
            ['linear'],  // This specifies a linear interpolation
            ['zoom'],    // Using the current zoom level for interpolation
            5, 5,
            15, 8
          ],
          'circle-color': [
            'case',
            ['>=', ['get', 'connection_quality'], 2],
            DEFAULT_DOWNLOAD_FILTER_HIGH, // Color for served
            ['>=', ['get', 'connection_quality'], 1],
            DEFAULT_DOWNLOAD_FILTER_MID, // Color for underserved
            ['>=', ['get', 'connection_quality'], 0],
            DEFAULT_DOWNLOAD_FILTER_LOW, // Color for unserved
            // Default color for all other cases
            DEFAULT_DOWNLOAD_FILTER_NONE
          ],
          'circle-stroke-width': 0,
        },
      });
    });

    map.current.on('click', (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {layers: ['circle-layer']});
      if(!features.length) return;
      const feature = features[0];
      const popupNode = document.createElement('div');
      const popupRoot = ReactDOM.createRoot(popupNode);
      popupRoot.render(<MyPopup measurement={feature.properties} provider={'maplibre'}/>);
      popupRef.current
        .setLngLat([feature.geometry.coordinates[0], feature.geometry.coordinates[1]])
        .setDOMContent(popupNode)
        .addTo(map.current);
      map.current.flyTo({center: [feature.geometry.coordinates[0], feature.geometry.coordinates[1]], zoom: 12});
    });

    map.current.on('mouseenter', 'circle-layer', () => {
      map.current.getCanvas().style.cursor = 'pointer';
    });

    map.current.on('mouseleave', 'circle-layer', () => {
      map.current.getCanvas().style.cursor = 'default';
    });

    return () => {
      map.current.remove();
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
         style={{height: getMapContainerHeight(), margin: 0, position: 'relative', overflowY: 'hidden'}}
    ></div>
  )
}

export default MaplibreMap;