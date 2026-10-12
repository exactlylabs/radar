import {
  CalendarFilters,
  FIRST_DATA_YEAR,
  getDateQueryStringFromCalendarType,
  getLastMonth,
  getLastWeekFilter,
  getYears,
  years,
} from "./filters";
import {getCalendarFilterValue} from "../api/utils/filters";
import {getQueryStringFromDateObject} from "./dates";

describe('getLastMonth', () => {
  it('is December of the previous year in January', () => {
    expect(getLastMonth(new Date(2026, 0, 15))).toEqual({year: 2025, month: 12});
  });
  it('is the previous 1-based month otherwise', () => {
    expect(getLastMonth(new Date(2026, 1, 1))).toEqual({year: 2026, month: 1});
    expect(getLastMonth(new Date(2026, 9, 11))).toEqual({year: 2026, month: 9});
    expect(getLastMonth(new Date(2026, 11, 31))).toEqual({year: 2026, month: 11});
  });
});

describe('getLastWeekFilter', () => {
  it('uses the week seven days back, in its own year', () => {
    // 2026-01-03 (Saturday): last week ends in December 2025
    expect(getLastWeekFilter(new Date(2026, 0, 3)).year).toBe(2025);
    // 2026-10-11 (Sunday): 7 days back is 2026-10-04, a Sunday starting week 40 (1-based) -> 39 for the backend
    expect(getLastWeekFilter(new Date(2026, 9, 11))).toEqual({year: 2026, week: 39});
  });
  it('never sends a negative week', () => {
    for (let day = 1; day <= 14; day++) {
      expect(getLastWeekFilter(new Date(2027, 0, day)).week).toBeGreaterThanOrEqual(0);
    }
  });
});

describe('query strings', () => {
  it('Last month in January asks for December of last year', () => {
    const jan = new Date(2027, 0, 20);
    expect(getDateQueryStringFromCalendarType(CalendarFilters.LAST_MONTH, jan)).toBe('&year=2026&month=12');
    expect(getCalendarFilterValue(CalendarFilters.LAST_MONTH, jan)).toBe('month=12&year=2026');
  });
  it('This year uses the given date', () => {
    expect(getDateQueryStringFromCalendarType(CalendarFilters.THIS_YEAR, new Date(2027, 5, 1))).toBe('&year=2027');
  });
  it('half years and quarters map to the backend numbering (1 = Jan-Jun, 2 = Jul-Dec)', () => {
    expect(getDateQueryStringFromCalendarType('H1 (2024)')).toBe('&semester=1&year=2024');
    expect(getDateQueryStringFromCalendarType('H2 (2024)')).toBe('&semester=2&year=2024');
    expect(getDateQueryStringFromCalendarType('Q3 (2023)')).toBe('&quarter=3&year=2023');
  });
  it('labels without a year are the current year', () => {
    const thisYear = new Date().getFullYear();
    expect(getDateQueryStringFromCalendarType('H2')).toBe(`&semester=2&year=${thisYear}`);
    expect(getDateQueryStringFromCalendarType('Q1')).toBe(`&quarter=1&year=${thisYear}`);
    expect(getDateQueryStringFromCalendarType('March')).toBe(`&month=3&year=${thisYear}`);
  });
  it('keeps week 0 (the first week of a year)', () => {
    expect(getQueryStringFromDateObject({selectedYear: 2024, selectedWeek: 0})).toBe('&year=2024&week=0');
  });
});

describe('years', () => {
  it('runs from the current year back to the first data year', () => {
    expect(getYears(new Date(2027, 2, 1))[0]).toBe(2027);
    expect(getYears(new Date(2027, 2, 1)).slice(-1)[0]).toBe(FIRST_DATA_YEAR);
    expect(years[0]).toBe(new Date().getFullYear());
  });
});
