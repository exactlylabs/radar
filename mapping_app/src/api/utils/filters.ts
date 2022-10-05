import {Filter} from "../../utils/types";
import {Asn} from "../asns/types";
import {GeoJSONFilters} from "../geojson/types";

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
    case 'This week':
      const januaryFirst: Date = new Date(today.getFullYear(), 0, 1);
      const dayNumber: number = Math.floor((today.getTime() - januaryFirst.getTime()) / (24 * 60 * 60 * 1000));
      const weekNumber: number = Math.floor((dayNumber + januaryFirst.getDay()) / 7);
      return `week=${weekNumber}&year=${today.getFullYear()}`;
    case 'This month':
      return `month=${today.getMonth() + 1}&year=${today.getFullYear()}`;
    case 'This year':
      return `year=${today.getFullYear()}`;
    default:
      return '';
  }
}