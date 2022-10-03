import {GeoJSONResponse} from "./types";
import {API_URL} from "../index";
import {getCalendarFilterValue} from "../utils/filters";
import {Filter} from "../../utils/types";

export const getGeoJSON = (namespace: string = 'states', calendarType?: Filter): Promise<GeoJSONResponse> => {
  let dateFilter: string = '';
  if(calendarType && calendarType !== 'All time') {
    dateFilter = `&${getCalendarFilterValue(calendarType)}`;
  }
  return fetch(`${API_URL}/geojson?namespace=${namespace}${dateFilter}`)
    .then(res => {
      if(!res.ok) throw new Error(res.statusText);
      else return res.json() as Promise<GeoJSONResponse>;
    })
}