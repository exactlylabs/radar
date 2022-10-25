import {Filter} from "../../utils/types";
import {Asn} from "../asns/types";
import {getWeekNumber} from "../../utils/dates";
import {getDateQueryStringFromCalendarType} from "../../utils/filters";

export const getFiltersString = (filters: Array<Filter>): string => {
  let filterString: string = '';
  if(filters[1] !== '') {
    filterString += getDateQueryStringFromCalendarType(filters[1] as string);
  }
  if((filters[0] as Asn).organization !== 'All providers') {
    const asn: Asn = filters[0] as Asn;
    filterString += `&asn_id=${asn.id}`;
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