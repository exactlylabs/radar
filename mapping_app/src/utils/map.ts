import {Geospace, GeospaceData, GeospaceInfo, GeospaceOverview, isGeospaceData} from "../api/geospaces/types";
import {getSignalStateDownload, getSignalStateUpload, speedColors, SpeedsObject, speedTypes} from "./speeds";
import L, {LatLng, LeafletMouseEvent} from "leaflet";
import {Filter, Optional} from "./types";

export const mapTileUrl: string = MAPBOX_TILESET_URL;
export const mapTileAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Specific coordinates to fallback onto almost center point of the US
export const DEFAULT_FALLBACK_LATITUDE: number = 45.566296;
export const DEFAULT_FALLBACK_LONGITUDE: number = -97.264547;

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
}

export const highlightedStyle = {
  ...baseStyle,
  weight: 2,
  opacity: 0.8,
  fillOpacity: 0.8,
}

/*export const getStyle = (isSelected: boolean, key: string) => {
  return {
    ...baseStyle,
    weight: isSelected ? 3 : baseStyle.weight,
    opacity: isSelected ? 0.8 : baseStyle.opacity,
    fillOpacity: isSelected ? 0.8 : baseStyle.fillOpacity,
    color: speedColors[key as keyof SpeedsObject],
    fillColor: speedColors[key as keyof SpeedsObject]
  }
}*/

export const layerMouseoutHandler = (ev: LeafletMouseEvent, layer: any, selectedGeospace: Optional<GeospaceInfo>) => {
  if(ev.propagatedFrom.feature) {
    const target = ev.propagatedFrom;
    const summary: GeospaceOverview = JSON.parse(target.feature.properties.summary) as GeospaceOverview;
    target.closeTooltip();
    if(!selectedGeospace ||
      (selectedGeospace as GeospaceOverview).geospace.geo_id !== summary.geospace.geo_id) {
      const newStyle = {
        ...baseStyle,
        color: speedColors[getSignalStateDownload(summary.download_median) as keyof SpeedsObject],
        fillColor: speedColors[getSignalStateDownload(summary.download_median) as keyof SpeedsObject]
      };
      layer.setFeatureStyle(summary.geospace.geo_id, newStyle);
    }
  }
}

export const layerMouseoverHandler = (ev: LeafletMouseEvent, layer: any) => {
  if(ev.propagatedFrom.feature) {
    const target = ev.propagatedFrom;
    const summary: GeospaceOverview = JSON.parse(target.feature.properties.summary) as GeospaceOverview;
    const newStyle = {
      ...highlightedStyle,
      color: speedColors[getSignalStateDownload(summary.download_median) as keyof SpeedsObject],
      fillColor: speedColors[getSignalStateDownload(summary.download_median) as keyof SpeedsObject]
    };
    target.closeTooltip();
    target.openTooltip();
    layer.setFeatureStyle(summary.geospace.geo_id, newStyle);
  }
}

export const shouldShowLayer = (
  summary: GeospaceOverview,
  speedType: Filter,
  selectedFilters: Array<Filter>
): boolean => {
  const {download_median, upload_median} = summary;
  return speedType === 'Download' ?
    selectedFilters.includes(getSignalStateDownload(download_median)) :
    selectedFilters.includes(getSignalStateUpload(upload_median));
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

export const getCoordinates = (geometry: any): LatLng => {
  if(geometry.type === 'Polygon') {
    return {lng: geometry.coordinates[0][0][0], lat: geometry.coordinates[0][0][1]} as LatLng;
  } else {
    return {lng: geometry.coordinates[0][0][0][0], lat: geometry.coordinates[0][0][0][1]} as LatLng;
  }
}