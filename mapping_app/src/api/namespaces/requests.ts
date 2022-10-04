import {GeospacesResponse} from "../geospaces/types";
import {API_URL} from "../index";

export const getGeospaces = (namespace: string): Promise<GeospacesResponse> => {
  return fetch(`${API_URL}/namespaces/${namespace}/geospaces`)
    .then(res => {
      if(!res.ok) throw new Error(res.statusText);
      else return res.json() as Promise<GeospacesResponse>;
    })
}

export const vectorTilesUrl = (namespace: string = 'states') => `${API_URL}/namespaces/${namespace}/tiles/{z}/{x}/{y}`;