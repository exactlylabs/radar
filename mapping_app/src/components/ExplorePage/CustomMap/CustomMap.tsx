import {GeoJSONProperties, GeoJSONResponse} from "../../../api/geojson/types";
import {Filter, Optional} from "../../../utils/types";
import {GeospaceInfo, GeospaceOverview} from "../../../api/geospaces/types";
import L, {LeafletMouseEvent, tileLayer} from "leaflet";
import {useMap} from "react-leaflet";
import {usePrev} from "../../../hooks/usePrev";
import {ReactElement, useEffect} from "react";
import {
  addClickHandler, baseStyle, checkZoomControlPosition,
  geoJSONOptions, initializeMap, layerMouseoutHandler, layerMouseoverHandler,
  outlineOnlyStyle,
  paintLayer, removeAllFeatureLayers,
} from "../../../utils/map";
import GeographicalTooltip from "../GeographicalTooltip/GeographicalTooltip";
import ReactDOMServer from "react-dom/server";
import {useViewportSizes} from "../../../hooks/useViewportSizes";
import {getSignalStateDownload, speedColors, SpeedsObject} from "../../../utils/speeds";


interface CustomMapProps {
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

  useEffect(() => {
    initializeMap(map, setZoom, setCenter, isSmallMap);
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
    if(vectorTileLayer) {
      removeAllFeatureLayers(map);
      vectorTileLayer.bringToFront();
      map.addLayer(vectorTileLayer);
      /*vectorTileLayer.on('click', (e: LeafletMouseEvent) => {
        if (e.propagatedFrom.feature) {
          const summary: GeospaceOverview = JSON.parse(e.propagatedFrom.feature.properties.summary) as GeospaceOverview;
          const centroid: Array<number> = summary.geospace.centroid;
          const geospacePosition: L.LatLng = L.latLng(centroid[1], centroid[0]);
          map.flyTo(geospacePosition, 5);
          map.setView(geospacePosition, map.getZoom() > 5 ? map.getZoom() : 5);
          const newStyle = {
            ...baseStyle,
            weight: 3,
            opacity: 0.8,
            fillOpacity: 0.8,
            color: speedColors[getSignalStateDownload(summary.download_median) as keyof SpeedsObject],
            fillColor: speedColors[getSignalStateDownload(summary.download_median) as keyof SpeedsObject]
          };
          vectorTileLayer.setFeatureStyle(summary.geospace.geo_id, newStyle);
        }
      });*/
    }
  }, [lastGeoJSONUpdate]);


  return null;
}

export default CustomMap;