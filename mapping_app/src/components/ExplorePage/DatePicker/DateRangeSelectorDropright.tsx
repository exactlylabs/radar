import {ReactElement, useState} from "react";
import {styles} from "./styles/DateRangeSelectorDropright.style";
import ChevronRight from "../../../assets/chevron-right.png";
import {dateTabs, halves, months, quarters, years} from "../../../utils/filters";
import OptionsDropright from "./OptionsDropright";
import WeekPicker from "./WeekPicker";

interface DateRangeSelectorDroprightProps {
  selectedTab: string;
  selectedDateRange: string | number;
  setSelectedDateRange: (value: string | number) => void;
  subtitle?: string;
  selectedYear: number;
  selectedMonth: number;
  selectedWeek: number;
  setSelectedMonth: (newMonth: number) => void;
  setSelectedWeek: (newWeek: number, year: number, month: number) => void;
}

const DateRangeSelectorDropright = ({
  selectedTab,
  selectedDateRange,
  setSelectedDateRange,
  subtitle,
  selectedYear,
  selectedMonth,
  selectedWeek,
  setSelectedMonth,
  setSelectedWeek
}: DateRangeSelectorDroprightProps): ReactElement => {

  const [isDroprightOpen, setIsDroprightOpen] = useState(false);

  const toggleDropright = () => setIsDroprightOpen(!isDroprightOpen);

  const getMonths = () => {
    if(selectedYear === 2009) return [months[0], ...months.slice(4)]; // 2009 only has data since April - months[0] is 'All months'
    else return months;
  }

  const getMonthContent = () => (
    <>
      <div className={'hover-opaque'} style={styles.YearSelectorContent}>
        <p className={'fw-regular'} style={styles.Title}>{selectedDateRange}</p>
        <img src={ChevronRight} style={styles.Chevron} alt={'chevron-right'}/>
      </div>
      {
        isDroprightOpen &&
        <OptionsDropright options={getMonths()}
                          selectedOption={selectedDateRange}
                          setSelectedOption={setSelectedDateRange}
        />
      }
    </>
  )

  const getWeekContent = () => (
    <>
      <div className={'hover-opaque'} style={styles.YearSelectorContent}>
        <div style={styles.TextContainer}>
          <p className={'fw-regular'} style={styles.Title}>{selectedDateRange}</p>
          <p className={'fw-regular'} style={styles.Subtitle}>{subtitle}</p>
        </div>
        <img src={ChevronRight} style={styles.Chevron} alt={'chevron-right'}/>
      </div>
      { isDroprightOpen &&
        <WeekPicker selectedMonth={selectedMonth}
                    selectedYear={selectedYear}
                    selectedWeek={selectedWeek}
                    setSelectedMonth={setSelectedMonth}
                    setSelectedWeek={setSelectedWeek}
        />
      }
    </>
  )

  const getQuarterContent = () => (
    <>
      <div className={'hover-opaque'} style={styles.YearSelectorContent}>
        <div style={styles.TextContainer}>
          <p className={'fw-regular'} style={styles.Title}>{selectedDateRange}</p>
          <p className={'fw-regular'} style={styles.Subtitle}>{subtitle}</p>
        </div>
        <img src={ChevronRight} style={styles.Chevron} alt={'chevron-right'}/>
      </div>
      {
        isDroprightOpen &&
        <OptionsDropright options={quarters}
                          selectedOption={selectedDateRange}
                          setSelectedOption={setSelectedDateRange}
                          bottomAligned
        />
      }
    </>
  )

  const getHalfyearContent = () => (
    <>
      <div className={'hover-opaque'} style={styles.YearSelectorContent}>
        <div style={styles.TextContainer}>
          <p className={'fw-regular'} style={styles.Title}>{selectedDateRange}</p>
          <p className={'fw-regular'} style={styles.Subtitle}>{subtitle}</p>
        </div>
        <img src={ChevronRight} style={styles.Chevron} alt={'chevron-right'}/>
      </div>
      {
        isDroprightOpen &&
        <OptionsDropright options={halves}
                          selectedOption={selectedDateRange}
                          setSelectedOption={setSelectedDateRange}
                          bottomAligned
        />
      }
    </>
  )

  const getContent = () => {
    switch (selectedTab) {
      case dateTabs.MONTH:
        return getMonthContent();
      case dateTabs.WEEK:
        return getWeekContent();
      // TODO: Once Qs are supported on the backed, uncomment
      /*case dateTabs.QUARTER:
        return getQuarterContent();*/
      case dateTabs.HALF_YEAR:
        return getHalfyearContent();
      default:
        return getMonthContent();
    }
  }

  return (
    <div style={styles.DateRangeSelectorDropright} onClick={toggleDropright}>
      {getContent()}
    </div>
  )
}

export default DateRangeSelectorDropright;