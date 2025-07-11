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
import CalendarModal from "./Filters/CalendarModal";
import ClassificationAndLayersPanel from "./ClassificationAndLayersPanel";
import {ResultsTabs, TABS} from "./ResultsTabs";
import FiltersContext from "../../../context/FiltersContext";

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
  const {lastManualMapUpdate, setVisibleIspList, getFiltersAsSearchParams, setCostDistributionList} = useContext(FiltersContext);

  const [ftueModalOpen, setFtueModalOpen] = useState(false);
  const [classificationsModalOpen, setClassificationsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(!config.webviewMode && !config.widgetMode && !isMediumSizeScreen && !isSmallSizeScreen);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [layersPopupOpen, setLayersPopupOpen] = useState(false);
  const [resultsTabSelected, setResultsTabSelected] = useState(TABS.ALL_RESULTS);
  const [updateFiltersDate, setUpdateFiltersDate] = useState(new Date());
  const [initialLoadFinished, setInitialLoadFinished] = useState(false);

  const mapProperties = {
    TILE_SIZE: 512,
    BUFFER: 0,
    CLIP: false,
    MIN_ZOOM: 3,
    MAX_ZOOM: 14,
  };

  useEffect(() => {
    if(map.current || !mapContainer.current) return;
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      center: [centerCoordinates[1], centerCoordinates[0]], // [lng, lat]
      minZoom: mapProperties.MIN_ZOOM,
      maxZoom: mapProperties.MAX_ZOOM,
      style: {
        version: 8,
        sources: {
          'raster-tiles': {
            type: 'raster',
            tiles: [`https://api.mapbox.com/styles/v1/exactlylabs/cl7iwvbaz000l15mmms6da3kx/tiles/${mapProperties.TILE_SIZE}/{z}/{x}/{y}?access_token=${MAPBOX_ACCESS_TOKEN}`],
            tileSize: mapProperties.TILE_SIZE,
          },
          'custom-tiles': {
            type: 'vector',
            tiles: [vectorTilesUrl()],
            minzoom: mapProperties.MIN_ZOOM,
            maxzoom: mapProperties.MAX_ZOOM,
            tileSize: 512, //only works with 512 tile sizes (read the code)
            isTileClipped: true,
          }
        },
        layers: [
          {
            id: 'base-tiles',
            type: 'raster',
            source: 'raster-tiles',
            tileSize: mapProperties.TILE_SIZE,
          },
          {
            id: 'circle-layer',
            type: 'circle',
            source: 'custom-tiles',
            'source-layer': 'tests',
            tileSize: mapProperties.TILE_SIZE,
            paint: {
              'circle-radius': [
                'interpolate',
                ['linear'],  // This specifies a linear interpolation
                ['zoom'],    // Using the current zoom level for interpolation
                mapProperties.MIN_ZOOM, 5,
                mapProperties.MAX_ZOOM, 8
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
          }
        ]
      },
      zoom: 7
    });

    if(REACT_APP_ENV === 'development') {
      map.current.showTileBoundaries = true; // Check if tile boundaries align
    }

    map.current.addControl(new maplibregl.NavigationControl({showCompass: false}), 'top-right');

    map.current.on('click', (e) => {
      const features = map.current.queryRenderedFeatures(e.point, {layers: ['circle-layer'], validate: false});
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

    map.current.on('sourcedata', (e) => {
      if (e.sourceId === 'custom-tiles') {
        let ispMap = new Map();
        let distributions = [];
        const desiredBarCount = 10;
        const maxCost = 500;
        const idealStep = maxCost / desiredBarCount;
        for (let i = 0; i <= maxCost; i += idealStep) {
          distributions.push({count: 0, value: i, visible: true});
        }
        if (map.current.getLayer('circle-layer')) {
          const features = map.current.querySourceFeatures('custom-tiles', {sourceLayer: 'tests', validate: false});
          features.forEach(feature => {
            if(!!feature.properties.autonomous_system_org_name && feature.properties.autonomous_system_org_name !== '') {
              const { autonomous_system_org_name, autonomous_system_org_id } = feature.properties;
              if (ispMap.has(autonomous_system_org_id)) {
                ispMap.set(autonomous_system_org_id, {label: autonomous_system_org_name, count: ispMap.get(autonomous_system_org_id).count + 1});
              } else {
                ispMap.set(autonomous_system_org_id, {label: autonomous_system_org_name, count: 1});
              }
            }
            let cost = Number(feature.properties.network_cost);
            if(isNaN(cost)) return;
            const distribution = distributions.find(distribution => distribution.value >= cost);
            if(distribution) distribution.count++;
          });
        }
        setVisibleIspList(ispMap);
        setCostDistributionList(distributions);
      }
    });

    map.current.once('load', async () => {
      setInitialLoadFinished(true);
    });

    return () => {
      map.current.remove();
    }
  }, []);

  useEffect(() => {
    if(map.current && initialLoadFinished) {
      //close popup if it's open
      if(popupRef.current) popupRef.current.remove();
      setVisibleIspList(new Map());

      map.current.getSource('custom-tiles').setTiles([vectorTilesUrl()]);
    }
  }, [updateFiltersDate, lastManualMapUpdate]);

  // Need to append as strings instead of using a native URL object
  // otherwise Maplibre doesn't render the tiles correctly
  const vectorTilesUrl = () => {
    return VECTOR_TILES_URL +
      '?client_id=' + config.clientId +
      '&' + getFiltersAsSearchParams().toString() +
      '&tile_size=' + mapProperties.TILE_SIZE +
      '&buffer=' + mapProperties.BUFFER +
      '&clip=' + mapProperties.CLIP;
  }

  const getMapContainerHeight = () => {
    if(config.widgetMode || config.webviewMode) {
      return `100%`;
    }
    if(isMediumSizeScreen || isSmallSizeScreen) return 'calc(99vh - 125px)';
    else return `calc(${maxHeight} - 70px - 173px - 53px)`;
  }

  const closeFTUEModal = () => { setFtueModalOpen(false); }
  const closeClassificationsModal = () => { setClassificationsModalOpen(false); }
  const closeCalendarModal = () => { setCalendarModalOpen(false); }

  const useAutoLocate = ({lat, lng}) => {
    map.current.flyTo({center: [lng, lat], zoom: 12});
  }

  const toggleFiltersPanel = () => {
    setFiltersPanelOpen(!filtersPanelOpen);
  }

  const toggleLayersPopup = () => {
    setLayersPopupOpen(!layersPopupOpen);
  }

  const toggleResultsTab = () => {
    const tab = resultsTabSelected === TABS.ALL_RESULTS ? TABS.YOUR_RESULTS : TABS.ALL_RESULTS;
    setResultsTabSelected(tab);
  }

  const handleOnHelpClicked = () => {
    setLayersPopupOpen(false);
    setClassificationsModalOpen(true)
  }

  const handleApplyFilters = (e) => {
    if(e) e.preventDefault();
    setUpdateFiltersDate(new Date());
  }

  return (
    <>
      <div id={'speedtest--all-results-page--map-container'}
           ref={mapContainer}
           style={{height: getMapContainerHeight(), margin: 0, position: 'relative', overflowY: 'hidden'}}
      >
        <AutoDetectLocationButton useLocation={useAutoLocate}/>
        <FiltersPanel
          isOpen={filtersPanelOpen}
          togglePanel={toggleFiltersPanel}
          openCalendarModal={() => setCalendarModalOpen(true)}
          applyFilters={handleApplyFilters}
        />
        <ClassificationAndLayersPanel
          isOpen={layersPopupOpen}
          toggleLayersPopup={toggleLayersPopup}
          onHelpClick={handleOnHelpClicked}
        />
        <ResultsTabs filtersPanelOpen={filtersPanelOpen}
          tabSelected={resultsTabSelected}
          onTabChanged={toggleResultsTab}
        />
      </div>
      <CustomModal isOpen={calendarModalOpen}
        closeModal={closeCalendarModal}
        responsive
      >
        <CalendarModal closeModal={closeCalendarModal}/>
      </CustomModal>
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