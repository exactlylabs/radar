import {Geospace, GeospaceData, GeospaceInfo, GeospaceOverview, isGeospaceData} from "../api/geospaces/types";
import {getSignalStateDownload, getSignalStateUpload} from "./speeds";
import {LatLng} from "leaflet";

export const mapTileUrl: string = MAPBOX_TILESET_URL;
export const mapTileAttribution =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

// Specific coordinates to fallback onto almost center point of the US
export const DEFAULT_FALLBACK_LATITUDE: number = 40.566296;
export const DEFAULT_FALLBACK_LONGITUDE: number = -97.264547;

export const shouldShowLayer = (
  summary: GeospaceOverview,
  speedType: string,
  selectedFilters: Array<string>
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