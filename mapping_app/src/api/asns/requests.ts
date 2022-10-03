import {AsnsResponse} from "./types";
import {API_URL} from "../index";

export const getAsns = (query?: string, offset: number = 0): Promise<AsnsResponse> => {
  let queryParams: string = '';
  if(query) queryParams += `&query=${query}`;
  if(offset) queryParams += `&offset=${offset}`;
  return fetch(`${API_URL}/asns?limit=10${queryParams}`)
    .then(res => {
      if(!res.ok) throw new Error(res.statusText);
      else return res.json() as Promise<AsnsResponse>;
    });
}