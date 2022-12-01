import {Optional} from "./types";
import {
  CalendarFilters,
  DateTabs,
  getSubtitleForQuarter,
  halves,
  isSpecificMonth,
  isSpecificYear,
  months
} from "./filters";

export enum DateMenuLevel {
  INITIAL = 'INITIAL',
  SELECT_YEAR = 'SELECT_YEAR',
  SELECT_MONTH = 'SELECT_MONTH',
  SELECT_HALF = 'SELECT_HALF',
  SELECT_WEEK = 'SELECT_WEEK',
  SELECT_QUARTER = 'SELECT_QUARTER',
}

export type DatePickerState = {
  selectedYear: Optional<number>;
  selectedMonth: Optional<number>;
  selectedWeek: Optional<number>;
  selectedTab: Optional<string>;
  selectedRangeValue: Optional<string | number>;
  subtitleText: Optional<string>;
}

export type DateFilter = {
  selectedYear: number;
  selectedMonth?: number;
  selectedWeek?: number;
  selectedSemester?: number;
  selectedQuarter?: number;
}

export type Day = {
  dayNumber: number;
  month: number;
  year: number;
  week: number;
}

const enum MonthAbbreviations {
  JANUARY = 'Jan',
  FEBRUARY = 'Feb',
  MARCH = 'Mar',
  APRIL = 'Apr',
  MAY = 'May',
  JUNE = 'Jun',
  JULY = 'Jul',
  AUGUST = 'Aug',
  SEPTEMBER = 'Sep',
  OCTOBER = 'Oct',
  NOVEMBER = 'Nov',
  DECEMBER = 'Dec'
}

const enum MonthFullNames {
  JANUARY = 'January',
  FEBRUARY = 'February',
  MARCH = 'March',
  APRIL = 'April',
  MAY = 'May',
  JUNE = 'June',
  JULY = 'July',
  AUGUST = 'August',
  SEPTEMBER = 'September',
  OCTOBER = 'October',
  NOVEMBER = 'November',
  DECEMBER = 'December'
}

const monthAbbreviations = [
  MonthAbbreviations.JANUARY,
  MonthAbbreviations.FEBRUARY,
  MonthAbbreviations.MARCH,
  MonthAbbreviations.APRIL,
  MonthAbbreviations.MAY,
  MonthAbbreviations.JUNE,
  MonthAbbreviations.JULY,
  MonthAbbreviations.AUGUST,
  MonthAbbreviations.SEPTEMBER,
  MonthAbbreviations.OCTOBER,
  MonthAbbreviations.NOVEMBER,
  MonthAbbreviations.DECEMBER
];

const monthNames = [
  MonthFullNames.JANUARY,
  MonthFullNames.FEBRUARY,
  MonthFullNames.MARCH,
  MonthFullNames.APRIL,
  MonthFullNames.MAY,
  MonthFullNames.JUNE,
  MonthFullNames.JULY,
  MonthFullNames.AUGUST,
  MonthFullNames.SEPTEMBER,
  MonthFullNames.OCTOBER,
  MonthFullNames.NOVEMBER,
  MonthFullNames.DECEMBER
];

export const isDay = (elem: any): elem is Day => {
  return !!(elem as Day).dayNumber;
}

const getMonthAbbreviation = (monthIndex: number) => monthAbbreviations[monthIndex];
export const getMonthName = (monthIndex: number) => monthNames[monthIndex];
const getIndexFromAbbreviation = (abbreviation: string) => monthAbbreviations.indexOf(abbreviation as MonthAbbreviations);

export const getCurrentWeekLimits = (): string => {
  const curr = new Date; // get current date
  const first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
  const last = first + 6; // last day is the first day + 6

  const firstDay: Date = new Date(curr.setDate(first));
  const lastDay: Date = new Date(curr.setDate(last));

  const firstDayString: string = `${getMonthAbbreviation(firstDay.getMonth())} ${firstDay.getDate()}`;
  const lastDayString: string = `${getMonthAbbreviation(lastDay.getMonth())} ${lastDay.getDate()}`;
  return `${firstDayString} - ${lastDayString}`;
}

export const getWeekLimits = (selectedYear: number, selectedWeek: number): string => {
  const firstDay: Date = getFirstDayOfWeek(selectedWeek, selectedYear);
  const lastDay: Date = new Date(firstDay);
  lastDay.setDate(lastDay.getDate() + 6);
  const firstDayString: string = `${getMonthAbbreviation(firstDay.getMonth())} ${firstDay.getDate()}`;
  const lastDayString: string = `${getMonthAbbreviation(lastDay.getMonth())} ${lastDay.getDate()}`;
  return `${firstDayString} - ${lastDayString}`;
}

export const isWeekLimits = (string: string): boolean => {
  return string.includes('-');
}

export const getWeekNumber = (day?: Date): number => {
  let startingDay: Date;
  if(day) startingDay = day;
  else {
    startingDay = new Date();
  }
  let firstSundayOfGivenYear: Date = new Date(startingDay.getFullYear(), 0, 1);
  if(firstSundayOfGivenYear.getDay() > 0) {
    firstSundayOfGivenYear.setDate(firstSundayOfGivenYear.getDate() - firstSundayOfGivenYear.getDay());
  }
  let dayNumber: number = Math.floor((startingDay.getTime() - firstSundayOfGivenYear.getTime()) / (24 * 60 * 60 * 1000));
  return Math.floor(dayNumber / 7) + 1;
}

export const getFirstDayOfWeek = (weekNumber: number, year: number): Date => {
  let day = (1 + (weekNumber - 1) * 7);
  const possibleFirstDay: Date = new Date(year, 0, day);
  if(possibleFirstDay.getDay() > 0) {
    const diff = possibleFirstDay.getDay();
    possibleFirstDay.setDate(possibleFirstDay.getDate() - diff);
  }
  return possibleFirstDay;
}

export const getLastWeek = () => {
  const today: Date = new Date();
  today.setDate(today.getDate() - 7);
  return getWeekNumber(today);
}

export const firstWeekOfYear = (selectedYear: number) => getWeekLimits(selectedYear, 0);

export const getCurrentMonth = () => new Date().getMonth();

export const getFirstDayOfLastWeek = (): Date => {
  const today: Date = new Date();
  const dayDiffUntilSunday: number = today.getDay();
  today.setDate(today.getDate() - dayDiffUntilSunday - 7);
  return today;
}

export const getMonthCalendar = (selectedYear: number, selectedMonth: number): Array<Day> => {
  let monthDays: Array<Day> = [];
  const startingDay = new Date(selectedYear, selectedMonth, 1);
  const startingWeek = getWeekNumber(startingDay);
  monthDays.push({
    dayNumber: startingDay.getDate(),
    month: startingDay.getMonth(),
    year: startingDay.getFullYear(),
    week: startingWeek,
  });
// Fill in the first week of the month backwards
  let weekDay = startingDay.getDay();
  let dayCount = 1;
  let dayObject: Day;
  while (weekDay > 0) {
    let day = new Date(startingDay);
    day.setDate(day.getDate() - dayCount);
    const prevDay = new Date(day);
    dayObject = {
      dayNumber: prevDay.getDate(),
      month: prevDay.getMonth(),
      year: prevDay.getFullYear(),
      week: startingWeek,
    }
    monthDays = [dayObject, ...monthDays];
    dayCount++;
    weekDay--;
  }
// Fill in the rest of the month
  let currentDay = new Date(selectedYear, selectedMonth, 2);
  while (currentDay.getMonth() === selectedMonth) {
    const monthDay = new Date(currentDay);
    dayObject = {
      dayNumber: monthDay.getDate(),
      month: monthDay.getMonth(),
      year: monthDay.getFullYear(),
      week: getWeekNumber(monthDay),
    }
    monthDays.push(dayObject);
    currentDay.setDate(currentDay.getDate() + 1);
  }
// first day of next month is mid-week (AKA not sunday)
  if (currentDay.getDay() !== 0) {
    while (currentDay.getDay() !== 0) {
      const remainingDay = new Date(currentDay);
      dayObject = {
        dayNumber: remainingDay.getDate(),
        month: remainingDay.getMonth(),
        year: remainingDay.getFullYear(),
        week: getWeekNumber(remainingDay),
      }
      monthDays.push(dayObject);
      currentDay.setDate(currentDay.getDate() + 1);
    }
  }
  return monthDays;
}

export const getMonthNumberFromName = (monthName: string) => {
  return monthNames.indexOf(monthName as MonthFullNames);
}

export const getDateFromString = (string: string, year: Optional<string>): Date => {
  const [monthAbbreviation, dayNumber] = string.split(' ');
  const month = getIndexFromAbbreviation(monthAbbreviation);
  const day = parseInt(dayNumber);
  const today = new Date();
  const currentYear = today.getFullYear();
  const yearNumber: number = year ? parseInt(year) : currentYear;
  return new Date(yearNumber, month, day);
}

export const getInitialStateFromCalendarType = (calendarType: string): DatePickerState => {
  let pickerState: DatePickerState = {
    selectedYear: null,
    selectedMonth: null,
    selectedWeek: null,
    subtitleText: null,
    selectedRangeValue: null,
    selectedTab: null,
  }
  const today = new Date();
  const currentYear = today.getFullYear();
  if(calendarType === CalendarFilters.THIS_YEAR || calendarType === CalendarFilters.ALL_TIME) {
    pickerState.selectedYear = today.getFullYear();
    pickerState.selectedTab = DateTabs.MONTH;
    pickerState.selectedRangeValue = months[0];
  } else if(calendarType === CalendarFilters.LAST_WEEK) {
    const thisWeekNumber = getWeekNumber();
    pickerState.selectedYear = today.getFullYear();
    pickerState.selectedTab = DateTabs.WEEK;
    pickerState.selectedWeek = thisWeekNumber - 1;
    pickerState.subtitleText = `Week ${thisWeekNumber - 1}`;
    pickerState.selectedRangeValue = getWeekLimits(currentYear, thisWeekNumber - 1);
  } else if(calendarType === CalendarFilters.LAST_MONTH) {
    const todayMonth = today.getMonth();
    pickerState.selectedYear = today.getFullYear();
    pickerState.selectedTab = DateTabs.MONTH;
    pickerState.selectedRangeValue = months[todayMonth + 1];
  } else if(calendarType.includes('H')) {
    const split: Array<string> = calendarType.split(' ');
    const h: string = split[0];
    let year: Optional<string> = split.length > 1 ? split[1] : null;
    pickerState.selectedRangeValue = h === 'H1' ? halves[0] : halves[1];
    pickerState.subtitleText = h;
    if(year) {
      year = year.replace('(', '').replace(')', '');
      pickerState.selectedYear = parseInt(year);
    }
    pickerState.selectedTab = DateTabs.HALF_YEAR;
  } else if(calendarType.includes('Q')) {
    const split: Array<string> = calendarType.split(' ');
    const q: string = split[0];
    let year: Optional<string> = split.length > 1 ? split[1] : null;
    pickerState.selectedRangeValue = q;
    pickerState.subtitleText = getSubtitleForQuarter(q);
    if(year) {
      year = year.replace('(', '').replace(')', '');
      pickerState.selectedYear = parseInt(year);
    }
    pickerState.selectedTab = DateTabs.QUARTER;
  } else if(calendarType.includes('-')) {
    const split: Array<string> = calendarType.split('-');
    let endMonthDay = split[1];
    let year: Optional<string> = null;
    if(endMonthDay.includes('(')) {
      const endDaySplit = endMonthDay.split('(');
      year = endDaySplit[1].split(')')[0];
      endMonthDay = endDaySplit[0];
    }
    const endDay = getDateFromString(endMonthDay.trim(), year);
    const week = getWeekNumber(endDay);
    pickerState.selectedWeek = week;
    if(year) pickerState.selectedYear = parseInt(year);
    pickerState.selectedRangeValue = getWeekLimits(year ? parseInt(year) : currentYear, week);
    pickerState.subtitleText = `Week ${week}`;
    pickerState.selectedMonth = endDay.getMonth();
    pickerState.selectedTab = DateTabs.WEEK;
  } else if(isSpecificMonth(calendarType)) {
    const split: Array<string> = calendarType.split(' ');
    const month = getMonthNumberFromName(split[0]);
    const year = split.length > 1 ? split[1].split('(')[1].split(')')[0] : null;
    pickerState.selectedRangeValue = months[month + 1];
    if(year) pickerState.selectedYear = parseInt(year);
    pickerState.selectedTab = DateTabs.MONTH;
  } else if(isSpecificYear(calendarType)) {
    pickerState.selectedYear = parseInt(calendarType);
    pickerState.selectedTab = DateTabs.MONTH;
  }
  return pickerState;
}

export const getQueryStringFromDateObject = (dateObject: DateFilter): string => {
  let dateQuery = `&year=${dateObject.selectedYear}`;
  if(dateObject.selectedMonth)
    dateQuery += `&month=${dateObject.selectedMonth}`;
  if(dateObject.selectedWeek)
    dateQuery += `&week=${dateObject.selectedWeek}`;
  if(dateObject.selectedSemester)
    dateQuery += `&semester=${dateObject.selectedSemester}`;
  if(dateObject.selectedQuarter)
    dateQuery += `&quarter=${dateObject.selectedQuarter}`;
  return dateQuery;
}