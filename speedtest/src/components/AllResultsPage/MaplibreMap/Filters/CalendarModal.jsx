import {useContext, useEffect, useState} from "react";
import styles from './calendar_modal.module.css';
import leftArrow from '../../../../assets/icons-simple-left-arrow.png';
import rightArrow from '../../../../assets/icons-simple-right-arrow.png';
import filtersPanelStyles from '../filters_panel.module.css';
import FiltersContext from "../../../../context/FiltersContext";
import {setMidnight} from "../../../../utils/dates";

function CalendarModalInput({error, label, date, setDate}) {

  /**
   * @param date: Date object
   * @returns {string in the format 'yyyy-mm-dd'}
   */
  const parseDate = (date) => {
    if(date === '') return '';
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${year}-${month < 10 ? '0' + month : month}-${day < 10 ? '0' + day : day}`;
  }

  return (
    <div className={styles.inputContainer}>
      <label className={styles.inputLabel} htmlFor={label.replace(' ', '_')}>{label}</label>
      <input type={'date'}
        className={styles.input}
        id={label.replace(' ', '_')}
        value={parseDate(date)}
        onChange={setDate}
        data-error={error}
      />
    </div>
  )
}

function MonthView({handleClickDay, startDate, endDate, monthInView, yearInView}) {

  const generateMonthlyCalendar = () => {
    const daysInMonth = new Date(yearInView, monthInView + 1, 0).getDate();
    let firstDate = new Date(yearInView, monthInView, 1);
    const lastDate = new Date(yearInView, monthInView, daysInMonth);
    const days = Array
      .from({length: daysInMonth}, (_, i) => i + 1)
      .map(day => setMidnight(new Date(firstDate.setDate(day))));
    firstDate = new Date(yearInView, monthInView, 1);
    const daysFromFirstDayUntilLastMonday = firstDate.getDay() === 0 ? 6 : firstDate.getDay() - 1;
    const daysFromLastDayUntilNextSunday = lastDate.getDay() === 0 ? 0 : 7 - lastDate.getDay();
    const daysFromPreviousMonth = Array
      .from({length: daysFromFirstDayUntilLastMonday},
      (_) => setMidnight(new Date(firstDate.setDate(firstDate.getDate() - 1))))
      .reverse();
    const daysFromNextMonth = Array
      .from({length: daysFromLastDayUntilNextSunday},
      (_) => setMidnight(new Date(lastDate.setDate(lastDate.getDate() + 1))));
    return (
      <div className={styles.monthContainer}>
        <div className={styles.dayTitles}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className={styles.dayOfWeek}>{day}</div>
          ))}
        </div>
        <div className={styles.calendar} data-has-end-set={endDate !== ''}>
          {daysFromPreviousMonth.map(day => (
            <div key={day}
              className={styles.day}
              data-day={day}
              data-start-date={startDate !== '' && startDate.getTime() === day.getTime()}
              data-end-date={endDate !== '' && endDate.getTime() === day.getTime()}
              data-in-between={startDate !== '' && endDate !== '' && startDate.getTime() < day.getTime() && endDate.getTime() > day.getTime()}
              data-outside-month={true}
              onClick={handleClickDay}
            >{day.getDate()}</div>
          ))}
          {days.map(day => (
            <div key={day}
              className={styles.day}
              data-day={day}
              data-start-date={startDate !== '' && startDate.getTime() === day.getTime()}
              data-end-date={endDate !== '' && endDate.getTime() === day.getTime()}
              data-in-between={startDate !== '' && endDate !== '' && startDate.getTime() < day.getTime() && endDate.getTime() > day.getTime()}
              onClick={handleClickDay}
            >{day.getDate()}</div>
          ))}
          {daysFromNextMonth.map(day => (
            <div key={day}
              className={styles.day}
              data-day={day}
              data-start-date={startDate !== '' && startDate.getTime() === day.getTime()}
              data-end-date={endDate !== '' && endDate.getTime() === day.getTime()}
              data-in-between={startDate !== '' && endDate !== '' &&  startDate.getTime() < day.getTime() && endDate.getTime() > day.getTime()}
              data-outside-month={true}
              onClick={handleClickDay}
            >{day.getDate()}</div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      {generateMonthlyCalendar()}
    </div>
  );
}

export default function CalendarModal({closeModal}) {

  const { filters, setDates } = useContext(FiltersContext);
  const { from, to } = filters;

  const [startDate, setStartDate] = useState(from ?? '');
  const [endDate, setEndDate] = useState(to ?? '');
  const [monthInView, setMonthInView] = useState(from === '' ? new Date().getMonth() : from.getMonth());
  const [yearInView, setYearInView] = useState(from === '' ? new Date().getFullYear() : from.getFullYear());
  const [erroredInputs, setErroredInputs] = useState([false, false]);
  const [error, setError] = useState('test err');

  useEffect(() => {
    setStartDate(from);
    setEndDate(to);
    setMonthInView(from.getMonth());
    setYearInView(from.getFullYear());
    setErroredInputs([false, false]);
    setError('');
  }, [from, to]);

  const goToPreviousMonth = () => {
    const previousMonth = monthInView === 0 ? 11 : monthInView - 1;
    const previousYear = monthInView === 0 ? yearInView - 1 : yearInView;
    setMonthInView(previousMonth);
    setYearInView(previousYear);
  }

  const goToNextMonth = () => {
    const nextMonth = monthInView === 11 ? 0 : monthInView + 1;
    const nextYear = monthInView === 11 ? yearInView + 1 : yearInView;
    setMonthInView(nextMonth);
    setYearInView(nextYear);
  }

  const handleClickDay = (e) => {
    setDate(setMidnight(new Date(e.target.dataset.day)));
  }

  const handleInputDateChange = (e) => {
    const value = e.target.value; // yyyy-mm-dd
    setDate(new Date(value + 'T00:00:00'));
  }

  const setDate = date => {
    if(startDate === '' ||
      (startDate !== '' && endDate !== '') ||
      (endDate === '' && date.getTime() < startDate.getTime())
    ) {
      setStartDate(date);
      setEndDate('');
    } else if(startDate !== '' && endDate === '') {
      setEndDate(date);
    }
  }

  const showMissingFields = (startDateMissing, endDateMissing) => {
    setErroredInputs([startDateMissing, endDateMissing]);
    setError('Start and end dates are required');
  }

  const handleApply = (e) => {
    e.preventDefault();
    let missingFields = [(startDate === '' || isNaN(startDate.getTime())), (endDate === '' || isNaN(endDate.getTime()))];
    if(!missingFields.every(field => !field)) {
      showMissingFields(missingFields);
      return;
    }
    setErroredInputs(missingFields);
    if(startDate.getTime() > endDate.getTime()) {
      setError('Start date must be before end date');
      return;
    }
    setError('');
    if(startDate.getTime() === endDate.getTime()) {
      endDate.setHours(23, 59, 59, 999);
    }
    setDates(startDate, endDate);
    closeModal();
  }

  return (
    <div className={styles.modalContainer}>
      <div className={styles.inputsContainer}>
        <CalendarModalInput error={erroredInputs[0]} label={'Start date'} date={startDate} setDate={handleInputDateChange}/>
        <CalendarModalInput error={erroredInputs[1]} label={'End date'} date={endDate} setDate={handleInputDateChange}/>
      </div>
      <div className={styles.monthPicker}>
        <button className={styles.arrow} onClick={goToPreviousMonth}>
          <img src={rightArrow} alt={'left arrow'} width={16} height={16}/>
        </button>
        <span>{new Date(yearInView, monthInView).toLocaleString('default', {month: 'long', year: 'numeric'})}</span>
        <button className={styles.arrow} onClick={goToNextMonth}>
          <img src={leftArrow} alt={'right arrow'} width={16} height={16}/>
        </button>
      </div>
      <MonthView startDate={startDate} endDate={endDate} monthInView={monthInView} yearInView={yearInView} handleClickDay={handleClickDay}/>
      { error !== '' && <p className={styles.errorMessage}>{error}</p> }
      <div className={styles.responsiveDivider}></div>
      <div>
        <button className={filtersPanelStyles.applyButton} onClick={handleApply}>Apply</button>
      </div>
    </div>
  )
}