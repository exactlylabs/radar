import {
  DateFilter,
  getDateFromString,
  getMonthName,
  getMonthNumberFromName,
  getWeekLimits,
  getWeekNumber
} from "./dates";
import Option from "../components/ExplorePage/TopFilters/Option";
import {Optional} from "./types";
import {start} from "repl";

export const filterTypes = {
  SPEED: 'speed',
  CALENDAR: 'calendar',
  PROVIDERS: 'providers',
}

export enum speedFilters {
  DOWNLOAD = 'Download',
  UPLOAD = 'Upload'
}

export enum calendarFilters {
  ALL_TIME = 'All time',
  LAST_WEEK = 'Last week',
  LAST_MONTH = 'Last month',
  THIS_YEAR = 'This year',
  CUSTOM_DATE = 'Custom date...'
}

export const isCalendarFilterPresent = (value: string): boolean => {
  return Object.values(calendarFilters).includes(value as calendarFilters);
}

export type NamespaceTabObject = {
  STATES: string;
  COUNTIES: string;
  TRIBAL_TRACTS: string;
}

export type DateTabObject = {
  WEEK: string;
  MONTH: string;
  QUARTER: string;
  HALF_YEAR: string;
}

export const tabs: NamespaceTabObject = {
  STATES: 'STATES',
  COUNTIES: 'COUNTIES',
  TRIBAL_TRACTS: 'TRIBAL_TRACTS',
}

export const dateTabs: DateTabObject = {
  WEEK: 'WEEK',
  MONTH: 'MONTH',
  QUARTER: 'QUARTER',
  HALF_YEAR: 'HALF_YEAR',
}

export const years = [2022, 2021, 2020];
export const months = ['All months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const quarters = ['Q1: Jan 1 - Mar 31', 'Q2: Apr 1 - Jun 30', 'Q3: Jul 1 - Sep 30', 'Q4: Oct 1 - Dec 31'];
export const halves = ['Jan 1 - Jun 30', 'Jul 1 - Dec 31'];

export const getCorrectNamespace = (namespace: string): string => {
  return tabs[namespace.toUpperCase() as keyof NamespaceTabObject];
}

export const getZoomForNamespace = (namespace: string): number => {
  if (namespace.toUpperCase() === tabs.STATES) return 5;
  return 7;
}

export const generateFilterLabel = (dateObject: DateFilter): string => {
  const year: number = dateObject.selectedYear;
  const isCurrentYear: boolean = year === years[0];
  const hasOtherFields: boolean = Object.keys(dateObject).length > 1;
  if(!hasOtherFields) {
    return isCurrentYear ? calendarFilters.THIS_YEAR : year.toString();
  }
  let filterLabel: string = '';
  if(dateObject.selectedMonth)
    filterLabel = `${getMonthName(dateObject.selectedMonth - 1)}${isCurrentYear ? '' : ` (${year})`}`;
  if(dateObject.selectedSemester)
    filterLabel = `H${dateObject.selectedSemester}${isCurrentYear ? '' : ` (${year})`}`;
  if(dateObject.selectedWeek)
    filterLabel = `${getWeekLimits(year, dateObject.selectedWeek + 1)}${isCurrentYear ? '' : ` (${year})`}`;
  return filterLabel;
}

export const getDateQueryStringFromCalendarType = (calendarType: string): string => {
  let queryString: string = '';
  switch (calendarType) {
    case calendarFilters.LAST_WEEK:
      const thisWeekNumber = getWeekNumber();
      queryString = `&year=${new Date().getFullYear()}&week=${thisWeekNumber - 1 - 1}`; // minus 2 (1 for backend 0 indexing and 1 for one less week)
      break;
    case calendarFilters.LAST_MONTH:
      // Month in JS is 0-based, backend is 1-based. So for example if we are in February, getMonth() would
      // return 1. For our backend that's January, but as we want 'Last Month' we can keep that value as is.
      const thisMonth = new Date().getMonth();
      queryString = `&year=${new Date().getFullYear()}&month=${thisMonth}`;
      break;
    case calendarFilters.THIS_YEAR:
      const thisYear = new Date().getFullYear();
      queryString = `&year=${thisYear}`;
      break;
    case calendarFilters.ALL_TIME:
      break;
    default:
      queryString = decodeCustomDate(calendarType);
      break;
  }
  return queryString;
}

const decodeCustomDate = (customDate: string): string => {
  let queryString = '';
  if(customDate.includes('H')) {
    const split: Array<string> = customDate.split(' ');
    const h: string = split[0];
    let year: Optional<string> = split.length > 1 ? split[1] : null;
    queryString += `&semester=${h === 'H1' ? 1 : 2}`;
    if(year) {
      year = year.replace('(', '').replace(')', '');
      queryString += `&year=${year}`;
    } else {
      queryString += `&year=2022`;
    }
  } else if(customDate.includes('-')) {
    //Oct 11 - Oct 17 || Oct 11 - Oct 17 (2020)
    const split: Array<string> = customDate.split('-');
    let endMonthDay = split[1];
    let year: Optional<string> = null;
    if(endMonthDay.includes('(')) {
      const endDaySplit = endMonthDay.split('(');
      year = endDaySplit[1].split(')')[0];
      endMonthDay = endDaySplit[0];
    }
    const endDay = getDateFromString(endMonthDay.trim(), year);
    const weekNumber = getWeekNumber(endDay);
    queryString += `&week=${weekNumber - 1}`;
    if(year) queryString += `&year=${year}`;
    else queryString += `&year=2022`;
  } else if(isSpecificMonth(customDate)) {
    const split: Array<string> = customDate.split(' ');
    const month = getMonthNumberFromName(split[0]);
    const year = split.length > 1 ? split[1].split('(')[1].split(')')[0] : null;
    queryString += `&month=${month}`;
    if(year) queryString += `&year=${year}`;
    else queryString += `&year=2022`;
  } else if(isSpecificYear(customDate)) {
    queryString += `&year=${customDate}`;
  } else {
    queryString = customDate;
  }
  return queryString;
}

export const isSpecificMonth = (string: string): boolean => {
  const possibleMonth = string.split(' ')[0];
  return getMonthNumberFromName(possibleMonth) !== -1;
}

export const isSpecificYear = (string: string): boolean => {
  const possibleYearNumber: number = parseInt(string);
  return !isNaN(possibleYearNumber) && years.includes(possibleYearNumber);
}