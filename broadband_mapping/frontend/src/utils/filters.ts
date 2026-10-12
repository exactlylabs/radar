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

// First year with M-Lab data on the map.
export const FIRST_DATA_YEAR = 2009;

/**
 * Selectable years, newest first: from the given date's year back to FIRST_DATA_YEAR.
 * years[0] is the current year (labels omit the year for it).
 */
export const getYears = (today: Date = new Date()): number[] => {
  const result: number[] = [];
  for (let year = today.getFullYear(); year >= FIRST_DATA_YEAR; year--) result.push(year);
  return result;
}

export const years = getYears();
export const months = ['All months', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const quarters = ['Q1: Jan 1 - Mar 31', 'Q2: Apr 1 - Jun 30', 'Q3: Jul 1 - Sep 30', 'Q4: Oct 1 - Dec 31'];
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
  if(dateObject.selectedWeek !== undefined && dateObject.selectedWeek !== null)
    filterLabel = `${getWeekLimits(year, dateObject.selectedWeek + 1)}${isCurrentYear ? '' : ` (${year})`}`;
  if(dateObject.selectedQuarter)
    filterLabel = `Q${dateObject.selectedQuarter}${isCurrentYear ? '' : ` (${year})`}`;
  return filterLabel;
}

/**
 * Year and 1-based month (as the backend expects) of the month before the given date.
 * In January that is December of the previous year.
 */
export const getLastMonth = (today: Date = new Date()): { year: number, month: number } => {
  // getMonth() is 0-based, so for any month but January it already is last month's 1-based number.
  const thisMonth = today.getMonth();
  if (thisMonth === 0) return { year: today.getFullYear() - 1, month: 12 };
  return { year: today.getFullYear(), month: thisMonth };
}

/**
 * Year and backend week (0-based, Sunday-first) of the week before the given date.
 * Taken from the date seven days back, so the first week of January asks for the previous year.
 */
export const getLastWeekFilter = (today: Date = new Date()): { year: number, week: number } => {
  const lastWeekDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
  // getWeekNumber is 1-based, the backend is 0-based
  return { year: lastWeekDay.getFullYear(), week: getWeekNumber(lastWeekDay) - 1 };
}

export const getDateQueryStringFromCalendarType = (calendarType: string, today: Date = new Date()): string => {
  let queryString: string = '';
  switch (calendarType) {
    case CalendarFilters.LAST_WEEK: {
      const { year, week } = getLastWeekFilter(today);
      queryString = `&year=${year}&week=${week}`;
      break;
    }
    case CalendarFilters.LAST_MONTH: {
      const { year, month } = getLastMonth(today);
      queryString = `&year=${year}&month=${month}`;
      break;
    }
    case CalendarFilters.THIS_YEAR:
      queryString = `&year=${today.getFullYear()}`;
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
      queryString += `&year=${years[0]}`;
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
      queryString += `&year=${years[0]}`;
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
    else queryString += `&year=${years[0]}`;
  } else if(isSpecificMonth(customDate)) {
    const split: Array<string> = customDate.split(' ');
    const month = getMonthNumberFromName(split[0]);
    const year = split.length > 1 ? split[1].split('(')[1].split(')')[0] : null;
    queryString += `&month=${month}`;
    if(year) queryString += `&year=${year}`;
    else queryString += `&year=${years[0]}`;
  } else if(isSpecificYear(customDate)) {
    queryString += `&year=${customDate}`;
  } else {
    queryString = customDate;
  }
  return queryString;
}

export const isSpecificMonth = (string: string): boolean => {
  const possibleMonth = string.split(' ')[0];
  return getMonthNumberFromName(possibleMonth) > 0;
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

export const applyChanges = (
  selectedYear: number,
  selectedWeek: number,
  selectedTab: string,
  innerValue: string | number,
  subtitleText: string,
  applyFn: (dateObject: DateFilter) => void
) => {
  let dateObject: DateFilter = {selectedYear};
  switch (selectedTab) {
    case DateTabs.MONTH:
      if(innerValue !== months[0]) {
        dateObject.selectedMonth = getMonthNumberFromName(innerValue as string);
      }
      break;
    case DateTabs.HALF_YEAR:
      dateObject.selectedSemester = subtitleText === 'H1' ? 1 : 2;
      break;
    case DateTabs.WEEK:
      dateObject.selectedWeek = selectedWeek - 1;
      break;
    case DateTabs.QUARTER:
      dateObject.selectedQuarter = getSemesterFromSelectedQ(innerValue as string);
      break;
  }
  applyFn(dateObject);
}