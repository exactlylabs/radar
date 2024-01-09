import { Controller } from "@hotwired/stimulus";

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December'
];

export default class extends Controller {
  static targets = [
    "dateInput",
    "timeInput",
    "monthYear"
  ];
  
  connect() {
    this.startDateInput = this.dateInputTargets.find(input => input.id === 'start-date');
    this.endDateInput = this.dateInputTargets.find(input => input.id === 'end-date');
    this.startTimeInput = this.timeInputTargets.find(input => input.id === 'start-time');
    this.endTimeInput = this.timeInputTargets.find(input => input.id === 'end-time');
    this.canHover = false;
    this.populateCalendarGrid();
  }
  
  applyDateRange(e) {
    e.preventDefault();
    if(!this.startDateInput.value || !this.endDateInput.value || !this.startTimeInput.value || !this.endTimeInput.value) {
      alert('missing fields');
      return;
    }
    const startDate = new Date(`${this.startDateInput.value}T${this.startTimeInput.value}`);
    const endDate = new Date(`${this.endDateInput.value}T${this.endTimeInput.value}`);
    if(startDate.getTime() > endDate.getTime()) {
      alert('start date must be before end date');
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete('days');
    url.searchParams.set('start', startDate.getTime().toFixed(0));
    url.searchParams.set('end', endDate.getTime().toFixed(0));
    window.location.replace(url.href);
  }
  
  nextMonth(e) {
    if(this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    }
    else this.currentMonth++;
    this.populateCalendarGrid(this.currentMonth, this.currentYear);
  }
  
  previousMonth(e) {
    if(this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    }
    else this.currentMonth--;
    this.populateCalendarGrid(this.currentMonth, this.currentYear);
  }
  
  clearCalendarGrid() {
    const weekGrid = document.getElementById('week-grid');
    const rows = weekGrid.querySelectorAll('div');
    rows.forEach(row => {
      if(row.id === 'calendar-button-placeholder') return;
      row.remove();
    });
  }
  
  populateCalendarGrid(givenMonth = null, givenYear = null) {
    this.clearCalendarGrid();
    let firstDayOfTheMonth;
    let startDate;
    if(givenMonth !== null && givenYear !== null) {
      const localTimeString = new Date(`${givenYear}-${this.twoDigit(givenMonth + 1)}-01T00:00:00`).toLocaleString();
      startDate = new Date(localTimeString);
    } else if(!this.startDateInput.value && !this.endDateInput.value) {
      startDate = new Date();
    } else {
      startDate = new Date(`${this.startDateInput.value}T${this.startTimeInput.value}`);
    }
    firstDayOfTheMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    this.currentMonth = firstDayOfTheMonth.getMonth();
    this.currentYear = firstDayOfTheMonth.getFullYear();
    let lastRowDay = this.fillRow(firstDayOfTheMonth);
    while(new Date(lastRowDay.setDate(lastRowDay.getDate() + 1)).getMonth() === startDate.getMonth()) {
      const firstDay = new Date(lastRowDay.setDate(lastRowDay.getDate() + 1));
      lastRowDay = this.fillRow(firstDay);
    }
    this.monthYearTarget.querySelector('p').innerText = `${MONTH_NAMES[this.currentMonth]} ${this.currentYear}`;
    this.setSelectedMonthYearList();
  }
  
  twoDigit(num) {
    return num < 10 ? `0${num}` : num;
  }
  
  fillRow(firstDay) {
    let hasRange = !!this.startDateInput.value && !!this.endDateInput.value;
    let inputStartDate = new Date(`${this.startDateInput.value}T${this.startTimeInput.value}`);
    let inputEndDate = new Date(`${this.endDateInput.value}T${this.endTimeInput.value}`);
    let currentDay = firstDay;
    let currentDayOfTheWeek = firstDay.getDay();
    if(currentDayOfTheWeek > 1) {
      const diff = currentDay.getDay() - 1;
      currentDay = new Date(currentDay.setDate(currentDay.getDate() - diff));
    } else if(currentDayOfTheWeek === 0) { // Sunday
      currentDay = new Date(currentDay.setDate(currentDay.getDate() - 6));
    }
    
    const placeholder = document.getElementById('calendar-button-placeholder');
    const weekGrid = document.getElementById('week-grid');
    for(let i = 0 ; i < 7 ; i++) {
      const dayButtonWrapper = placeholder.cloneNode(true);
      const dayButton = dayButtonWrapper.querySelector('button');
      dayButtonWrapper.id = '';
      dayButtonWrapper.removeAttribute('hidden');
      dayButton.innerText = currentDay.getDate();
      dayButton.setAttribute('data-date', `${currentDay.getFullYear()}-${this.twoDigit(currentDay.getMonth() + 1)}-${this.twoDigit(currentDay.getDate())}`);
      weekGrid.appendChild(dayButtonWrapper);
      if(hasRange && currentDay.getDate() === inputEndDate.getDate() && currentDay.getMonth() === inputEndDate.getMonth()) {
        this.setRangeEndButton(dayButton, true);
        if(i === 0) dayButtonWrapper.setAttribute('data-is-row-start', 'true');
      } else if(hasRange && currentDay.getDate() === inputStartDate.getDate() && currentDay.getMonth() === inputStartDate.getMonth()) {
        this.setRangeStartButton(dayButton, true);
        if(i === 6) dayButtonWrapper.setAttribute('data-is-row-end', 'true');
      } else if(hasRange && currentDay.getTime() >= inputStartDate.getTime() && currentDay.getTime() <= inputEndDate.getTime()) {
        dayButtonWrapper.setAttribute('data-within-range', 'true');
        if(i === 0) dayButtonWrapper.setAttribute('data-is-row-start', 'true');
        if(i === 6) dayButtonWrapper.setAttribute('data-is-row-end', 'true');
      } else if(currentDay.getMonth() !== this.currentMonth) {
        dayButton.setAttribute('data-disabled', 'true');
      }
      currentDay = new Date(currentDay.setDate(currentDay.getDate() + 1));
    }
    return currentDay;
  }
  
  clickedDay(e) {
    let target = e.target;
    if(target.tagName === 'DIV') target = target.querySelector('button');
    if(this.endDateInput.value) {
      this.endDateInput.value = null;
      this.endTimeInput.value = null;
      this.startDateInput.value = target.dataset.date;
      this.startTimeInput.value = "00:00";
      
      this.unsetRangeEndButton();
      this.unsetRangeStartButton();
      this.unsetWithinRangeButtons();
      this.unsetHoverableButtons();
      this.setRangeStartButton(target, false);
      this.setButtonsAsHoverable();
      this.canHover = true;
    } else {
      this.endDateInput.value = target.dataset.date;
      this.endTimeInput.value = "00:00";
      this.setRangeEndButton(target, true);
      this.unsetWithinRangeButtons();
      this.setWithinRangeButtons(target);
      this.unsetButtonsAsHoverable();
      this.canHover = false;
    }
  }
  
  setRangeStartButton(target, includeParent = false) {
    target.setAttribute('data-is-range-start', 'true');
    if(!includeParent) return;
    const wrapper = target.parentElement;
    wrapper.setAttribute('data-is-range-start', 'true');
  }
  
  unsetRangeStartButton() {
    const startDateButtonWrapper = document.querySelector('div[data-is-range-start="true"]');
    const startDateButton = document.querySelector('button[data-is-range-start="true"]');
    if(startDateButtonWrapper) {
      startDateButtonWrapper.removeAttribute('data-is-range-start');
      startDateButtonWrapper.removeAttribute('data-is-row-end');
    }
    if(startDateButton) startDateButton.removeAttribute('data-is-range-start');
  }
  
  setRangeEndButton(target, includeParent = false) {
    target.setAttribute('data-is-range-end', 'true');
    if(!includeParent) return;
    const wrapper = target.parentElement;
    wrapper.setAttribute('data-is-range-end', 'true');
  }
  
  unsetRangeEndButton() {
    const endDateButtonWrapper = document.querySelector('div[data-is-range-end="true"]');
    const endDateButton = document.querySelector('button[data-is-range-end="true"]');
    if(endDateButtonWrapper) {
      endDateButtonWrapper.removeAttribute('data-is-range-end');
      endDateButtonWrapper.removeAttribute('data-is-row-start');
    }
    if(endDateButton) endDateButton.removeAttribute('data-is-range-end');
  }
  
  setWithinRangeButtons(endDateTarget) {
    const hoverableButtons = document.querySelectorAll('div[data-hoverable="true"]');
    hoverableButtons.forEach(buttonWrapper => {
      const button = buttonWrapper.querySelector('button');
      const buttonDate = new Date(button.dataset.date);
      const endDate = new Date(endDateTarget.dataset.date);
      if(buttonDate > endDate) return;
      buttonWrapper.setAttribute('data-within-range', 'true');
    });
  }
  
  unsetWithinRangeButtons() {
    const withinRangeButtons = document.querySelectorAll('div[data-within-range="true"]');
    withinRangeButtons.forEach(buttonWrapper => {
      buttonWrapper.removeAttribute('data-within-range');
      buttonWrapper.removeAttribute('data-is-row-start');
      buttonWrapper.removeAttribute('data-is-row-end');
    });
  }
  
  unsetHoverableButtons() {
    const hoverableButtons = document.querySelectorAll('div[data-hoverable="true"]');
    hoverableButtons.forEach(buttonWrapper => {
      buttonWrapper.removeAttribute('data-hoverable');
    });
  }
  
  setButtonsAsHoverable() {
    const wrappers = document.querySelectorAll('.dashboard--calendar-day-button-wrapper:has(button:not([data-is-range-start="true"]))');
    wrappers.forEach(wrapper => {
      const wrapperDate = new Date(wrapper.querySelector('button').dataset.date);
      const startDate = new Date(this.startDateInput.value);
      if(wrapperDate > startDate) wrapper.setAttribute('data-hoverable', 'true');
    });
  }
  
  unsetButtonsAsHoverable() {
    const hoverableButtons = document.querySelectorAll('div[data-hoverable="true"]');
    hoverableButtons.forEach(buttonWrapper => {
      buttonWrapper.removeAttribute('data-hoverable');
    });
  }
  
  hoverDay(e) {
    if(!this.canHover) return;
    const startDateWrapper = document.querySelector('button[data-is-range-start="true"]').parentElement;
    startDateWrapper.removeAttribute('data-is-range-start');
    let currentHoveredDay = e.target;
    if(currentHoveredDay.tagName === 'DIV') currentHoveredDay = currentHoveredDay.querySelector('button');
    const currentHoveredDate = new Date(currentHoveredDay.dataset.date);
    if(isNaN(currentHoveredDate.getTime())) return;
    if(currentHoveredDay.dataset.date === this.startDateInput.value || currentHoveredDate < new Date(this.startDateInput.value)) return;
    startDateWrapper.setAttribute('data-is-range-start', 'true');
    this.unsetRangeEndButton();
    this.setRangeEndButton(currentHoveredDay, false);
    this.unsetWithinRangeButtons();
    this.setWithinRangeButtons(currentHoveredDay);
  }
  
  unhoverDay(e) {
    if(!this.canHover) return;
    this.unsetWithinRangeButtons();
    this.unsetRangeEndButton();
  }
}