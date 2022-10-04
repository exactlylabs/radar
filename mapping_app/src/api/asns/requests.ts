import {AsnsResponse} from "./types";
import {API_URL} from "../index";

export const getAsns = (query?: string): Promise<AsnsResponse> => {
  let queryParams: string = '';
  if(query) queryParams += `query=${query}`;
  return fetch(`${API_URL}/asns?${queryParams}`)
    .then(res => {
      if(!res.ok) throw new Error(res.statusText);
      else return res.json() as Promise<AsnsResponse>;
    });
}

export const getAsnsFromUrl = (url: string): Promise<AsnsResponse> => {
  return fetch(url)
    .then(res => {
      if(!res.ok) throw new Error(res.statusText);
      else return res.json() as Promise<AsnsResponse>;
    });
}