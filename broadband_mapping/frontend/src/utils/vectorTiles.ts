import {featureStyleHandler, getFeatureIdHandler} from "./map";
import {GeospaceInfo} from "../api/geospaces/types";
import {Optional} from "./types";

export const getVectorTileOptions =
  (selectedGeospace: Optional<GeospaceInfo>, speedType: string, selectedSpeedFilters: Array<string>) => ({
    style: (feature: any) => featureStyleHandler(feature, selectedGeospace, speedType, selectedSpeedFilters),
    getFeatureId: getFeatureIdHandler,
  });