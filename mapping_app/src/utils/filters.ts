import {getDateFromString, getMonthName, getMonthNumberFromName, getWeekLimits, getWeekNumber} from "./dates";
import {Optional} from "./types";
import {getSignalStateDownload, getSignalStateUpload} from "./speeds";
import {GeospaceInfo} from "../api/geospaces/types";
import {MenuContent} from "../components/common/MyGenericMenu/menu";

export const filterTypes = {
  SPEED: 'speed',
  CALENDAR: 'calendar',
  PROVIDERS: 'providers',
}

export const speedFilters = ['Download', 'Upload'];
export const calendarFilters = ['All time', 'Last week', 'Last month', 'This year', 'Custom date...'];

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
  if (namespace.toUpperCase() === 'STATES') return 5;
  return 7;
}

export const generateFilterLabel = (queryString: string): string => {
  const split: Array<string> = queryString.split('&');
  const year: number = parseInt(split[1].split('=')[1]);
  const isCurrentYear: boolean = year === years[0];
  const otherField: string = split[2];
  if(!otherField) {
    return isCurrentYear ? 'This year' : year.toString();
  }
  const [otherFieldLabel, otherFieldValue] = otherField.split('=');
  let filterLabel: string = '';
  switch (otherFieldLabel) {
    case 'month':
      filterLabel = `${getMonthName(parseInt(otherFieldValue) - 1)}${isCurrentYear ? '' : ` (${year})`}`;
      break;
    case 'semester':
      filterLabel = `H${otherFieldValue}${isCurrentYear ? '' : ` (${year})`}`;
      break;
    case 'week':
      filterLabel = `${getWeekLimits(year, parseInt(otherFieldValue) + 1)}${isCurrentYear ? '' : ` (${year})`}`;
      break;
  }
  return filterLabel;
}

export const getDateQueryStringFromCalendarType = (calendarType: string): string => {
  let queryString: string = '';
  switch (calendarType) {
    case 'Last week':
      const thisWeekNumber = getWeekNumber();
      queryString = `&year=${new Date().getFullYear()}&week=${thisWeekNumber - 1 - 1}`; // minus 2 (1 for backend 0 indexing and 1 for one less week)
      break;
    case 'Last month':
      // Month in JS is 0-based, backend is 1-based. So for example if we are in February, getMonth() would
      // return 1. For our backend that's January, but as we want 'Last Month' we can keep that value as is.
      const thisMonth = new Date().getMonth();
      queryString = `&year=${new Date().getFullYear()}&month=${thisMonth}`;
      break;
    case 'This year':
      const thisYear = new Date().getFullYear();
      queryString = `&year=${thisYear}`;
      break;
    case 'All time':
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

export const getSignalState = (speedType: string, selectedGeospaceInfo: GeospaceInfo): string => {
  return speedType === 'Download' ?
    getSignalStateDownload(selectedGeospaceInfo.download_median) : getSignalStateUpload(selectedGeospaceInfo.upload_median);
}

export const getFilterMenuContentFromFilter = (filter: string): MenuContent => {
  if(filter === filterTypes.SPEED) return MenuContent.SPEED_TYPE;
  else if(filter === filterTypes.PROVIDERS) return MenuContent.PROVIDERS;
  else return MenuContent.CALENDAR;
}

export const applyChanges = (
  selectedYear: number,
  selectedWeek: number,
  selectedTab: string,
  innerValue: string | number,
  subtitleText: string,
  applyFn: (str: string) => void
) => {
  let dateQuery = `&year=${selectedYear}`;
  switch (selectedTab) {
    case dateTabs.MONTH:
      if(innerValue !== months[0]) {
        dateQuery += `&month=${getMonthNumberFromName(innerValue as string) + 1}`; // months are 1-indexed in backend
      }
      break;
    case dateTabs.HALF_YEAR:
      dateQuery += `&semester=${subtitleText === 'H1' ? 1 : 2}`;
      break;
    case dateTabs.WEEK:
      dateQuery += `&week=${selectedWeek - 1}`; // weeks are 0-indexed in backend
      break;
  }
  applyFn(dateQuery);
}