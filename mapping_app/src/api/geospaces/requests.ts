import {GeospaceOverview, GeospaceSearchResult} from "./types";
import {API_URL, throwError} from "../index";

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

export const getOverview = (geospaceId: string, filters: string): Promise<GeospaceOverview> => {
  return fetch(`${API_URL}/geospaces/${geospaceId}/overview?${filters}`)
    .then(res => {
      if(!res.ok) return throwError(res);
      else return res.json() as Promise<GeospaceOverview>;
    })
}