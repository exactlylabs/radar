import {GeoJSONFilters, GeoJSONResponse} from "./types";
import {API_URL, throwError} from "../index";
import {getFiltersString} from "../utils/filters";

export const getGeoJSON = (namespace: string = 'states', filters: GeoJSONFilters): Promise<GeoJSONResponse> => {
  const filtersString: string = getFiltersString(filters);
  return fetch(`${API_URL}/geojson?namespace=${namespace}&${filtersString}`, {
    headers: {
      'Access-Control-Request-Headers': 'traceparent',
    }
  })
    .then(res => {
      if(!res.ok) return throwError(res);
      else return res.json() as Promise<GeoJSONResponse>;
    })
}