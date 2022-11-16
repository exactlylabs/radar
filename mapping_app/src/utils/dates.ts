import {Optional} from "./types";
import {dateTabs, halves, isSpecificMonth, isSpecificYear, months} from "./filters";

export enum DateMenuLevel {
  INITIAL = 'INITIAL',
  SELECT_YEAR = 'SELECT_YEAR',
  SELECT_MONTH = 'SELECT_MONTH',
  SELECT_HALF = 'SELECT_HALF',
  SELECT_WEEK = 'SELECT_WEEK'
}

export type DatePickerState = {
  selectedYear: Optional<number>;
  selectedMonth: Optional<number>;
  selectedWeek: Optional<number>;
  selectedTab: Optional<string>;
  selectedRangeValue: Optional<string | number>;
  subtitleText: Optional<string>;
}

export type Day = {
  dayNumber: number;
  month: number;
  year: number;
  week: number;
}

const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const isDay = (elem: any): elem is Day => {
  return !!(elem as Day).dayNumber;
}

const getMonthAbbreviation = (monthIndex: number) => monthAbbreviations[monthIndex];
export const getMonthName = (monthIndex: number) => monthNames[monthIndex];
const getIndexFromAbbreviation = (abbreviation: string) => monthAbbreviations.indexOf(abbreviation);

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
  return monthNames.indexOf(monthName);
}

export const getDateFromString = (string: string, year: Optional<string>): Date => {
  const [monthAbbreviation, dayNumber] = string.split(' ');
  const month = getIndexFromAbbreviation(monthAbbreviation);
  const day = parseInt(dayNumber);
  const yearNumber: number = year ? parseInt(year) : 2022;
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
  if(calendarType === 'This year' || calendarType === 'All time') {
    const today = new Date();
    pickerState.selectedYear = today.getFullYear();
    pickerState.selectedTab = dateTabs.MONTH;
    pickerState.selectedRangeValue = months[0];
  } else if(calendarType === 'Last week') {
    const today = new Date();
    const thisWeekNumber = getWeekNumber();
    pickerState.selectedYear = today.getFullYear();
    pickerState.selectedTab = dateTabs.WEEK;
    pickerState.selectedWeek = thisWeekNumber - 1;
    pickerState.subtitleText = `Week ${thisWeekNumber - 1}`;
    pickerState.selectedRangeValue = getWeekLimits(2022, thisWeekNumber - 1);
  } else if(calendarType === 'Last month') {
    const today = new Date();
    const todayMonth = today.getMonth();
    pickerState.selectedYear = today.getFullYear();
    pickerState.selectedTab = dateTabs.MONTH;
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
    pickerState.selectedTab = dateTabs.HALF_YEAR;
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
    pickerState.selectedRangeValue = getWeekLimits(year ? parseInt(year) : 2022, week);
    pickerState.subtitleText = `Week ${week}`;
    pickerState.selectedMonth = endDay.getMonth();
    pickerState.selectedTab = dateTabs.WEEK;
  } else if(isSpecificMonth(calendarType)) {
    const split: Array<string> = calendarType.split(' ');
    const month = getMonthNumberFromName(split[0]);
    const year = split.length > 1 ? split[1].split('(')[1].split(')')[0] : null;
    pickerState.selectedRangeValue = months[month + 1];
    if(year) pickerState.selectedYear = parseInt(year);
    pickerState.selectedTab = dateTabs.MONTH;
  } else if(isSpecificYear(calendarType)) {
    pickerState.selectedYear = parseInt(calendarType);
    pickerState.selectedTab = dateTabs.MONTH;
  }
  return pickerState;
}