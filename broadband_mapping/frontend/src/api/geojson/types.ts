import {GeoJSON} from "leaflet";
import {GeospaceOverview} from "../geospaces/types";
import {Asn} from "../asns/types";

export type GeoJSONProperties = {
  ID: string;
  GEOID: string;
  summary: GeospaceOverview;
}

export type GeoJSONResponse = GeoJSON.FeatureCollection<any>;

export type GeoJSONFilters = {
  speedType: string;
  calendar: string;
  provider: Asn;
}

export const emptyGeoJSONFilters: GeoJSONFilters = {
  speedType: '',
  calendar: '',
  provider: {
    id: '',
    asn: '',
    organization: 'All providers'
  }
}

export type GeoJSONTimedResponse = {
  data: GeoJSONResponse;
  lastUpdate: Date;
}

export type UnparsedGeoJSONProperties = {
  ID: string;
  GEOID: string;
  summary: string;
}