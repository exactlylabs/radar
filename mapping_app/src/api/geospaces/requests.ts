import {GeospaceOverview, GeospaceSearchResult} from "./types";
import {API_URL, throwError} from "../index";
import {GeoJSONFilters} from "../geojson/types";
import {getFiltersString} from "../utils/filters";

export const getGeospaces = (query: string, limit?: number, offset?: number): Promise<GeospaceSearchResult> => {
  let limitString: string = '';
  let offsetString: string = '';
  if(limit) limitString = `&limit=${limit}`;
  if(offset) offsetString = `&offset=${offset}`;
  return fetch(`${API_URL}/geospaces?query=${query}${limitString}${offsetString}`)
    .then(res => {
      if(!res.ok) return throwError(res);
      else return res.json() as Promise<GeospaceSearchResult>;
    })
}

export const getOverview = (geospaceId: string, filters: GeoJSONFilters): Promise<GeospaceOverview> => {
  const filtersString: string = getFiltersString(filters);
  return fetch(`${API_URL}/geospaces/${geospaceId}/overview?${filtersString}`)
    .then(res => {
      if(!res.ok) return throwError(res);
      else return res.json() as Promise<GeospaceOverview>;
    })
}