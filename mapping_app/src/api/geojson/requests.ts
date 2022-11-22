import {GeoJSONResponse} from "./types";
import {API_URL, throwError} from "../index";
import {getFiltersString} from "../utils/filters";
import {Asn} from "../asns/types";

export const getGeoJSON = (namespace: string = 'states', provider?: Asn, dateQueryString?: string): Promise<GeoJSONResponse> => {
  const filters: string = getFiltersString([provider ?? '', dateQueryString ?? '']);
  return fetch(`${API_URL}/geojson?namespace=${namespace}&${filters}`)
    .then(res => {
      if(!res.ok) return throwError(res);
      else return res.json() as Promise<GeoJSONResponse>;
    })
}