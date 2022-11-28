import {ReactElement, useState} from "react";
import {dateTabs, halves, months, years} from "../../../../utils/filters";
import {
  DateFilter,
  DatePickerState,
  getCurrentMonth,
  getFirstDayOfLastWeek,
  getMonthNumberFromName,
  getWeekLimits,
  getWeekNumber
} from "../../../../utils/dates";
import MenuContentYearOrMonth from "../MenuContentYearOrMonth/MenuContentYearOrMonth";
import {isNumber, isString, Optional} from "../../../../utils/types";
import MenuContentHalf from "../MenuContentHalf/MenuContentHalf";
import MenuContentWeek from "../MenuContentWeek/MenuContentWeek";
import InitialMenuContentCustomRange from "./InitialMenuContentCustomRange";

export enum DateMenuLevel {
  INITIAL = 'INITIAL',
  SELECT_YEAR = 'SELECT_YEAR',
  SELECT_MONTH = 'SELECT_MONTH',
  SELECT_HALF = 'SELECT_HALF',
  SELECT_WEEK = 'SELECT_WEEK'
}

interface MenuContentCustomDateRangeProps {
  goBack: () => void;
  applyRanges: (dateObject: DateFilter) => void;
  initialState: Optional<DatePickerState>;
}

const MenuContentCustomDateRange = ({
  goBack,
  applyRanges,
  initialState
}: MenuContentCustomDateRangeProps): ReactElement => {

  const [currentLevel, setCurrentLevel] = useState<DateMenuLevel>(DateMenuLevel.INITIAL);
  const [selectedTab, setSelectedTab] = useState<string>(initialState?.selectedTab ?? dateTabs.MONTH);
  const [subtitleText, setSubtitleText] = useState<string>(initialState?.subtitleText ?? '');
  const [innerValue, setInnerValue] = useState<string | number>(initialState?.selectedRangeValue ?? months[0]);
  const [selectedYear, setSelectedYear] = useState(initialState?.selectedYear ?? years[0]);
  const [selectedMonth, setSelectedMonth] = useState(initialState?.selectedMonth ?? new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState(initialState?.selectedWeek ?? getWeekNumber(getFirstDayOfLastWeek()));

  const handleChangeYear = (newYear: number) => {
    setSelectedYear(newYear);
    const newWeek = newYear === years[0] ? getWeekNumber() : 1;
    const newMonth = newYear === years[0] ? getCurrentMonth() : 0;
    setSelectedMonth(newMonth);
    setSelectedWeek(newWeek);
    if(dateTabs.WEEK === selectedTab) {
      setInnerValue(getWeekLimits(newYear, newWeek));
      setSubtitleText(`Week: ${newWeek}`);
    }
  }

  const handleChangeWeek = (newWeek: number, year: number, month: number) => {
    if(selectedYear !== year) setSelectedYear(year);
    if(selectedMonth !== month) setSelectedMonth(month);
    setSelectedWeek(newWeek);
    setInnerValue(getWeekLimits(year, newWeek));
    setSubtitleText(`Week: ${newWeek}`);
  }

  const goToInitialLevel = () => setCurrentLevel(DateMenuLevel.INITIAL);

  const handleSelectYear = (option: number | string) => {
    if(isNumber(option)) {
      handleChangeYear(option as number);
    }
  }

  const handleSelectMonth = (option: number | string) => {
    if(isString(option)) {
      setInnerValue(option as string);
      setSelectedMonth(getMonthNumberFromName(option as string));
    }
  }

  const handleSelectHalfyear = (option: string) => {
    setInnerValue(option);
    setSubtitleText(option === halves[0] ? 'H1' : 'H2');
  }

  const getInitialScreenContent = () => (
    <InitialMenuContentCustomRange goBack={goBack}
                                   applyRanges={applyRanges}
                                   selectedYear={selectedYear}
                                   selectedWeek={selectedWeek}
                                   selectedTab={selectedTab}
                                   setSelectedTab={setSelectedTab}
                                   currentLevel={currentLevel}
                                   setCurrentLevel={setCurrentLevel}
                                   subtitleText={subtitleText}
                                   setSubtitleText={setSubtitleText}
                                   innerValue={innerValue}
                                   setInnerValue={setInnerValue}
    />
  )

  const getYearScreenContent = () => (
    <MenuContentYearOrMonth type={'year'}
                            options={years}
                            goBack={goToInitialLevel}
                            selectedOption={selectedYear}
                            setSelectedOption={handleSelectYear}
    />
  );

  const getMonthScreenContent = () => (
    <MenuContentYearOrMonth type={'month'}
                            options={months}
                            goBack={goToInitialLevel}
                            selectedOption={innerValue}
                            setSelectedOption={handleSelectMonth}
    />
  )

  const getHalfScreenContent = () => (
    <MenuContentHalf goBack={goToInitialLevel}
                     selectedOption={innerValue as string}
                     setSelectedOption={handleSelectHalfyear}
    />
  )

  const getWeekScreenContent = () => (
    <MenuContentWeek goBack={goToInitialLevel}
                     selectedWeek={selectedWeek}
                     selectedMonth={selectedMonth}
                     selectedYear={selectedYear}
                     setSelectedWeek={handleChangeWeek}
                     setSelectedMonth={setSelectedMonth}
    />
  )

  const getContent = () => {
    switch (currentLevel) {
      case DateMenuLevel.SELECT_YEAR:
        return getYearScreenContent();
      case DateMenuLevel.SELECT_MONTH:
        return getMonthScreenContent();
      case DateMenuLevel.SELECT_HALF:
        return getHalfScreenContent();
      case DateMenuLevel.SELECT_WEEK:
        return getWeekScreenContent();
      case DateMenuLevel.INITIAL:
      default:
        return getInitialScreenContent();
    }
  }

  return getContent();
}

export default MenuContentCustomDateRange;