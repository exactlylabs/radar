import {ReactElement, useState} from "react";
import {isNumber, isString, Optional} from "../../../../utils/types";
import {
  DateFilter,
  DateMenuLevel,
  DatePickerState,
  getCurrentMonth,
  getFirstDayOfLastWeek,
  getMonthNumberFromName,
  getWeekLimits,
  getWeekNumber
} from "../../../../utils/dates";
import {
  applyChanges,
  DateTabs,
  getSubtitleForQuarter,
  halves,
  months,
  Quarters,
  years
} from "../../../../utils/filters";
import GoBackIcon from "../../../../assets/go-back-arrow-icon.png";
import ChevronRight from "../../../../assets/chevron-right.png";
import DateRangeSelectorTabs from "../../../ExplorePage/DatePicker/DateRangeSelectorTabs";
import {styles} from "./styles/ModalContentCustomDateRange.style";
import ModalContentHalf from "../ModalContentHalf/ModalContentHalf";
import ModalContentWeek from "../ModalContentWeek/ModalContentWeek";
import ModalContentYearOrMonth from "../ModalContentYearOrMonth/ModalContentYearOrMonth";
import CustomFullWidthButton from "../../CustomFullWidthButton";
import ModalContentQuarter from "../ModalContentQuarter/ModalContentQuarter";

interface ModalContentCustomDateRangeProps {
  goBack: () => void;
  applyRanges: (dateObject: DateFilter) => void;
  initialState: Optional<DatePickerState>;
  closeModal: () => void;
}

const ModalContentCustomDateRange = ({
  goBack,
  applyRanges,
  initialState,
  closeModal
}: ModalContentCustomDateRangeProps): ReactElement => {

  const [currentLevel, setCurrentLevel] = useState<DateMenuLevel>(DateMenuLevel.INITIAL);
  const [selectedTab, setSelectedTab] = useState<string>(initialState?.selectedTab ?? DateTabs.MONTH);
  const [subtitleText, setSubtitleText] = useState<string>(initialState?.subtitleText ?? '');
  const [innerValue, setInnerValue] = useState<string | number>(initialState?.selectedRangeValue ?? months[0]);
  const [selectedYear, setSelectedYear] = useState(initialState?.selectedYear ?? years[0]);
  const [selectedMonth, setSelectedMonth] = useState(initialState?.selectedMonth ?? new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState(initialState?.selectedWeek ?? getWeekNumber(getFirstDayOfLastWeek()));

  const handleSelectTab = (newTab: string) => {
    setSelectedTab(newTab);
    if(newTab === DateTabs.WEEK) {
      setInnerValue(getWeekLimits(selectedYear, selectedWeek));
      setSubtitleText(`Week: ${selectedWeek}`);
    } else if(newTab === DateTabs.MONTH) {
      setInnerValue(months[0]);
      setSubtitleText('');
    } else if(newTab === DateTabs.HALF_YEAR) {
      setInnerValue(halves[0]);
      setSubtitleText('H1');
    } else if(newTab === DateTabs.QUARTER) {
      setInnerValue(Quarters.Q1);
      setSubtitleText(getSubtitleForQuarter(Quarters.Q1));
    }
  }

  const handleChangeYear = (newYear: number) => {
    setSelectedYear(newYear);
    const newWeek = newYear === years[0] ? getWeekNumber() : 1;
    const newMonth = newYear === years[0] ? getCurrentMonth() : 0;
    setSelectedMonth(newMonth);
    setSelectedWeek(newWeek);
    if(DateTabs.WEEK === selectedTab) {
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
      case DateTabs.MONTH:
        level = DateMenuLevel.SELECT_MONTH;
        break;
      case DateTabs.HALF_YEAR:
        level = DateMenuLevel.SELECT_HALF;
        break;
      case DateTabs.WEEK:
        level = DateMenuLevel.SELECT_WEEK;
        break;
      case DateTabs.QUARTER:
        level = DateMenuLevel.SELECT_QUARTER;
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

  const handleSelectQuarter = (option: string) => {
    setInnerValue(option);
    setSubtitleText(getSubtitleForQuarter(option));
  }

  const handleOnClick = () => {
    applyChanges(selectedYear, selectedWeek, selectedTab, innerValue, subtitleText, applyRanges);
    closeModal();
  }

  const getInitialScreenContent = () => (
    <div style={styles.ModalContentCustomDateRange}>
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
      <CustomFullWidthButton text={'Apply'} onClick={handleOnClick}/>
    </div>
  )

  const getYearScreenContent = () => (
    <ModalContentYearOrMonth type={'year'}
                             options={years}
                             goBack={goToInitialLevel}
                             selectedOption={selectedYear}
                             setSelectedOption={handleSelectYear}
    />
  );

  const getMonthScreenContent = () => (
    <ModalContentYearOrMonth type={'month'}
                             options={months}
                             goBack={goToInitialLevel}
                             selectedOption={innerValue}
                             setSelectedOption={handleSelectMonth}
    />
  )

  const getHalfScreenContent = () => (
    <ModalContentHalf goBack={goToInitialLevel}
                      selectedOption={innerValue as string}
                      setSelectedOption={handleSelectHalfyear}
    />
  )

  const getQuarterScreenContent = () => (
    <ModalContentQuarter goBack={goToInitialLevel}
                         selectedOption={innerValue as string}
                         setSelectedOption={handleSelectQuarter}
    />
  )

  const getWeekScreenContent = () => (
    <ModalContentWeek goBack={goToInitialLevel}
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
      case DateMenuLevel.SELECT_QUARTER:
        return getQuarterScreenContent();
      case DateMenuLevel.INITIAL:
      default:
        return getInitialScreenContent();
    }
  }

  return getContent();
}

export default ModalContentCustomDateRange;