import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/DatePicker.style";
import CloseIcon from '../../../assets/close-icon.png';
import YearSelector from "./YearSelector";
import DateRangeSelector from "./DateRangeSelector";
import ApplyDateRangeButton from "./ApplyDateRangeButton";
import {
  dateTabs,
  halves,
  months,
  quarters,
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
  const [selectedTab, setSelectedTab] = useState(initialState?.selectedTab ?? dateTabs.WEEK);
  const [selectedRangeValue, setSelectedRangeValue] = useState<string | number>(initialState?.selectedRangeValue ?? months[0]);
  const [subtitleText, setSubtitleText] = useState(initialState?.subtitleText ?? '');

  useEffect(() => {
    if(selectedTab === dateTabs.HALF_YEAR) {
      setSubtitleText(getSubtitleForHalf(selectedRangeValue as string));
    }
  }, [selectedRangeValue]);

  const handleChangeYear = (newYear: number) => {
    setSelectedYear(newYear);
    const newWeek = newYear === years[0] ? getWeekNumber() : 1;
    const newMonth = newYear === years[0] ? getCurrentMonth() : 0;
    setSelectedMonth(newMonth);
    setSelectedWeek(newWeek);
    if(dateTabs.WEEK === selectedTab) {
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
    //let dateQuery = `&year=${selectedYear}`;
    let dateObject: DateFilter = {selectedYear};
    switch (selectedTab) {
      case dateTabs.MONTH:
        if(selectedRangeValue !== months[0]) {
          dateObject.selectedMonth = getMonthNumberFromName(selectedRangeValue as string) + 1;
        }
        break;
      case dateTabs.HALF_YEAR:
        dateObject.selectedSemester = subtitleText === 'H1' ? 1 : 2;
        break;
      case dateTabs.WEEK:
        dateObject.selectedWeek = selectedWeek - 1;
        break;
    }
    console.log('date Object', dateObject);
    applyRanges(dateObject);
  }

  const getSubtitleForHalf = (halfRange: string): string => {
    return halfRange === halves[0] ? 'H1' : 'H2';
  }

  const handleSelectTab = (newTab: string) => {
    setSelectedTab(newTab);
    if(newTab === dateTabs.WEEK) {
      setSelectedRangeValue(getWeekLimits(selectedYear, selectedWeek));
      setSubtitleText(`Week: ${selectedWeek}`);
    } else if(newTab === dateTabs.MONTH) {
      setSelectedRangeValue(months[0]);
      setSubtitleText('');
    } else if(newTab === dateTabs.HALF_YEAR) {
      setSelectedRangeValue(halves[0]);
      setSubtitleText('H1');
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
                           setSelectedRangeValue={setSelectedRangeValue}
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