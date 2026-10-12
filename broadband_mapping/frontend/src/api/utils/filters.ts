import {Filter} from "../../utils/types";
import {GeoJSONFilters} from "../geojson/types";
import {CalendarFilters, getDateQueryStringFromCalendarType, getLastMonth, getLastWeekFilter} from "../../utils/filters";

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

export const getCalendarFilterValue = (filter: Filter, today: Date = new Date()): string => {
  switch (filter) {
    case CalendarFilters.ALL_TIME:
      return '';
    case CalendarFilters.LAST_WEEK: {
      const { year, week } = getLastWeekFilter(today);
      return `week=${week}&year=${year}`;
    }
    case CalendarFilters.LAST_MONTH: {
      const { year, month } = getLastMonth(today);
      return `month=${month}&year=${year}`;
    }
    case CalendarFilters.THIS_YEAR:
      return `year=${today.getFullYear()}`;
    default:
      return getDateQueryStringFromCalendarType(filter as string, today);
  }
}