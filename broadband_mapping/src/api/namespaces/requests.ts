import {GeospacesResult} from "../geospaces/types";
import {API_URL, throwError} from "../index";

export const getGeospaces = (namespace: string): Promise<GeospacesResult> => {
  return fetch(`${API_URL}/namespaces/${namespace}/geospaces`)
    .then(res => {
      if(!res.ok) return throwError(res);
      else return res.json() as Promise<GeospacesResult>;
    })
}