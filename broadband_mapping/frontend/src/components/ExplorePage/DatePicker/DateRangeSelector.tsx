import {ReactElement} from "react";
import {styles} from "./styles/DateRangeSelector.style";
import DateRangeSelectorTabs from "./DateRangeSelectorTabs";
import DateRangeSelectorDropright from "./DateRangeSelectorDropright";

interface DateRangeSelectorProps {
  selectedTab: string;
  setSelectedRange: (range: string) => void;
  selectedRangeValue: string | number;
  setSelectedRangeValue: (value: string | number) => void;
  subtitleText?: string;
  selectedYear: number;
  selectedMonth: number;
  selectedWeek: number;
  setSelectedMonth: (newMonth: number) => void;
  setSelectedWeek: (newWeek: number, year: number, month: number) => void;
}

const DateRangeSelector = ({
  selectedTab,
  setSelectedRange,
  selectedRangeValue,
  setSelectedRangeValue,
  subtitleText,
  selectedYear,
  selectedMonth,
  selectedWeek,
  setSelectedMonth,
  setSelectedWeek
}: DateRangeSelectorProps): ReactElement => {
  return (
    <div style={styles.DateRangeSelector}>
      <DateRangeSelectorTabs selectedTab={selectedTab}
                             selectDateTab={setSelectedRange}/>
      <DateRangeSelectorDropright selectedTab={selectedTab}
                                  selectedDateRange={selectedRangeValue}
                                  setSelectedDateRange={setSelectedRangeValue}
                                  subtitle={subtitleText}
                                  selectedYear={selectedYear}
                                  selectedMonth={selectedMonth}
                                  selectedWeek={selectedWeek}
                                  setSelectedMonth={setSelectedMonth}
                                  setSelectedWeek={setSelectedWeek}
      />
    </div>
  )
}

export default DateRangeSelector;