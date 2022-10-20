import React, {MouseEventHandler, ReactElement, useEffect, useState} from "react";
import {styles} from "./styles/WeekPicker.style";
import ChevronRight from '../../../assets/chevron-right.png';
import ChevronLeft from '../../../assets/chevron-left.png';
import WeekPickerRow from "./WeekPickerRow";
import {getLastWeek, getMonthName, getWeekNumber, years} from "../../../utils/filters";
import {Day} from "../../../utils/dates";

interface WeekPickerProps {
  selectedMonth: number;
  selectedYear: number;
  selectedWeek: number;
  setSelectedMonth: (newMonth: number) => void;
  setSelectedYear: (newYear: number) => void;
  setSelectedWeek: (newWeek: number) => void;
}

const WeekPicker = ({
  selectedMonth,
  selectedYear,
  selectedWeek,
  setSelectedMonth,
  setSelectedYear,
  setSelectedWeek,
}: WeekPickerProps): ReactElement => {

  const [weekDays, setWeekDays] = useState<Array<Day>>([]);

  useEffect(() => {
    let monthDays: Array<Day> = [];
    const startingDay = new Date(selectedYear, selectedMonth, 1);
    monthDays.push({
      dayNumber: startingDay.getDate(),
      month: startingDay.getMonth(),
      year: startingDay.getFullYear(),
      week: getWeekNumber(startingDay),
    });
    // Fill in the first week of the month backwards
    let weekDay = startingDay.getDay();
    let dayCount = 1;
    let dayObject: Day;
    while(weekDay > 0) {
      let day = new Date(startingDay);
      day.setDate(day.getDate() - dayCount);
      const prevDay = new Date(day);
      dayObject = {
        dayNumber: prevDay.getDate(),
        month: prevDay.getMonth(),
        year: prevDay.getFullYear(),
        week: getWeekNumber(prevDay),
      }
      monthDays = [dayObject, ...monthDays];
      dayCount++;
      weekDay--;
    }
    // Fill in the rest of the month
    let currentDay = new Date(selectedYear, selectedMonth, 2);
    while(currentDay.getMonth() === selectedMonth) {
      const monthDay = new Date(currentDay);
      dayObject = {
        dayNumber: monthDay.getDate(),
        month: monthDay.getMonth(),
        year: monthDay.getFullYear(),
        week: getWeekNumber(monthDay),
      }
      monthDays.push(dayObject);
      currentDay.setDate(currentDay.getDate() + 1);
    }
    // first day of next month is mid-week (AKA not sunday)
    if(currentDay.getDay() !== 0) {
      while(currentDay.getDay() !== 0) {
        const remainingDay = new Date(currentDay);
        dayObject = {
          dayNumber: remainingDay.getDate(),
          month: remainingDay.getMonth(),
          year: remainingDay.getFullYear(),
          week: getWeekNumber(remainingDay),
        }
        monthDays.push(dayObject);
        currentDay.setDate(currentDay.getDate() + 1);
      }
    }
    setWeekDays(monthDays);
  }, [selectedMonth, selectedYear]);

  const getTitle = () => `${getMonthName(selectedMonth)} - ${selectedYear}`;

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
                     selected={selectedWeek === week[0].week}
                     currentMonth={selectedMonth}
                     setSelectedWeek={setSelectedWeek}
                     disabled={week[0].week > getLastWeek()}
      />
    ));
  }

  const goBackOneMonth = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if(selectedMonth === 0) {
      setSelectedYear(selectedYear - 1);
      setSelectedMonth(11);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  }

  const goForwardOneMonth = (e: React.MouseEvent<HTMLImageElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if(selectedMonth === 11) {
      setSelectedYear(selectedYear + 1);
      setSelectedMonth(0);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  }

  const isBackDisabled = () => {
    // not allow user to back to a date before current data
    return selectedMonth === 0 && selectedYear === years[years.length - 1];
  }

  const isForwardDisabled = () => {
    // not allow user to back to a date after current data
    const today: Date = new Date();
    return selectedMonth === today.getMonth() && selectedYear === today.getFullYear();
  }

  return (
    <div style={styles.WeekPicker}>
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