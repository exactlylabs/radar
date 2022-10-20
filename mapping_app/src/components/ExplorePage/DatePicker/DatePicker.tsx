import {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/DatePicker.style";
import CloseIcon from '../../../assets/close-icon.png';
import YearSelector from "./YearSelector";
import DateRangeSelector from "./DateRangeSelector";
import ApplyDateRangeButton from "./ApplyDateRangeButton";
import {
  dateTabs,
  getCurrentWeekLimits,
  getWeekLimits,
  getWeekNumber,
  halves,
  months,
  quarters,
  years
} from "../../../utils/filters";

interface DatePickerProps {

}

const DatePicker = ({

}: DatePickerProps): ReactElement => {

  const [selectedYear, setSelectedYear] = useState(years[0]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedWeek, setSelectedWeek] = useState(getWeekNumber());
  const [selectedTab, setSelectedTab] = useState(dateTabs.WEEK);
  const [selectedRangeValue, setSelectedRangeValue] = useState<string | number>(months[0]);
  const [subtitleText, setSubtitleText] = useState('');

  useEffect(() => {
    if(selectedYear === years[0]) {
      setSelectedRangeValue(getDefaultValueForTab());
      setSubtitleText(getDefaultSubtitleTextForTab());
    }
  }, [selectedTab]);

  useEffect(() => {
    setSelectedRangeValue(getWeekLimits(selectedYear, selectedWeek));
    setSubtitleText(`Week: ${selectedWeek}`);
  }, [selectedWeek]);

  const getDefaultValueForTab = (): string | number => {
    switch (selectedTab) {
      case dateTabs.MONTH:
        return months[0];
      case dateTabs.WEEK:
        return getCurrentWeekLimits();
      case dateTabs.QUARTER:
        return quarters[0];
      case dateTabs.HALF_YEAR:
        return halves[0];
      default:
        return months[0];
    }
  }

  const getDefaultSubtitleTextForTab = () => {
    let subtitle: string = '';
    switch (selectedTab) {
      case dateTabs.WEEK:
        subtitle = `Week ${getWeekNumber()}`;
        break;
      case dateTabs.QUARTER:
        subtitle = 'Q1';
        break;
      case dateTabs.HALF_YEAR:
        subtitle = 'H1';
        break;
      default:
        break;
    }
    return subtitle;
  }

  return (
    <div style={styles.DatePickerContainer}>
      <div style={styles.TitleContainer}>
        <p className={'fw-medium'} style={styles.Title}>Select custom range</p>
        <img className={'hover-opaque'} src={CloseIcon} style={styles.CloseIcon} alt={'close-icon'}/>
      </div>
      <div style={styles.YearSelectorContainer}>
        <p className={'fw-regular'} style={styles.Label}>Choose a year</p>
        <YearSelector selectedYear={selectedYear}
                      setSelectedYear={setSelectedYear}
        />
      </div>
      <div style={styles.DateRangeSelectorContainer}>
        <p className={'fw-regular'} style={styles.Label}>Choose a date range</p>
        <DateRangeSelector selectedTab={selectedTab}
                           setSelectedRange={setSelectedTab}
                           selectedRangeValue={selectedRangeValue}
                           setSelectedRangeValue={setSelectedRangeValue}
                           subtitleText={subtitleText}
                           selectedYear={selectedYear}
                           selectedWeek={selectedWeek}
                           selectedMonth={selectedMonth}
                           setSelectedYear={setSelectedYear}
                           setSelectedMonth={setSelectedMonth}
                           setSelectedWeek={setSelectedWeek}
        />
      </div>
      <ApplyDateRangeButton/>
    </div>
  )
}

export default DatePicker;