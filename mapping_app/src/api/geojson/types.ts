import {GeoJSON} from "leaflet";
import {GeospaceOverview} from "../geospaces/types";

export type GeoJSONProperties = {
  AFFGEOID: string;
  ALAND: number;
  AWATER: number;
  GEOID: string;
  LSAD: string;
  NAME: string;
  STATEFP: string;
  STATENS: string;
  STUSPS: string;
  summary: GeospaceOverview;
}

export type GeoJSONResponse = GeoJSON.FeatureCollection<any>;