import {GeoJSONProperties, GeoJSONResponse} from "../../../api/geojson/types";
import {Filter, Optional} from "../../../utils/types";
import {GeospaceInfo, GeospaceOverview} from "../../../api/geospaces/types";
import L from "leaflet";
import {useMap} from "react-leaflet";
import {usePrev} from "../../../hooks/usePrev";
import {ReactElement, useEffect} from "react";
import {
  addClickHandler, checkZoomControlPosition,
  geoJSONOptions, initializeMap,
  outlineOnlyStyle,
  paintLayer, removeAllFeatureLayers,
} from "../../../utils/map";
import GeographicalTooltip from "../GeographicalTooltip/GeographicalTooltip";
import ReactDOMServer from "react-dom/server";
import {useViewportSizes} from "../../../hooks/useViewportSizes";


interface CustomMapProps {
  geoJSON: GeoJSONResponse;
  selectedGeospace: Optional<GeospaceInfo>;
  selectGeospace: (geospace: GeospaceInfo, newCenter: L.LatLng) => void;
  speedType: Filter;
  selectedSpeedFilters: Array<Filter>;
  setZoom: (zoom: number) => void;
  setCenter: (center: Array<number>) => void;
  center: Array<number>;
  zoom: number;
  isRightPanelHidden: boolean;
  lastGeoJSONUpdate: Date;
  dateQueryString?: string;
}

const CustomMap = ({
  geoJSON,
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
  dateQueryString
}: CustomMapProps): null => {

  const map = useMap();
  // Reference: https://github.com/Leaflet/Leaflet/pull/8109
  // Docs: https://react-leaflet.js.org/docs/api-map/#usemap

  const prevSelectedGeospace = usePrev(selectedGeospace);
  const {isSmallerThanMid} = useViewportSizes();

  useEffect(() => {
    initializeMap(map, setZoom, setCenter, isSmallerThanMid);
  }, []);

  map.setView({lat: center[0], lng: center[1]}, zoom);

  useEffect(() => {
    const selectedGeospaceChanged = (!!prevSelectedGeospace && !!selectedGeospace && (prevSelectedGeospace as GeospaceOverview).geospace.id !== (selectedGeospace as GeospaceOverview).geospace.id);
    const nowThereIsASelectedGeospace = !prevSelectedGeospace && !!selectedGeospace;
    const nowThereIsNoSelectedGeospace = !!prevSelectedGeospace && !selectedGeospace;
    // check to see if we need to re-paint shapes
    if(selectedGeospaceChanged || nowThereIsASelectedGeospace || nowThereIsNoSelectedGeospace) {
      map.eachLayer((layer: any) => { paintLayer(layer, selectedGeospace, speedType, selectedSpeedFilters); });
    }
    checkZoomControlPosition(selectedGeospace, isRightPanelHidden);
  }, [selectedGeospace, isRightPanelHidden]);

  useEffect(() => {
    map.eachLayer((layer: any) => { paintLayer(layer, selectedGeospace, speedType, selectedSpeedFilters); });
  }, [speedType, selectedSpeedFilters, dateQueryString]);

  useEffect(() => {
    removeAllFeatureLayers(map);
    L.geoJSON(geoJSON, geoJSONOptions)
     .eachLayer((layer: any) => {
       paintLayer(layer, selectedGeospace, speedType, selectedSpeedFilters);
       if(layer.feature) {
         const properties: GeoJSONProperties = layer.feature.properties as GeoJSONProperties;
         if(properties.summary !== undefined) {
           addClickHandler(layer, properties, selectGeospace);
           const geospace: GeospaceOverview = properties.summary as GeospaceOverview;
           const tooltip: ReactElement = <GeographicalTooltip geospace={geospace} speedType={speedType as string}/>;
           layer.bindTooltip(ReactDOMServer.renderToString(tooltip), {sticky: true, direction: 'center'});
         } else {
           layer.setStyle(outlineOnlyStyle);
         }
       }
     })
     .addTo(map);
  }, [lastGeoJSONUpdate]);


  return null;
}

export default CustomMap;