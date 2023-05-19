import React, {ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/WeekPicker.style";
import ChevronRight from '../../../assets/chevron-right.png';
import ChevronLeft from '../../../assets/chevron-left.png';
import WeekPickerRow from "./WeekPickerRow";
import {years} from "../../../utils/filters";
import {Day, getLastWeek, getMonthCalendar, getMonthName} from "../../../utils/dates";
import {useViewportSizes} from "../../../hooks/useViewportSizes";

interface WeekPickerProps {
  selectedMonth: number;
  selectedYear: number;
  selectedWeek: number;
  setSelectedMonth: (newMonth: number) => void;
  setSelectedWeek: (newWeek: number, year: number, month: number) => void;
}

const WeekPicker = ({
  selectedMonth,
  selectedYear,
  selectedWeek,
  setSelectedMonth,
  setSelectedWeek,
}: WeekPickerProps): ReactElement => {

  const {isSmallScreen, isTabletScreen} = useViewportSizes();
  const isSmall = isSmallScreen || isTabletScreen;

  const [weekDays, setWeekDays] = useState<Array<Day>>([]);
  const [weekPickerInternalYear, setWeekPickerInternalYear] = useState(selectedYear);

  useEffect(() => {
    setWeekDays(getMonthCalendar(weekPickerInternalYear, selectedMonth));
  }, [selectedMonth, weekPickerInternalYear]);

  const getTitle = () => `${getMonthName(selectedMonth)} ${weekPickerInternalYear}`;

  const getWeeks = () => {
    let weeks: Array<Array<Day>> = [];
    let currentWeek = -1;
    weekDays.forEach((day, index) => {
      if(index % 7 === 0) {
        weeks.push([]);
        currentWeek++;
      }
      weeks[currentWeek].push(day);
    });
    return weeks.map((week, index) => (
      <WeekPickerRow key={week[index].week}
                     elements={week}
                     selected={selectedWeek === week[0].week && !!week.find(day => day.year === selectedYear)} // we need find() here because for example first week of the year might have both elements from the current year as well as last year, so 2 possible year values, so we check to see if there is any day with the same year as the one selected
                     currentMonth={selectedMonth}
                     setSelectedWeek={handleSelectWeek}
                     disabled={weekPickerInternalYear === years[0] ? week[0].week > getLastWeek() : false}
      />
    ));
  }

  const handleSelectWeek = (newWeek: number, newMonth: number) => {
    setSelectedWeek(newWeek, weekPickerInternalYear, newMonth);
  }

  const goBackOneMonth = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if(selectedMonth === 0) {
      setWeekPickerInternalYear(prevYear => prevYear - 1);
      setSelectedMonth(11);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  }

  const goForwardOneMonth = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if(selectedMonth === 11) {
      setWeekPickerInternalYear(prevYear => prevYear + 1);
      setSelectedMonth(0);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  }

  const isBackDisabled = () => {
    // not allow user to back to a date before current data
    return selectedMonth === 0 && weekPickerInternalYear === years[years.length - 1];
  }

  const isForwardDisabled = () => {
    // not allow user to back to a date after current data
    const today: Date = new Date();
    return selectedMonth === today.getMonth() && weekPickerInternalYear === today.getFullYear();
  }

  return (
    <div style={styles.WeekPicker(isSmall)}>
      <div style={styles.MonthSelector}>
        <img className={'hover-opaque'}
             src={ChevronLeft}
             style={styles.Chevron(isBackDisabled())}
             alt={'chevron-left'}
             onClick={isBackDisabled() ? undefined : goBackOneMonth}
        />
        <p className={'fw-regular'} style={styles.MonthTitle}>{getTitle()}</p>
        <img className={'hover-opaque'}
             src={ChevronRight}
             style={styles.Chevron(isForwardDisabled())}
             alt={'chevron-left'}
             onClick={isForwardDisabled() ? undefined : goForwardOneMonth}
        />
      </div>
      <WeekPickerRow elements={['S', 'M', 'T', 'W', 'T', 'F', 'S']}
                     disabled
                     selected={false}
                     header
                     currentMonth={selectedMonth}
      />
      {getWeeks()}
    </div>
  )
}

export default WeekPicker;