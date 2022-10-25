import {GeoJSONResponse} from "./types";
import {API_URL} from "../index";
import {getFiltersString} from "../utils/filters";
import {Filter} from "../../utils/types";
import {Asn} from "../asns/types";

export const getGeoJSON = (namespace: string = 'states', provider?: Asn, dateQueryString?: string): Promise<GeoJSONResponse> => {
  const filters: string = getFiltersString([provider ?? '', dateQueryString ?? '']);
  return fetch(`${API_URL}/geojson?namespace=${namespace}&${filters}`)
    .then(res => {
      if(!res.ok) throw new Error(res.statusText);
      else return res.json() as Promise<GeoJSONResponse>;
    })
}