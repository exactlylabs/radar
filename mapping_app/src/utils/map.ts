import {Geospace, GeospaceData, GeospaceInfo, GeospaceOverview, isGeospaceData} from "../api/geospaces/types";
import {getSignalStateDownload, getSignalStateUpload, speedColors, SpeedsObject, speedTypes} from "./speeds";
import {LeafletMouseEvent} from "leaflet";
import {Filter} from "./types";
import {BLACK, DEFAULT_GREEN, OUTLINE_ONLY_SHAPE_COLOR, OUTLINE_ONLY_SHAPE_FILL, TRANSPARENT} from "../styles/colors";

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
  color: TRANSPARENT,
  fillColor: TRANSPARENT,
}

export const outlineOnlyStyle = {
  ...baseStyle,
  color: OUTLINE_ONLY_SHAPE_COLOR,
  fillColor: OUTLINE_ONLY_SHAPE_FILL,
}

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
  let target = ev.target;
  //target.closeTooltip();
  target.setStyle({weight: 1, opacity: 0.5, fillOpacity: 0.5});
}

export const layerMouseoverHandler = (ev: LeafletMouseEvent) => {
  let target = ev.target;
  target.setStyle({weight: 3, opacity: 0.8, fillOpacity: 0.8});
  //target.closeTooltip();
  target.openTooltip();
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
  if(speedType === 'Download') {
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