import {
  DateFilter,
  getDateFromString,
  getMonthName,
  getMonthNumberFromName,
  getWeekLimits,
  getWeekNumber
} from "./dates";
import {Optional} from "./types";
import {getSignalStateDownload, getSignalStateUpload} from "./speeds";
import {GeospaceInfo} from "../api/geospaces/types";
import {MenuContent} from "../components/common/CustomGenericMenu/menu";

export enum FilterTypes {
  SPEED = 'speed',
  CALENDAR = 'calendar',
  PROVIDERS = 'providers',
}

export enum SpeedFilters {
  DOWNLOAD = 'Download',
  UPLOAD = 'Upload'
}

export enum CalendarFilters {
  ALL_TIME = 'All time',
  LAST_WEEK = 'Last week',
  LAST_MONTH = 'Last month',
  THIS_YEAR = 'This year',
  CUSTOM_DATE = 'Custom date...'
}

export const isCalendarFilterPresent = (value: string): boolean => {
  return Object.values(CalendarFilters).includes(value as CalendarFilters);
}

export enum GeospacesTabs {
  STATES = 'STATES',
  COUNTIES = 'COUNTIES',
  TRIBAL_TRACTS = 'TRIBAL_TRACTS',
}

export enum DateTabs {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  HALF_YEAR = 'HALF_YEAR',
}

export enum Quarters {
  Q1 = 'Q1',
  Q2 = 'Q2',
  Q3 = 'Q3',
  Q4 = 'Q4',
}

export enum QuartersDateRanges {
  Q1 = 'Jan 1 - Mar 31',
  Q2 = 'Apr 1 - Jun 30',
  Q3 = 'Jul 1 - Sep 30',
  Q4 = 'Oct 1 - Dec 31',
}

export type QuartersWithRangeObject = {
  Q1: string;
  Q2: string;
  Q3: string;
  Q4: string;
}

// Need to use object instead of enum because of dynamic string values
export const quartersWithRange: QuartersWithRangeObject = {
  Q1: `${Quarters.Q1} (${QuartersDateRanges.Q1})`,
  Q2: `${Quarters.Q2} (${QuartersDateRanges.Q2})`,
  Q3: `${Quarters.Q3} (${QuartersDateRanges.Q3})`,
  Q4: `${Quarters.Q4} (${QuartersDateRanges.Q4})`,
}

export const years = [2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2014, 2013, 2012, 2011, 2010, 2009];
export const months = ['All months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const halves = ['Jan 1 - Jun 30', 'Jul 1 - Dec 31'];

/**
 * Function to check if actual option label matches the Q{1,2,3,4} value.
 * @param currentQuarter: current quarter from options' loop. Type of QuartersWithRange.
 * @param selectedQuarter: current selected quarter. Type of Quarters.
 */
export const isQuarterSelected = (currentQuarter: any, selectedQuarter: any): boolean => {
  const key = selectedQuarter as string;
  const currentQuarterString = currentQuarter as string;
  return quartersWithRange[key as keyof QuartersWithRangeObject] === currentQuarterString;
}

/**
 * Get Quarter type from QuarterWithRangeObject value.
 * @param selectedFullQuarter: string from QuartersWithRangeObject type.
 */
export const getQuarterValueFromCompleteRange = (selectedFullQuarter: string): string => {
  const indexOfQ = Object.values(quartersWithRange).indexOf(selectedFullQuarter);
  if(indexOfQ > 0) return Object.values(Quarters)[indexOfQ];
  return Quarters.Q1;
}

/**
 * Function to get range from given Q value.
 * @param quarter: Q value of type Quarter.
 */
export const getSubtitleForQuarter = (quarter: string): string => {
  return QuartersDateRanges[quarter as keyof QuartersWithRangeObject];
}

/**
 * Function to get subtitle text from given H value.
 * @param halfRange: H value of type half.
 */
export const getSubtitleForHalf = (halfRange: string): string => {
  return halfRange === halves[0] ? 'H1' : 'H2';
}

/**
 * Function to get semester index for query to backend API.
 * @param quarter: string of type Quarter.
 */
export const getSemesterFromSelectedQ = (quarter: string): number => {
  return parseInt(quarter.split('Q')[1]);
}

export const getCorrectNamespace = (namespace: string): string => {
  return GeospacesTabs[namespace.toUpperCase() as GeospacesTabs];
}

export const getZoomForNamespace = (namespace: string): number => {
  if (namespace.toUpperCase() === GeospacesTabs.STATES) return 5;
  return 7;
}

export const generateFilterLabel = (dateObject: DateFilter): string => {
  const year: number = dateObject.selectedYear;
  const isCurrentYear: boolean = year === years[0];
  const hasOtherFields: boolean = Object.keys(dateObject).length > 1;
  if(!hasOtherFields) {
    return isCurrentYear ? CalendarFilters.THIS_YEAR : year.toString();
  }
  let filterLabel: string = '';
  if(dateObject.selectedMonth)
    filterLabel = `${getMonthName(dateObject.selectedMonth - 1)}${isCurrentYear ? '' : ` (${year})`}`;
  if(dateObject.selectedSemester)
    filterLabel = `H${dateObject.selectedSemester}${isCurrentYear ? '' : ` (${year})`}`;
  if(dateObject.selectedWeek)
    filterLabel = `${getWeekLimits(year, dateObject.selectedWeek + 1)}${isCurrentYear ? '' : ` (${year})`}`;
  if(dateObject.selectedQuarter)
    filterLabel = `Q${dateObject.selectedQuarter}${isCurrentYear ? '' : ` (${year})`}`;
  return filterLabel;
}

export const getDateQueryStringFromCalendarType = (calendarType: string): string => {
  let queryString: string = '';
  switch (calendarType) {
    case CalendarFilters.LAST_WEEK:
      const thisWeekNumber = getWeekNumber();
      queryString = `&year=${new Date().getFullYear()}&week=${thisWeekNumber - 1 - 1}`; // minus 2 (1 for backend 0 indexing and 1 for one less week)
      break;
    case CalendarFilters.LAST_MONTH:
      // Month in JS is 0-based, backend is 1-based. So for example if we are in February, getMonth() would
      // return 1. For our backend that's January, but as we want 'Last Month' we can keep that value as is.
      const thisMonth = new Date().getMonth();
      queryString = `&year=${new Date().getFullYear()}&month=${thisMonth}`;
      break;
    case CalendarFilters.THIS_YEAR:
      const thisYear = new Date().getFullYear();
      queryString = `&year=${thisYear}`;
      break;
    case CalendarFilters.ALL_TIME:
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
    if (year) {
      year = year.replace('(', '').replace(')', '');
      queryString += `&year=${year}`;
    } else {
      queryString += `&year=2022`;
    }
  } else if(customDate.includes('Q')) {
    const split: Array<string> = customDate.split(' ');
    const q: string = split[0];
    let year: Optional<string> = split.length > 1 ? split[1] : null;
    queryString += `&quarter=${getSemesterFromSelectedQ(q)}`;
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

export const getSignalState = (speedType: string, selectedGeospaceInfo: GeospaceInfo): string => {
  return speedType === SpeedFilters.DOWNLOAD ?
    getSignalStateDownload(selectedGeospaceInfo.download_median) : getSignalStateUpload(selectedGeospaceInfo.upload_median);
}

export const getFilterMenuContentFromFilter = (filter: string): MenuContent => {
  if(filter === FilterTypes.SPEED) return MenuContent.SPEED_TYPE;
  else if(filter === FilterTypes.PROVIDERS) return MenuContent.PROVIDERS;
  else return MenuContent.CALENDAR;
}