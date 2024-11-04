import {useState} from "react";
import styles from './calendar_modal.module.css';
import leftArrow from '../../../../assets/icons-simple-left-arrow.png';
import rightArrow from '../../../../assets/icons-simple-right-arrow.png';
import filtersPanelStyles from '../filters_panel.module.css';

function CalendarModalInput({label, date, setDate}) {

  const handleChange = (e) => {
    const value = e.target.value; // yyyy-mm-dd
    const date = new Date(value + 'T00:00:00');
    setDate(date);
  }

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
        onChange={handleChange}
      />
    </div>
  )
}

function MonthView({handleClickDay, startDate, endDate, setStartDate, setEndDate, monthInView, yearInView}) {

  const generateMonthlyCalendar = () => {
    const daysInMonth = new Date(yearInView, monthInView + 1, 0).getDate();
    let firstDate = new Date(yearInView, monthInView, 1);
    const lastDate = new Date(yearInView, monthInView, daysInMonth);
    const days = Array
      .from({length: daysInMonth}, (_, i) => i + 1)
      .map(day => new Date(new Date(firstDate.setDate(day)).setHours(0, 0, 0, 0)));
    firstDate = new Date(yearInView, monthInView, 1);
    const daysFromFirstDayUntilLastMonday = firstDate.getDay() === 0 ? 6 : firstDate.getDay() - 1;
    const daysFromLastDayUntilNextSunday = lastDate.getDay() === 0 ? 0 : 7 - lastDate.getDay();
    const daysFromPreviousMonth = Array
      .from({length: daysFromFirstDayUntilLastMonday},
      (_) => new Date(new Date(firstDate.setDate(firstDate.getDate() - 1)).setHours(0, 0, 0, 0)))
      .reverse();
    const daysFromNextMonth = Array
      .from({length: daysFromLastDayUntilNextSunday},
      (_) => new Date(new Date(lastDate.setDate(lastDate.getDate() + 1)).setHours(0, 0, 0, 0)));

    return (
      <div className={styles.monthContainer}>
        <div className={styles.dayTitles}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className={styles.dayOfWeek}>{day}</div>
          ))}
        </div>
        <div className={styles.calendar}>
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

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [monthInView, setMonthInView] = useState(startDate === '' ? new Date().getMonth() : new Date(startDate).getMonth());
  const [yearInView, setYearInView] = useState(startDate === '' ? new Date().getFullYear() : new Date(startDate).getFullYear());

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
    const day = new Date(e.target.dataset.day);
    if(startDate === '' ||
      (startDate !== '' && endDate !== '') ||
      (endDate === '' && day.getTime() < startDate.getTime())
    ) {
      setStartDate(day);
      setEndDate('');
    } else if(startDate !== '' && endDate === '') {
      setEndDate(day);
    }
  }

  return (
    <div className={styles.modalContainer}>
      <div className={styles.inputsContainer}>
        <CalendarModalInput label={'Start date'} date={startDate} setDate={setStartDate}/>
        <CalendarModalInput label={'End date'} date={endDate} setDate={setEndDate}/>
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
      <MonthView startDate={startDate}
                 endDate={endDate}
                 setStartDate={setStartDate}
                 setEndDate={setEndDate}
                 monthInView={monthInView}
                 yearInView={yearInView}
                 handleClickDay={handleClickDay}
      />
      <div className={styles.responsiveDivider}></div>
      <div>
        <button className={filtersPanelStyles.applyButton} onClick={closeModal}>Apply</button>
      </div>
    </div>
  )
}