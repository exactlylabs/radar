import {API_URL} from "../index";
import {GeoJSONFilters} from "../geojson/types";
import {getFiltersString} from "../utils/filters";

export const getVectorTilesUrl = (namespace: string = 'counties', filters: GeoJSONFilters): string => {
  const filtersString: string = getFiltersString(filters);
  return `${API_URL}/namespaces/${namespace}/tiles/{z}/{x}/{y}?${filtersString}`;
}