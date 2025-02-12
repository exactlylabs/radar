import {Filter} from "../../utils/types";
import {GeoJSONFilters} from "../geojson/types";
import {getQueryStringFromDateObject, getWeekNumber} from "../../utils/dates";
import {CalendarFilters, getDateQueryStringFromCalendarType} from "../../utils/filters";

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
    case CalendarFilters.ALL_TIME:
      return '';
    case CalendarFilters.LAST_WEEK:
      let lastWeekNumber = getWeekNumber();
      let year;
      if(lastWeekNumber === 1) {
        // get last week of last year
        lastWeekNumber = 52;
        year = new Date().getFullYear() - 1;
      } else {
        year = new Date().getFullYear();
        lastWeekNumber -= 2; // minus 2 (1 for backend 0 indexing and 1 for one less week)
      }
      return `week=${lastWeekNumber}&year=${year}`;
    case CalendarFilters.LAST_MONTH:
      let thisMonth = today.getMonth();
      let thisYear = today.getFullYear();
      if(thisMonth === 0) {
        thisMonth = 11;
        thisYear = thisYear - 1;
      }
      return `month=${thisMonth}&year=${thisYear}`;
    case CalendarFilters.THIS_YEAR:
      return `year=${today.getFullYear()}`;
    default:
      return getDateQueryStringFromCalendarType(filter as string);
  }
}