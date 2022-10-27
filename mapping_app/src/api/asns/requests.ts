import {AsnsResponse} from "./types";
import {API_URL, throwError} from "../index";

export const getAsns = (query?: string): Promise<AsnsResponse> => {
  let queryParams: string = '';
  if(query) queryParams += `?query=${query}`;
  return fetch(`${API_URL}/asns${queryParams}`)
    .then((res: Response) => {
      if(!res.ok) return throwError(res);
      else return res.json() as Promise<AsnsResponse>;
    });
}

export const getAsnsFromUrl = (url: string): Promise<AsnsResponse> => {
  return fetch(url)
    .then(res => {
      if(!res.ok) return throwError(res);
      else return res.json() as Promise<AsnsResponse>;
    });
}

export const getAsnsForGeospace = (geospaceId: string, query?: string): Promise<AsnsResponse> => {
  let queryParams: string = '';
  if(query) queryParams += `?query=${query}`;
  return fetch(`${API_URL}/geospaces/${geospaceId}/asns${queryParams}`)
    .then(res => {
      if(!res.ok) return throwError(res);
      else return res.json() as Promise<AsnsResponse>;
    })
}