import {GeoJSONFilters, GeoJSONResponse} from "./types";
import {API_URL} from "../index";
import {getFiltersString} from "../utils/filters";

export const getGeoJSON = (namespace: string = 'states', filters: GeoJSONFilters): Promise<GeoJSONResponse> => {
  const filtersString: string = getFiltersString(filters);
  return fetch(`${API_URL}/geojson?namespace=${namespace}&${filtersString}`)
    .then(res => {
      if(!res.ok) throw new Error(res.statusText);
      else return res.json() as Promise<GeoJSONResponse>;
    })
}