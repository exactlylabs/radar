export const filterTypes = {
  SPEED: 'speed',
  CALENDAR: 'calendar',
  PROVIDERS: 'providers',
}

export const speedFilters = ['Download', 'Upload'];
export const calendarFilters = ['All time', 'This week', 'This month', 'This year'];

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
  if(namespace.toUpperCase() === 'STATES') return 5;
  return 7;
}

const monthAbbreviations = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const getMonthAbbreviation = (monthIndex: number) => monthAbbreviations[monthIndex];
export const getMonthName = (monthIndex: number) => monthNames[monthIndex];

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
    const today: Date = new Date();
    startingDay = new Date(today);
    startingDay.setDate(startingDay.getDate() - 7);
  }
  const januaryFirst: Date = new Date(startingDay.getFullYear(), 0, 1);
  const dayNumber: number = Math.floor((startingDay.getTime() - januaryFirst.getTime()) / (24 * 60 * 60 * 1000));
  return Math.floor((dayNumber + januaryFirst.getDay()) / 7);
}

export const getFirstDayOfWeek = (weekNumber: number, year: number): Date => {
  let day = (1 + (weekNumber - 1) * 7);
  return new Date(year, 0, day + 1);
}

export const getLastWeek = () => {
  const today: Date = new Date();
  today.setDate(today.getDate() - 7);
  return getWeekNumber(today);
}