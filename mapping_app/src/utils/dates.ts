export type Day = {
  dayNumber: number;
  month: number;
  year: number;
  week: number;
}

export const isDay = (elem: any): elem is Day => {
  return !!(elem as Day).dayNumber;
}