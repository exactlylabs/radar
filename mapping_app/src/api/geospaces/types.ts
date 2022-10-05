import {Optional} from "../../utils/types";
import {PaginatedResponse, PaginationLinks} from "../index";

export type DetailedGeospace = {
  id: string;
  geo_id: string;
  namespace: number;
  name: string;
  parent: Optional<Geospace>;
}

export type Geospace = {
  id: string;
  geo_id: string;
  namespace: number;
  name: string;
  parent_id: Optional<string>;
}

export type GeospacesResult = {
  results: Array<DetailedGeospace>;
}

export type GeospaceSearchResult = PaginatedResponse<DetailedGeospace>;

export type TestScores = {
  bad: number;
  medium: number;
  good: number;
  total_samples: number;
}

export type GeospaceOverview = {
  geospace: DetailedGeospace;
  asn: Optional<string>;
  download_median: number;
  upload_median: number;
  latency_median: number;
  download_scores: TestScores;
  upload_scores: TestScores;
}

export type GeospaceAsnResult = {
  id: string;
  organization: string;
}

export type GeospaceAsnResponse = {
  results: Array<GeospaceAsnResult>;
}

export type GeospaceData = {
  postcode_geospace_id: Optional<string>;
  postcode: Optional<string>;
  county_geospace_id: Optional<string>;
  county: Optional<string>;
  state_geospace_id: Optional<string>;
  state: Optional<string>;
  city: Optional<string>;
  display_name: string;
  geospace_id?: Optional<string>;
  asn_id?: Optional<string>;
  download_median: number;
  upload_median: number;
  latency_median: number;
  upload_scores: TestScores;
  download_scores: TestScores;
}

export const isGeospaceData = (object: any): object is GeospaceData => {
  if(!object) return false;
  const castedObject: GeospaceData = object as GeospaceData;
  return !!castedObject.geospace_id;
}

export const isGeospaceOverview = (object: any): object is GeospaceOverview => {
  if(!object) return false;
  const castedObject: GeospaceOverview = object as GeospaceOverview;
  return !!castedObject.geospace;
}

export const isGeospaceOverview = (object: any): object is GeospaceOverview => {
  if(!object) return false;
  const castedObject: GeospaceOverview = object as GeospaceOverview;
  return !!castedObject.geospace;
}

export type GeospaceInfo = GeospaceData | GeospaceOverview;