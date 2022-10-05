import {Filter} from "../../utils/types";
import {Asn} from "../asns/types";

export const getFiltersString = (filters: Array<Filter>): string => {
  let filterString: string = '';
  if(filters[1] !== '') {
    filterString += getCalendarFilterValue(filters[1]);
  }
  if(filters[2] !== 'All providers') {
    const asn: Asn = filters[2] as Asn;
    filterString += `&asn_id=${asn.id}`;
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