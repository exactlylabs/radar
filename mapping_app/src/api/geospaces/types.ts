import {Optional} from "../../utils/types";

export type Geospace = {
  id: string;
  geo_id: string;
  namespace: number;
  name: string;
  parent: Optional<Geospace>
}

export type GeospacesResult = {
  results: Array<Geospace>;
}

export type PaginationLinks = {
  next: Optional<string>;
  previous: Optional<string>;
}

export type GeospaceSearchResult = {
  _links: PaginationLinks;
  count: number;
  results: Array<Geospace>
}

export type TestScores = {
  bad: number;
  medium: number;
  good: number;
  total_samples: number;
}

export type GeospaceOverview = {
  geospace: Geospace;
  asn: Optional<string>;
  download_median: number;
  upload_median: number;
  latency_median: number;
  download_scores: TestScores;
  upload_scores: TestScores;
}

export type GeospaceAsnResult = {
  id: string;
  asn: string;
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
  const castedObject: GeospaceData = object as GeospaceData;
  return castedObject.geospace_id !== undefined;
}

export type GeospaceInfo = GeospaceData | GeospaceOverview;