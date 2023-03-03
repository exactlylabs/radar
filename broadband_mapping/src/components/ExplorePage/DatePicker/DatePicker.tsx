import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/DatePicker.style";
import CloseIcon from '../../../assets/close-icon.png';
import YearSelector from "./YearSelector";
import DateRangeSelector from "./DateRangeSelector";
import ApplyDateRangeButton from "./ApplyDateRangeButton";
import {
  DateTabs, getQuarterValueFromCompleteRange, getSemesterFromSelectedQ, getSubtitleForHalf, getSubtitleForQuarter,
  halves,
  months,
  Quarters,
  QuartersDateRanges,
  years
} from "../../../utils/filters";
import {
  DateFilter,
  DatePickerState,
  getCurrentMonth,
  getFirstDayOfLastWeek,
  getMonthNumberFromName,
  getWeekLimits,
  getWeekNumber
} from "../../../utils/dates";
import {Optional} from "../../../utils/types";

interface DatePickerProps {
  closeDatePicker: () => void;
  applyRanges: (dateObject: DateFilter) => void;
  initialState: Optional<DatePickerState>;
}

const DatePicker = ({
  closeDatePicker,
  applyRanges,
  initialState
}: DatePickerProps): ReactElement => {

  const [selectedYear, setSelectedYear] = useState(initialState?.selectedYear ?? years[0]);
  const [selectedMonth, setSelectedMonth] = useState(initialState?.selectedMonth ?? new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState(initialState?.selectedWeek ?? getWeekNumber(getFirstDayOfLastWeek()));
  const [selectedTab, setSelectedTab] = useState(initialState?.selectedTab ?? DateTabs.WEEK);
  const [selectedRangeValue, setSelectedRangeValue] = useState<string | number>(initialState?.selectedRangeValue ?? months[0]);
  const [subtitleText, setSubtitleText] = useState(initialState?.subtitleText ?? '');

  useEffect(() => {
    if(selectedTab === DateTabs.HALF_YEAR) {
      setSubtitleText(getSubtitleForHalf(selectedRangeValue as string));
    } else if(selectedTab === DateTabs.QUARTER) {
      setSubtitleText(getSubtitleForQuarter(selectedRangeValue as string));
    }
  }, [selectedRangeValue]);

  const handleChangeYear = (newYear: number) => {
    setSelectedYear(newYear);
    const newWeek = newYear === years[0] ? getWeekNumber() : 1;
    const newMonth = newYear === years[0] ? getCurrentMonth() : 0;
    setSelectedMonth(newMonth);
    setSelectedWeek(newWeek);
    if(DateTabs.WEEK === selectedTab) {
      setSelectedRangeValue(getWeekLimits(newYear, newWeek));
      setSubtitleText(`Week: ${newWeek}`);
    }
  }

  const handleChangeWeek = (newWeek: number, year: number, month: number) => {
    if(selectedYear !== year) setSelectedYear(year);
    if(selectedMonth !== month) setSelectedMonth(month);
    setSelectedWeek(newWeek);
    setSelectedRangeValue(getWeekLimits(year, newWeek));
    setSubtitleText(`Week: ${newWeek}`);
  }

  const applyDateRange = () => {
    let dateObject: DateFilter = {selectedYear};
    switch (selectedTab) {
      case DateTabs.MONTH:
        if(selectedRangeValue !== months[0]) {
          dateObject.selectedMonth = getMonthNumberFromName(selectedRangeValue as string);
        }
        break;
      case DateTabs.HALF_YEAR:
        dateObject.selectedSemester = subtitleText === 'H1' ? 1 : 2;
        break;
      case DateTabs.WEEK:
        dateObject.selectedWeek = selectedWeek - 1;
        break;
      case DateTabs.QUARTER:
        dateObject.selectedQuarter = getSemesterFromSelectedQ(selectedRangeValue as string);
        break;
    }
    applyRanges(dateObject);
  }

  const handleSelectTab = (newTab: string) => {
    setSelectedTab(newTab);
    switch (newTab) {
      case DateTabs.WEEK:
        setSelectedRangeValue(getWeekLimits(selectedYear, selectedWeek));
        setSubtitleText(`Week: ${selectedWeek}`);
        break;
      case DateTabs.MONTH:
        setSelectedRangeValue(months[0]);
        setSubtitleText('');
        break;
      case DateTabs.QUARTER:
        setSelectedRangeValue(Quarters.Q1);
        setSubtitleText(QuartersDateRanges.Q1);
        break;
      case DateTabs.HALF_YEAR:
        setSelectedRangeValue(halves[0]);
        setSubtitleText('H1');
        break;
    }
  }

  const handleSelectDateRangeValue = (value: string | number) => {
    if(selectedTab === DateTabs.QUARTER) {
      setSelectedRangeValue(getQuarterValueFromCompleteRange(value as string))
    } else {
      setSelectedRangeValue(value);
    }
  }

  return (
    <div style={styles.DatePickerContainer}>
      <div style={styles.TitleContainer}>
        <p className={'fw-medium'} style={styles.Title}>Select custom range</p>
        <img className={'hover-opaque'} src={CloseIcon} style={styles.CloseIcon} alt={'close-icon'} onClick={closeDatePicker}/>
      </div>
      <div style={styles.YearSelectorContainer}>
        <p className={'fw-regular'} style={styles.Label}>Choose a year</p>
        <YearSelector selectedYear={selectedYear}
                      setSelectedYear={handleChangeYear}
        />
      </div>
      <div style={styles.DateRangeSelectorContainer}>
        <p className={'fw-regular'} style={styles.Label}>Choose a date range</p>
        <DateRangeSelector selectedTab={selectedTab}
                           setSelectedRange={handleSelectTab}
                           selectedRangeValue={selectedRangeValue}
                           setSelectedRangeValue={handleSelectDateRangeValue}
                           subtitleText={subtitleText}
                           selectedYear={selectedYear}
                           selectedWeek={selectedWeek}
                           selectedMonth={selectedMonth}
                           setSelectedMonth={setSelectedMonth}
                           setSelectedWeek={handleChangeWeek}
        />
      </div>
      <ApplyDateRangeButton onClick={applyDateRange}/>
    </div>
  )
}

export default DatePicker;