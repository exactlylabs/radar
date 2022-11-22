import {GeoJSON} from "leaflet";
import {GeospaceOverview} from "../geospaces/types";

export type GeoJSONGeometry = {
  type: string;
  coordinates: Array<number>;
}

export type GeoJSONProperties = {
  ID: string;
  GEOID: string;
  summary: GeospaceOverview;
}

export type UnparsedGeoJSONProperties = {
  ID: string;
  GEOID: string;
  summary: string;
}

export type GeoJSONFeature = {
  type: string;
  geometry: GeoJSONGeometry;
  properties: GeoJSONProperties;
}

export type GeoJSONResponse = GeoJSON.FeatureCollection<any>;

export type GeoJSONTimedResponse = {
  data: GeoJSONResponse;
  lastUpdate: Date;
}