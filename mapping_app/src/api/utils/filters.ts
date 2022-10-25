import {Filter} from "../../utils/types";
import {Asn} from "../asns/types";
import {GeoJSONFilters} from "../geojson/types";
import {getWeekNumber} from "../../utils/dates";
import {getDateQueryStringFromCalendarType} from "../../utils/filters";

export const getFiltersString = (filters: GeoJSONFilters): string => {
  let filterString: string = '';
  if(!!filters.calendar) {
    filterString += getCalendarFilterValue(filters.calendar);
  }
  if(filters.provider && filters.provider.organization !== 'All providers') {
    filterString += `&asn_id=${filters.provider.id}`;
  }
  return filterString;
}

export const getCalendarFilterValue = (filter: Filter): string => {
  const today: Date = new Date();
  switch (filter) {
    case 'All time':
      return '';
    case 'Last week':
      const lastWeekNumber = getWeekNumber() - 2;
      return `week=${lastWeekNumber}&year=${today.getFullYear()}`;
    case 'Last month':
      return `month=${today.getMonth()}&year=${today.getFullYear()}`;
    case 'This year':
      return `year=${today.getFullYear()}`;
    default:
      return filter as string;
  }
}