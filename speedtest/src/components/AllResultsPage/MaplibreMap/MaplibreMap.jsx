import {useContext, useEffect, useRef, useState} from "react";
import ReactDOM from 'react-dom/client';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {VECTOR_TILES_URL} from "../../../utils/leaflet";
import {
  DEFAULT_DOWNLOAD_FILTER_NONE, NEW_SPEED_HIGH, NEW_SPEED_LOW, NEW_SPEED_MEDIUM
} from "../../../utils/colors";
import ConfigContext from "../../../context/ConfigContext";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import CustomModal from "../../common/modals/CustomModal";
import FTUEMapModal from "../../common/modals/FTUEMapModal";
import RecentTestTooltip from "../../common/tooltips/RecentTestTooltip";
import AutoDetectLocationButton from "./AutoDetectLocationButton";
import ClassificationsModal from "../../common/modals/ClassificationsModal";
import NewPopup from "../NewPopup";
import FiltersPanel from "./FiltersPanel";

const popupOptions = {
  offset: [-165, -350],
  closeButton: false,
  closeOnMove: false,
  closeOnClick: false,
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

  const [ftueModalOpen, setFtueModalOpen] = useState(false);
  const [classificationsModalOpen, setClassificationsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(!isSmallSizeScreen);

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

    map.current.addControl(new maplibregl.NavigationControl({showCompass: false}), 'top-right');

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
            NEW_SPEED_HIGH, // Color for served
            ['>=', ['get', 'connection_quality'], 1],
            NEW_SPEED_MEDIUM, // Color for underserved
            ['>=', ['get', 'connection_quality'], 0],
            NEW_SPEED_LOW, // Color for unserved
            // Default color for all other cases
            DEFAULT_DOWNLOAD_FILTER_NONE
          ],
          'circle-stroke-width': 0,
        },
      });
    });

    map.current.on('click', (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {layers: ['circle-layer']});
      if(!features.length) {
        if(popupRef.current) popupRef.current.remove();
        return;
      }
      const feature = features[0];
      const popupNode = document.createElement('div');
      popupNode.style.borderRadius = '12px';
      const popupRoot = ReactDOM.createRoot(popupNode);
      popupRoot.render(<NewPopup test={feature.properties} />);
      if(popupRef.current) popupRef.current.remove();
      popupRef.current
        .setLngLat([feature.geometry.coordinates[0], feature.geometry.coordinates[1]])
        .setDOMContent(popupNode)
        .addTo(map.current);
      requestAnimationFrame(() => {
        const renderedPopupHeight = popupNode.clientHeight;
        const renderedPopupWidth = popupNode.clientWidth;
        const popupOffset = [-renderedPopupWidth / 2 - 2, -renderedPopupHeight - 16];
        popupRef.current.setOffset(popupOffset);
        let clickedFeaturePixelPoint = map.current.project(feature.geometry.coordinates);
        const mapHeight = map.current.getContainer().clientHeight;
        const targetYPosition = mapHeight * 0.8;
        let delta = clickedFeaturePixelPoint.y - targetYPosition;
        let currentCenterPixel = map.current.project(map.current.getCenter());
        let newCenterPixel = {x: clickedFeaturePixelPoint.x, y: currentCenterPixel.y + delta};
        let newCenterCoordinates = map.current.unproject(newCenterPixel);
        map.current.easeTo({
          center: newCenterCoordinates,
          duration: 1000,
          zoom: map.current.getZoom()
        });
      });
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

  const closeFTUEModal = () => { setFtueModalOpen(false); }
  const closeClassificationsModal = () => { setClassificationsModalOpen(false); }

  const useAutoLocate = ({lat, lng}) => {
    map.current.flyTo({center: [lng, lat], zoom: 12});
  }

  const toggleFiltersPanel = () => {
    setFiltersPanelOpen(!filtersPanelOpen);
  }

  return (
    <>
      <div id={'speedtest--all-results-page--map-container'}
           ref={mapContainer}
           style={{height: getMapContainerHeight(), margin: 0, position: 'relative', overflowY: 'hidden'}}
      >
        <AutoDetectLocationButton useLocation={useAutoLocate}/>
        <FiltersPanel isOpen={filtersPanelOpen} togglePanel={toggleFiltersPanel}/>
      </div>
      <CustomModal isOpen={ftueModalOpen} closeModal={closeFTUEModal}>
        <FTUEMapModal closeModal={closeFTUEModal}/>
      </CustomModal>
      <CustomModal isOpen={classificationsModalOpen} closeModal={closeClassificationsModal}>
        <ClassificationsModal closeModal={closeClassificationsModal}/>
      </CustomModal>
      { showTooltip && <RecentTestTooltip /> }
    </>
  )
}

export default MaplibreMap;