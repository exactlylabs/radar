import {Filter, Optional} from "../../../utils/types";
import {GeospaceInfo, GeospaceOverview} from "../../../api/geospaces/types";
import L, {LeafletMouseEvent} from "leaflet";
import {useMap} from "react-leaflet";
import {usePrev} from "../../../hooks/usePrev";
import {useEffect, useMemo, useRef} from "react";
import {
  addClickHandler,
  checkZoomControlPosition,
  initializeMap, layerMouseoutHandler, layerMouseoverHandler,
  paintLayer, removeAllFeatureLayers, updateMouseOverHandlers,
} from "../../../utils/map";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import {isIphoneAndSafari} from "../../../utils/iphone";
import {isTouchDevice} from "../../../utils/screen";


interface CustomMapProps {
  selectedGeospace: Optional<GeospaceInfo>;
  selectGeospace: (geospace: GeospaceInfo, newCenter: L.LatLng) => void;
  speedType: string;
  selectedSpeedFilters: Array<string>;
  setZoom: (zoom: number) => void;
  setCenter: (center: Array<number>) => void;
  center: Array<number>;
  zoom: number;
  isRightPanelHidden: boolean;
  lastGeoJSONUpdate: Date;
  dateQueryString?: string;
  vectorTileLayer: any;
}

const CustomMap = ({
  selectedGeospace,
  selectGeospace,
  speedType,
  selectedSpeedFilters,
  setZoom,
  setCenter,
  center,
  zoom,
  isRightPanelHidden,
  lastGeoJSONUpdate,
  dateQueryString,
  vectorTileLayer
}: CustomMapProps): null => {

  const map = useMap();
  // Reference: https://github.com/Leaflet/Leaflet/pull/8109
  // Docs: https://react-leaflet.js.org/docs/api-map/#usemap

  const prevSelectedGeospace = usePrev(selectedGeospace);
  const {isDesktopScreen} = useViewportSizes();
  const isSmallMap = !isDesktopScreen;
  const isTouchRef = useRef(false);

  useEffect(() => {
    initializeMap(map, setZoom, setCenter, isSmallMap);
    isTouchRef.current = isTouchDevice();
  }, []);

  map.setView({lat: center[0], lng: center[1]}, zoom);

  useEffect(() => {
    const selectedGeospaceChanged = (!!prevSelectedGeospace && !!selectedGeospace && (prevSelectedGeospace as GeospaceOverview).geospace.id !== (selectedGeospace as GeospaceOverview).geospace.id);
    const nowThereIsASelectedGeospace = !prevSelectedGeospace && !!selectedGeospace;
    const nowThereIsNoSelectedGeospace = !!prevSelectedGeospace && !selectedGeospace;
    // check to see if we need to re-paint shapes
    if(selectedGeospaceChanged || nowThereIsASelectedGeospace || nowThereIsNoSelectedGeospace) {
      paintLayer(map, vectorTileLayer, selectedGeospace, speedType, selectedSpeedFilters);
      updateMouseOverHandlers(vectorTileLayer, speedType, selectedSpeedFilters, selectedGeospace, isTouchRef.current);
    }
    checkZoomControlPosition(selectedGeospace, isRightPanelHidden);
  }, [selectedGeospace, isRightPanelHidden]);

  useEffect(() => {
    paintLayer(map, vectorTileLayer, selectedGeospace, speedType, selectedSpeedFilters);
  }, [speedType, selectedSpeedFilters, dateQueryString]);

  useEffect(() => {
    if(vectorTileLayer) {
      removeAllFeatureLayers(map);
      vectorTileLayer.bringToFront();
      const clickHandlerFn = (ev: LeafletMouseEvent) => addClickHandler(ev, map, vectorTileLayer, selectGeospace);
      const mouseOverHandlerFn = (ev: LeafletMouseEvent) => layerMouseoverHandler(ev, vectorTileLayer, speedType, selectedSpeedFilters, selectedGeospace);
      const mouseOutHandlerFn = (ev: LeafletMouseEvent) => layerMouseoutHandler(ev, vectorTileLayer, speedType, selectedSpeedFilters, selectedGeospace);
      vectorTileLayer.on('click', clickHandlerFn);
      if(!isTouchRef.current) {
        vectorTileLayer.on('mouseover', mouseOverHandlerFn);
        vectorTileLayer.on('mouseout', mouseOutHandlerFn);
      }
      map.addLayer(vectorTileLayer);
    }
  }, [lastGeoJSONUpdate]);


  return null;
}

export default CustomMap;