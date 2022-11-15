import {ReactElement, useState} from "react";
import {styles} from "./styles/MenuContentCustomRange.style";
import GoBackIcon from '../../../../assets/go-back-arrow-icon.png';
import ChevronRight from '../../../../assets/chevron-right.png';
import MyFullWidthButton from "../../MyFullWidthButton";
import DateRangeSelectorTabs from "../../../ExplorePage/DatePicker/DateRangeSelectorTabs";
import {dateTabs, halves, months, tabs, years} from "../../../../utils/filters";
import {
  DatePickerState,
  getCurrentMonth,
  getFirstDayOfLastWeek,
  getMonthNumberFromName,
  getWeekLimits,
  getWeekNumber
} from "../../../../utils/dates";
import {getMenuContent, MenuContent} from "../menu";
import {useContentMenu} from "../../../../hooks/useContentMenu";
import MenuContentYearOrMonth from "../MenuContentYearOrMonth/MenuContentYearOrMonth";
import {isNumber, isString, Optional} from "../../../../utils/types";
import MenuContentHalf from "../MenuContentHalf/MenuContentHalf";
import MenuContentWeek from "../MenuContentWeek/MenuContentWeek";

enum DateMenuLevel {
  INITIAL = 'INITIAL',
  SELECT_YEAR = 'SELECT_YEAR',
  SELECT_MONTH = 'SELECT_MONTH',
  SELECT_HALF = 'SELECT_HALF',
  SELECT_WEEK = 'SELECT_WEEK'
}

interface MenuContentCustomDateRangeProps {
  goBack: () => void;
  applyRanges: (queryString: string) => void;
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

  const applyChanges = () => {
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
    applyRanges(dateQuery);
  }

  const handleSelectTab = (newTab: string) => {
    setSelectedTab(newTab);
    if(newTab === dateTabs.WEEK) {
      setInnerValue(getWeekLimits(selectedYear, selectedWeek));
      setSubtitleText(`Week: ${selectedWeek}`);
    } else if(newTab === dateTabs.MONTH) {
      setInnerValue(months[0]);
      setSubtitleText('');
    } else if(newTab === dateTabs.HALF_YEAR) {
      setInnerValue(halves[0]);
      setSubtitleText('H1');
    }
  }

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
  const goToYearSelectionScreen = () => setCurrentLevel(DateMenuLevel.SELECT_YEAR);

  const goToSpecificTabPage = () => {
    let level: DateMenuLevel;
    switch (selectedTab) {
      case dateTabs.MONTH:
        level = DateMenuLevel.SELECT_MONTH;
        break;
      case dateTabs.HALF_YEAR:
        level = DateMenuLevel.SELECT_HALF;
        break;
      case dateTabs.WEEK:
        level = DateMenuLevel.SELECT_WEEK;
        break;
      default:
        level = currentLevel;
        break;
    }
    setCurrentLevel(level);
  }

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
    <div style={styles.MenuContentCustomRange}>
      <img src={GoBackIcon}
           style={styles.GoBackIcon}
           alt={'go-back'}
           onClick={goBack}
      />
      <p className={'fw-medium'} style={styles.Title}>Select custom range</p>
      <p className={'fw-regular'} style={styles.Subtitle}>Choose a year</p>
      <div style={styles.YearSelectorContainer} onClick={goToYearSelectionScreen}>
        <p>{selectedYear}</p>
        <img src={ChevronRight} style={styles.Chevron} alt={'chevron-right'}/>
      </div>
      <p className={'fw-regular'} style={styles.Subtitle}>Choose a date range</p>
      <div style={styles.PickersContainer}>
        <DateRangeSelectorTabs selectedTab={selectedTab} selectDateTab={handleSelectTab}/>
        <div style={styles.DateRangeSelector} onClick={goToSpecificTabPage}>
          <div>
            <p className={'fw-regular'} style={styles.SelectedRangeTitle}>{innerValue}</p>
            {subtitleText && <p className={'fw-light'} style={styles.SelectedRangeSubtitle}>{subtitleText}</p>}
          </div>
          <img src={ChevronRight} style={styles.Chevron} alt={'chevron-right'}/>
        </div>
      </div>
      <MyFullWidthButton text={'Apply'} onClick={applyChanges}/>
    </div>
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