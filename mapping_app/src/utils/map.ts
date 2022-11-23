import {Geospace, GeospaceData, GeospaceInfo, GeospaceOverview, isGeospaceData} from "../api/geospaces/types";
import {
  getSignalState,
  getSignalStateDownload,
  getSignalStateUpload,
  speedColors,
  SpeedsObject,
  speedTypes
} from "./speeds";
import L, {LeafletMouseEvent, TileLayer} from "leaflet";
import {Filter, Optional} from "./types";
import {BLACK, OUTLINE_ONLY_SHAPE_COLOR, OUTLINE_ONLY_SHAPE_FILL, TRANSPARENT} from "../styles/colors";
import {GeoJSONProperties, UnparsedGeoJSONProperties} from "../api/geojson/types";
import {speedFilters} from "./filters";

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

export const invisibleStyle = {
  ...baseStyle,
  opacity: 0,
  fillOpacity: 0,
  color: TRANSPARENT,
  fillColor: TRANSPARENT,
}

export const outlineOnlyStyle = {
  ...baseStyle,
  color: OUTLINE_ONLY_SHAPE_COLOR,
  fillColor: OUTLINE_ONLY_SHAPE_FILL,
}

export const geoJSONOptions: L.GeoJSONOptions = {
  style: (feature) => {
    let style = baseStyle;
    if (feature) {
      const properties: GeoJSONProperties = feature.properties as GeoJSONProperties;
      if (properties.summary !== undefined) {
        style = {
          ...style,
          color: speedColors[getSignalStateDownload(properties.summary.download_median) as keyof SpeedsObject],
          fillColor: speedColors[getSignalStateDownload(properties.summary.download_median) as keyof SpeedsObject]
        }
      }
    }
    return style;
  }
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

export const layerMouseoutHandler = (ev: LeafletMouseEvent) => {
  let target = ev.propagatedFrom.feature;
  //target.closeTooltip();
  target.setStyle({weight: 1, opacity: 0.5, fillOpacity: 0.5});
}

export const layerMouseoverHandler = (ev: LeafletMouseEvent, layer: any) => {
  let target = ev.propagatedFrom.feature as UnparsedGeoJSONProperties;
  layer.setFeatureStyle(target.GEOID, {weight: 3, opacity: 0.8, fillOpacity: 0.8})
  //target.openTooltip();
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
    updateMouseHandlersForLayer(layer);
  }
}

const updateMouseHandlersForLayer = (layer: any) => {
  const mouseOverFn = (ev: LeafletMouseEvent) => layerMouseoverHandler(ev, layer);
  layer.removeEventListener('mouseout', layerMouseoutHandler);
  layer.removeEventListener('mouseover', mouseOverFn);
  layer.addEventListener('mouseout', layerMouseoutHandler);
  layer.addEventListener('mouseover', mouseOverFn);
}

export const featureStyleHandler = (feature: any, selectedGeospace: Optional<GeospaceInfo>, speedType: Filter, selectedSpeedFilters: Array<Filter>) => {
  let style;
  const properties = feature.properties as UnparsedGeoJSONProperties;
  if (properties.summary !== undefined) {
    const summary: GeospaceOverview = JSON.parse(properties.summary) as GeospaceOverview;
    const isSelected: boolean = !!selectedGeospace && isCurrentGeospace(summary.geospace, selectedGeospace);
    const median: number = speedType === speedFilters[0] ? summary.download_median : summary.upload_median;
    const key: string = getSignalState(speedType as string, median);
    const shouldColorFill = shouldShowLayer(summary, speedType, selectedSpeedFilters);
    style = getStyle(isSelected, key, shouldColorFill);
  }
  return style;
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

export const addClickHandler = (layer: any, properties: GeoJSONProperties, selectGeospace: (geospace: GeospaceInfo, newCenter: L.LatLng) => void) => {
  layer.addEventListener('click', () => {
    if (properties.summary.geospace.name === 'Alaska') {
      // TODO: quick fix for Alaskan center wrongly calculated. From the internet, Alaska's center is at 64.2008° N, 149.4937° W
      const center: L.LatLng = L.latLng(64.2008, -149.4937);
      selectGeospace(layer.feature.properties.summary, center);
    } else {
      selectGeospace(layer.feature.properties.summary, layer.getBounds().getCenter());
    }
  });
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