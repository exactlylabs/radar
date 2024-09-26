import {API_URL} from "../constants";
import {
  DEFAULT_DOWNLOAD_FILTER_HIGH,
  DEFAULT_DOWNLOAD_FILTER_LOW,
  DEFAULT_DOWNLOAD_FILTER_MID,
  DEFAULT_DOWNLOAD_FILTER_NONE
} from "./colors";

export const VECTOR_TILES_URL = `${API_URL}/tiles/{z}/{x}/{y}`;

const TEST_CONDITIONS = {
  UNSERVED: 0,
  UNDERSERVED: 1,
  SERVED: 2,
};

const COLORS_BY_CONDITION = {
  0: DEFAULT_DOWNLOAD_FILTER_LOW,
  1: DEFAULT_DOWNLOAD_FILTER_MID,
  2: DEFAULT_DOWNLOAD_FILTER_HIGH
};

export const vectorTileOptions = {
  minZoom: 2.5,
  noWrap: true,
  interactive: true,
  vectorTileLayerStyles: {
    tests: function (properties, zoom) {
      const { download_avg, upload_avg } = properties;

      return {
        radius: getRadius(zoom),
        color: getTestColor(download_avg, upload_avg),
        fillColor: getTestColor(download_avg, upload_avg),
        fillOpacity: 0.7,
        fill: true
      };
    }
  },
  getFeatureId: function (feature) {
    return feature.id;
  }
}

export function getTestColor(downloadAvg, uploadAvg) {
  if(!downloadAvg || !uploadAvg) return DEFAULT_DOWNLOAD_FILTER_NONE;
  let downloadTestCondition;
  let uploadTestCondition;

  if (downloadAvg <= 25) downloadTestCondition = TEST_CONDITIONS.UNSERVED;
  else if (downloadAvg <= 100) downloadTestCondition = TEST_CONDITIONS.UNDERSERVED;
  else downloadTestCondition = TEST_CONDITIONS.SERVED;

  if (uploadAvg <= 3) uploadTestCondition = TEST_CONDITIONS.UNSERVED;
  else if (uploadAvg <= 20) uploadTestCondition = TEST_CONDITIONS.UNDERSERVED;
  else uploadTestCondition = TEST_CONDITIONS.SERVED;

  return COLORS_BY_CONDITION[Math.min(downloadTestCondition, uploadTestCondition)];
}

export function getRadius(zoom) {
  if (zoom < 5) return 5;
  else if (zoom < 18) return 8;
  else return 12;
}

export function patchVectorLayer(baseLayer) {
  baseLayer._createLayer_orig = baseLayer._createLayer;
  baseLayer._createLayer = function (feature, pxPerExtent, layerStyle) {
    const layer = this._createLayer_orig(feature, pxPerExtent, layerStyle);
    switch (feature.type) {
      case 1:
        layer.getLatLng = null;
        break;
      default:
        break;
    }
    return layer;
  };
  return baseLayer;
}