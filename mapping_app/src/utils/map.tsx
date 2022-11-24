import {Geospace, GeospaceData, GeospaceInfo, GeospaceOverview, isGeospaceData} from "../api/geospaces/types";
import {
  getSignalState,
  getSignalStateDownload,
  getSignalStateUpload,
  speedColors,
  SpeedsObject,
  speedTypes
} from "./speeds";
import L, {LatLng, LeafletMouseEvent, PathOptions, TileLayer} from "leaflet";
import {Filter, Optional} from "./types";
import {BLACK, OUTLINE_ONLY_SHAPE_COLOR, OUTLINE_ONLY_SHAPE_FILL, TRANSPARENT} from "../styles/colors";
import {GeoJSONProperties, UnparsedGeoJSONProperties} from "../api/geojson/types";
import {speedFilters} from "./filters";
import {ReactElement} from "react";
import GeographicalTooltip from "../components/ExplorePage/GeographicalTooltip/GeographicalTooltip";
import ReactDOMServer from "react-dom/server";

export const mapTileUrl: string = MAPBOX_TILESET_URL;
export const mapTileAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Specific coordinates to fallback onto almost center point of the US
export const DEFAULT_FALLBACK_LATITUDE: number = 45.566296;
export const DEFAULT_FALLBACK_LONGITUDE: number = -97.264547;
const MIN_ZOOM = 3;

export const baseStyle = {
  stroke: true,
  fill: true,
  opacity: 0.5,
  fillOpacity: 0.5,
  weight: 1,
  color: speedColors[speedTypes.UNSERVED as keyof SpeedsObject],
  fillColor: speedColors[speedTypes.UNSERVED as keyof SpeedsObject],
};

export const outlineOnlyStyle = {
  ...baseStyle,
  color: OUTLINE_ONLY_SHAPE_COLOR,
  fillColor: OUTLINE_ONLY_SHAPE_FILL,
}

export const getVectorTileOptions =
  (selectedGeospace: Optional<GeospaceInfo>, speedType: Filter, selectedSpeedFilters: Array<Filter>) => ({
  style: (feature: any) => featureStyleHandler(feature, selectedGeospace, speedType, selectedSpeedFilters),
  getFeatureId: getFeatureIdHandler,
});

export const getStyle = (isSelected: boolean, key: string, shouldFill: boolean) => {
  if(!shouldFill) {
    return {
      ...outlineOnlyStyle,
      weight: isSelected ? 3 : outlineOnlyStyle.weight,
      opacity: isSelected ? 0.8 : outlineOnlyStyle.opacity,
      fillOpacity: isSelected ? 0.8 : outlineOnlyStyle.fillOpacity,
    }
  } else {
    return {
      ...baseStyle,
      weight: isSelected ? 3 : baseStyle.weight,
      opacity: isSelected ? 0.8 : baseStyle.opacity,
      fillOpacity: isSelected ? 0.8 : baseStyle.fillOpacity,
      color: speedColors[key as keyof SpeedsObject],
      fillColor: speedColors[key as keyof SpeedsObject]
    }
  }
}

export const layerMouseoutHandler = (ev: LeafletMouseEvent, layer: any, speedType: Filter, selectedSpeedFilters: Array<Filter>, selectedGeospace: Optional<GeospaceInfo>) => {
  const summary: GeospaceOverview = JSON.parse(ev.propagatedFrom.feature.properties.summary) as GeospaceOverview;
  layer.setStyle((feature: any) => feature && mouseOutFeatureStyleHandler(feature, summary, selectedGeospace, speedType, selectedSpeedFilters));
}

export const layerMouseoverHandler = (ev: LeafletMouseEvent, layer: any, speedType: Filter, selectedSpeedFilters: Array<Filter>, selectedGeospace: Optional<GeospaceInfo>) => {
  const summary: GeospaceOverview = JSON.parse(ev.propagatedFrom.feature.properties.summary) as GeospaceOverview;
  layer.setStyle((feature: any) => feature && mouseOverFeatureStyleHandler(layer, feature, summary, selectedGeospace, speedType, selectedSpeedFilters));
}

export const shouldShowLayer = (
  summary: GeospaceOverview,
  speedType: Filter,
  selectedFilters: Array<Filter>
): boolean => {
  if(!summary) return false;
  const {download_median, upload_median, download_scores, upload_scores} = summary;
  if(download_scores.total_samples === 0 && upload_scores.total_samples === 0)
    return false;
  if(speedType === speedFilters[0]) {
    return download_scores.total_samples > 0 && selectedFilters.includes(getSignalStateDownload(download_median));
  } else {
    return upload_scores.total_samples > 0 && selectedFilters.includes(getSignalStateUpload(upload_median));
  }
}

export const isCurrentGeospace = (geospace: Geospace, selectedGeospace: GeospaceInfo): boolean => {
  if(isGeospaceData(selectedGeospace)) {
    return (selectedGeospace as GeospaceData).geospace_id === geospace.id;
  } else {
    const isGeospaceInView: boolean = selectedGeospace.geospace.id === geospace.id;
    const isParentInView: boolean = !!selectedGeospace.geospace.parent && selectedGeospace.geospace.parent.id === geospace.id
    return isGeospaceInView || isParentInView;
  }
}

export const parseStringIntoCorrectNumber = (stringId: string): string => {
  if(!stringId.includes('0') || stringId.indexOf('0') > 0) return stringId;
  return stringId.substring(1);
}

export const paintLayer = (map: L.Map, layer: any, selectedGeospace: Optional<GeospaceInfo>, speedType: Filter, selectedSpeedFilters: Array<Filter>) => {
  // specific property that only the vector-tile-layer has
  if(!!layer && map.hasLayer(layer) && !!layer.getFeatureStyle) {
    layer.setStyle((feature: any) => feature && featureStyleHandler(feature, selectedGeospace, speedType, selectedSpeedFilters));
  }
}

export const featureStyleHandler = (feature: any, selectedGeospace: Optional<GeospaceInfo>, speedType: Filter, selectedSpeedFilters: Array<Filter>) => {
  let style;
  const properties = feature.properties as UnparsedGeoJSONProperties;
  if (properties.summary !== undefined) {
    const summary: GeospaceOverview = JSON.parse(properties.summary) as GeospaceOverview;
    const isSelected: boolean = !!selectedGeospace && isCurrentGeospace(summary.geospace, selectedGeospace);
    const median: number = speedType === speedFilters[0] ? summary.download_median : summary.upload_median;
    const key: string = getSignalState(speedType as string, median);
    const shouldColorFill: boolean = shouldShowLayer(summary, speedType, selectedSpeedFilters);
    style = getStyle(isSelected, key, shouldColorFill);
  }
  return style;
}

export const mouseOverFeatureStyleHandler = (layer: any, feature: any, mouseOverGeospace: GeospaceOverview, selectedGeospace: Optional<GeospaceInfo>, speedType: Filter, selectedSpeedFilters: Array<Filter>) => {
  const currentFeatureProperties = feature.properties as UnparsedGeoJSONProperties;
  if(currentFeatureProperties?.summary !== undefined) {
    const currentFeatureSummary: GeospaceOverview = JSON.parse(currentFeatureProperties.summary) as GeospaceOverview;
    const isCurrentFeature: boolean = isCurrentGeospace(currentFeatureSummary.geospace, mouseOverGeospace);
    const isAlreadyTheSelectedGeospace: boolean = !!selectedGeospace && isCurrentGeospace(currentFeatureSummary.geospace, selectedGeospace);
    const median: number = speedType === speedFilters[0] ? currentFeatureSummary.download_median : currentFeatureSummary.upload_median;
    const key: string = getSignalState(speedType as string, median);
    const shouldColorFill: boolean = shouldShowLayer(currentFeatureSummary, speedType, selectedSpeedFilters);
    if(isCurrentFeature) {
      const tooltip: ReactElement = <GeographicalTooltip geospace={currentFeatureSummary} speedType={speedType as string}/>;
      const latlng: LatLng = L.latLng(currentFeatureSummary.geospace.centroid[0], currentFeatureSummary.geospace.centroid[1]);
      layer.bindTooltip(ReactDOMServer.renderToString(tooltip), {sticky: true, direction: 'center'}).openTooltip(latlng);
    }
    return getStyle(isCurrentFeature || isAlreadyTheSelectedGeospace, key, shouldColorFill);
  }
  return undefined;
}

export const mouseOutFeatureStyleHandler = (feature: any, mouseOutGeospace: GeospaceOverview, selectedGeospace: Optional<GeospaceInfo>, speedType: Filter, selectedSpeedFilters: Array<Filter>) => {
  const currentFeatureProperties = feature.properties as UnparsedGeoJSONProperties;
  if(currentFeatureProperties?.summary !== undefined) {
    const currentFeatureSummary: GeospaceOverview = JSON.parse(currentFeatureProperties.summary) as GeospaceOverview;
    const isAlreadyTheSelectedGeospace: boolean = !!selectedGeospace && isCurrentGeospace(currentFeatureSummary.geospace, selectedGeospace);
    const median: number = speedType === speedFilters[0] ? currentFeatureSummary.download_median : currentFeatureSummary.upload_median;
    const key: string = getSignalState(speedType as string, median);
    const shouldColorFill: boolean = shouldShowLayer(currentFeatureSummary, speedType, selectedSpeedFilters);
    return getStyle(isAlreadyTheSelectedGeospace, key, shouldColorFill);
  }
  return undefined;
}

export const updateMouseOverHandlers = (vectorTileLayer: any, speedType: Filter, selectedSpeedFilters: Array<Filter>, selectedGeospace: Optional<GeospaceInfo>) => {
  const mouseOverFn = (ev: LeafletMouseEvent) => layerMouseoverHandler(ev, vectorTileLayer, speedType, selectedSpeedFilters, selectedGeospace);
  const mouseOutFn = (ev: LeafletMouseEvent) => layerMouseoutHandler(ev, vectorTileLayer, speedType, selectedSpeedFilters, selectedGeospace);
  vectorTileLayer.off('mouseout', mouseOutFn);
  vectorTileLayer.off('mouseover', mouseOverFn);
  vectorTileLayer.on('mouseout', mouseOutFn);
  vectorTileLayer.on('mouseover', mouseOverFn);
}

export const getFeatureIdHandler = (feature: any) => {
  if(feature.properties?.summary !== undefined) {
    const summary: GeospaceOverview = JSON.parse(feature.properties.summary) as GeospaceOverview;
    return parseStringIntoCorrectNumber(summary.geospace.geo_id);
  } else {
    return '';
  }
}

export const initializeMap = (map: L.Map, setZoom: (newZoom: number) => void, setCenter: (newCenter: Array<number>) => void, withNoZoomControl: boolean) => {
  map.attributionControl.setPrefix('');
  map.setMinZoom(MIN_ZOOM);
  map.addLayer(new TileLayer(mapTileUrl, {attribution: mapTileAttribution}));
  if(withNoZoomControl) {
    map.zoomControl.remove();
  } else {
    map.zoomControl.setPosition('bottomright');
  }
  map.on('zoomend', () => {
    const center: L.LatLng = map.getCenter();
    setZoom(map.getZoom());
    setCenter([center.lat, center.lng]);
  });
  map.on('dragend', () => {
    const center: L.LatLng = map.getCenter();
    setCenter([center.lat, center.lng]);
  });
}

export const addClickHandler = (ev: LeafletMouseEvent, map: L.Map, layer: any, selectGeospace: (geospace: GeospaceInfo, newCenter: L.LatLng) => void) => {
  if (ev.propagatedFrom.feature) {
    const summary: GeospaceOverview = JSON.parse(ev.propagatedFrom.feature.properties.summary) as GeospaceOverview;
    const centroid: Array<number> = summary.geospace.centroid;
    const geospacePosition: L.LatLng = L.latLng(centroid[0], centroid[1]);
    if (summary.geospace.name === 'Alaska') {
      // TODO: quick fix for Alaskan center wrongly calculated. From the internet, Alaska's center is at 64.2008° N, 149.4937° W
      const center: L.LatLng = L.latLng(64.2008, -149.4937);
      selectGeospace(summary, center);
    } else {
      selectGeospace(summary, geospacePosition);
    }
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
    //layer.setFeatureStyle(parseInt(summary.geospace.geo_id), newStyle);
  }
}

export const removeAllFeatureLayers = (map: L.Map) => {
  map.eachLayer((layer: any) => {
    if(!layer._url && !layer._loading) {
      layer.remove();
    }
  });
}

export const checkZoomControlPosition = (selectedGeospace: Optional<GeospaceInfo>, isRightPanelHidden: boolean) => {
  const zoomControlElements: HTMLCollection = document.getElementsByClassName('leaflet-control-zoom');
  if(zoomControlElements.length > 0) {
    const firstElement: Element | null = zoomControlElements.item(0);
    // doing 2 line condition to prevent Typescript error
    if (firstElement) {
      if (!!selectedGeospace && !isRightPanelHidden) {
        firstElement.classList.add('leaflet-control-zoom-custom-position');
      } else {
        firstElement.classList.remove('leaflet-control-zoom-custom-position');
      }
    }
  }
}