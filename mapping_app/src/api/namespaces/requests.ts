import {GeospacesResult} from "../geospaces/types";
import {API_URL} from "../index";

export const getGeospaces = (namespace: string): Promise<GeospacesResult> => {
  return fetch(`${API_URL}/namespaces/${namespace}/geospaces`)
    .then(res => {
      if(!res.ok) throw new Error(res.statusText);
      else return res.json() as Promise<GeospacesResult>;
    })
}