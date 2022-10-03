import {GeoJSON} from "leaflet";
import {GeospaceOverview} from "../geospaces/types";

export type GeoJSONGeometry = {
  type: string;
  coordinates: Array<number>;
}

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

export type GeoJSONFeature = {
  type: string;
  geometry: GeoJSONGeometry;
  properties: GeoJSONProperties;
}

export type GeoJSONResponse = GeoJSON.FeatureCollection<any>;