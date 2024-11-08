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
import {getMaxCost} from "../../../utils/apiRequests";

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
  const {lastManualMapUpdate, setVisibleIspList, getFiltersAsSearchParams, setMaxPrice, setMaxCost, setCostDistributionList} = useContext(FiltersContext);

  const [ftueModalOpen, setFtueModalOpen] = useState(false);
  const [classificationsModalOpen, setClassificationsModalOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [filtersPanelOpen, setFiltersPanelOpen] = useState(!isSmallSizeScreen);
  const [calendarModalOpen, setCalendarModalOpen] = useState(false);
  const [layersPopupOpen, setLayersPopupOpen] = useState(false);
  const [resultsTabSelected, setResultsTabSelected] = useState(TABS.ALL_RESULTS);
  const [updateFiltersDate, setUpdateFiltersDate] = useState(new Date());
  const [initialLoadFinished, setInitialLoadFinished] = useState(false);

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
      loadLayers('initial');
      setInitialLoadFinished(true);
      getMaxNetworkCost();
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

    map.current.on('sourcedata', (e) => {
      if (e.isSourceLoaded) {
        //check if circle-layer exists in the current map
        let ispMap = new Map();
        let distributions = setCostDistributionList.map(distribution => ({...distribution, count: 0}));
        if (map.current.getLayer('circle-layer')) {
          const features = map.current.queryRenderedFeatures(e.point, {layers: ['circle-layer']});
          features.forEach(feature => {
            if(!!feature.properties.autonomous_system_org_name && feature.properties.autonomous_system_org_name !== '') {
              const { autonomous_system_org_name, autonomous_system_org_id } = feature.properties;
              if (ispMap.has(autonomous_system_org_id)) {
                ispMap.set(autonomous_system_org_id, {label: autonomous_system_org_name, count: ispMap.get(autonomous_system_org_id).count + 1});
              } else {
                ispMap.set(autonomous_system_org_id, {label: autonomous_system_org_name, count: 1});
              }
            }
          });
        }
        setVisibleIspList(ispMap);
        setCostDistributionList(distributions);
      }
    });

    return () => {
      map.current.remove();
    }
  }, []);

  useEffect(() => {
    if(map.current && initialLoadFinished) {
      loadLayers('update');
    }
  }, [updateFiltersDate, lastManualMapUpdate]);

  const getMaxNetworkCost = async () => {
    const { max_cost } = await getMaxCost();
    setMaxCost(max_cost);
    setMaxPrice(max_cost);
    let distribution = [];
    const desiredBarCount = 100;
    const idealStep = max_cost / desiredBarCount;
    for (let i = 0; i <= max_cost; i += idealStep) {
      distribution.push({count: 0, value: i, visible: true});
    }
    setCostDistributionList(distribution);
  }

  const loadLayers = (source) => {
    if(source !== 'initial' && !initialLoadFinished) return;
    if(map.current.getLayer('circle-layer')) {
      map.current.removeLayer('circle-layer');
      map.current.removeSource('custom-tiles');
    }

    //close popup if it's open
    if(popupRef.current) popupRef.current.remove();
    setVisibleIspList(new Map());

    // Add vector tile source and layer here
    map.current.addSource('custom-tiles', {
      type: 'vector',
      tiles: [vectorTilesUrl()],
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
  }

  // Need to append as strings instead of using a native URL object
  // otherwise Maplibre doesn't render the tiles correctly
  const vectorTilesUrl = () => {
    return VECTOR_TILES_URL +
      '?client_id=' + config.clientId + '&' +
      getFiltersAsSearchParams().toString();
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
    e.preventDefault();
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
        <ResultsTabs tabSelected={resultsTabSelected} onTabChanged={toggleResultsTab}  />
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