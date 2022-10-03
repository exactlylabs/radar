import {GeoJSONResponse} from "./types";
import {API_URL} from "../index";

export const getGeoJSON = (namespace: string = 'states'): Promise<GeoJSONResponse> => {
  return fetch(`${API_URL}/geojson?namespace=${namespace}`)
    .then(res => {
      if(!res.ok) throw new Error(res.statusText);
      else return res.json() as Promise<GeoJSONResponse>;
    })
}