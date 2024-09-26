import { Controller } from "@hotwired/stimulus";
import {QUERY_INTERVALS} from "./chart_controller";

const STATUS_BAR_HEIGHT = 48;
const INDICATOR_PADDING = 8;
const ARROW_WIDTH = 8;
const ARROW_HEIGHT = 5;

export default class extends Controller {
  
  static targets = ["hoverLine", "endHoverLine", "startDateIndicator", "endDateIndicator", "draggedArea"];
  
  connect() {
    this.element.addEventListener("mousemove", this.handleHover.bind(this));
    this.element.addEventListener("mouseleave", this.handleMouseOut.bind(this));
    this.element.addEventListener("mousedown", this.handleDragStart.bind(this));
    this.element.addEventListener("mouseup", this.handleMouseUp.bind(this));
    // when scrolling the topmost element with overflow, clear the current hovering/dragging state
    document.querySelector('body > div.application--main-container').addEventListener("scroll", this.handleScroll.bind(this));
    this.isDragging = false;
    this.dragStartX = null;
    this.dragEndX = null;
    this.startDate = new Date(this.element.dataset.startDate);
    this.endDate = new Date(this.element.dataset.endDate);
  }
  
  handleScroll(e) {
    console.log('scrolling...')
    this.hideEverything();
    this.isDragging = false;
    this.dragEndX = null;
    this.dragStartX = null;
  }
  
  handleHover(e) {
    if(this.isDragging) {
      this.handleDrag(e);
      return;
    }
    this.showHoveringLine(e);
    this.showHoveredDate(e);
  }
  
  handleMouseOut(e) {
    if(this.isDragging) return;
    this.hoverLineTarget.setAttribute('hidden', 'hidden');
    this.startDateIndicatorTarget.setAttribute('hidden', 'hidden');
  }
  
  handleDragStart(e) {
    this.isDragging = true;
    this.dragStartX = this.getMousePositionRelativeToElement(e).mouseX;
    this.handleDragState(e);
  }
  
  handleDrag(e) {
    if(!this.isDragging) {
      this.handleDragStart(e);
      return;
    }
    this.handleDragState(e);
  }
  
  handleDragState(e) {
    this.dragEndX = this.getMousePositionRelativeToElement(e).mouseX;
    this.showDraggingArrow(e);
    this.showDraggingArrow(e, 'end');
    this.showHoveringLine(e);
    this.showHoveringLine(e, 'end');
    this.showHoveredDate(e);
    this.showHoveredDate(e, 'end');
    this.showDraggedArea(e);
  }
  
  handleDragEnd(e) {
    this.isDragging = false;
    this.dragEndX = e.clientX;
    this.showHoveredDate(e);
    this.showHoveredDate(e, 'end');
    this.showDraggingArrow(e);
    this.showDraggingArrow(e, 'end');
  }
  
  handleMouseUp(e) {
    this.isDragging = false;
    this.dragEndX = this.getMousePositionRelativeToElement(e).mouseX;
    this.hideEverything();
    
    if(Math.abs(this.dragEndX - this.dragStartX) < 10) return;
    
    this.requestTimeFrame();
  }
  
  requestTimeFrame() {
    const startDate = this.getDateAtCoordinate(this.dragStartX < this.dragEndX ? this.dragStartX : this.dragEndX);
    const endDate = this.getDateAtCoordinate(this.dragEndX > this.dragStartX ? this.dragEndX : this.dragStartX);
    const url = new URL(window.location.href);
    url.searchParams.set('start', startDate.getTime().toFixed(0));
    url.searchParams.set('end', endDate.getTime().toFixed(0));
    window.location.href = url.href;
  }
  
  hideEverything() {
    this.hoverLineTarget.setAttribute('hidden', 'hidden');
    this.endHoverLineTarget.setAttribute('hidden', 'hidden');
    this.startDateIndicatorTarget.setAttribute('hidden', 'hidden');
    this.endDateIndicatorTarget.setAttribute('hidden', 'hidden');
    this.draggedAreaTarget.setAttribute('hidden', 'hidden');
    let arrow = this.hoverLineTarget.querySelector('.outages--hovering-arrow');
    if(arrow) arrow.setAttribute('hidden', 'hidden');
    arrow = this.endHoverLineTarget.querySelector('.outages--hovering-arrow');
    if(arrow) arrow.setAttribute('hidden', 'hidden');
  }
  
  showDraggedArea() {
    const startX = this.dragStartX < this.dragEndX ? this.dragStartX : this.dragEndX;
    const endX = this.dragEndX > this.dragStartX ? this.dragEndX : this.dragStartX;
    const totalWidth = this.element.offsetWidth;
    const percentageStart = startX / totalWidth;
    const percentageEnd = endX / totalWidth;
    const width = (percentageEnd - percentageStart) * 100;
    const left = percentageStart * 100;
    this.draggedAreaTarget.style.width = width + '%';
    this.draggedAreaTarget.style.left = left + '%';
    this.draggedAreaTarget.removeAttribute('hidden');
  }
  
  getMousePositionRelativeToElement(e) {
    const rect = this.element.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    return { mouseX, mouseY };
  }
  
  getMousePositionRelativeToWindow(e) {
    return { mouseX: e.clientX, mouseY: e.clientY };
  }
  
  convertPositionFromElementToWindow(x) {
    const rect = this.element.getBoundingClientRect();
    return x + rect.left;
  }
  
  showHoveringLine(e, type = 'start') {
    let x;
    if(this.isDragging && type === 'start') {
      x = this.dragStartX;
    } else {
      x = this.getMousePositionRelativeToElement(e).mouseX;
    }
    const target = type === 'start' ? this.hoverLineTarget : this.endHoverLineTarget;
    target.removeAttribute('hidden');
    target.style.left = x + 'px';
  }
  
  showDraggingArrow(e, type = 'start') {
    const target = type === 'start' ? this.hoverLineTarget : this.endHoverLineTarget;
    const arrow = target.querySelector('.outages--hovering-arrow');
    if(arrow) {
      let x;
      if(this.isDragging && type === 'start') {
        x = this.convertPositionFromElementToWindow(this.dragStartX);
      } else {
        const { mouseX } = this.getMousePositionRelativeToElement(e);
        x = this.convertPositionFromElementToWindow(mouseX);
      }
      const { top } = this.element.getBoundingClientRect();
      arrow.style.left = (x - ARROW_WIDTH / 2) + 'px';
      arrow.style.top = top
        + STATUS_BAR_HEIGHT * (type === 'start' ? 1 : 0)
        + ARROW_HEIGHT * (type === 'start' ? 0 : -1)
        + 'px';
      if(type === 'end') {
        arrow.style.transform = 'rotate(180deg)';
      }
      arrow.removeAttribute('hidden');
    }
  }
  
  getDateAtCoordinate(x) {
    const totalWidth = this.element.offsetWidth;
    const percentage = x / totalWidth;
    let timeDiff = this.endDate - this.startDate;
    const timeToAdd = timeDiff * percentage;
    return new Date(this.startDate.getTime() + timeToAdd);
  }
  
  showHoveredDate(e, type = 'start') {
    let dateX;
    let positionalX;
    if(this.isDragging && type === 'start') {
      //positionalX = this.convertPositionFromElementToWindow(this.dragStartX);
      dateX = this.dragStartX;
    } else {
      dateX = this.getMousePositionRelativeToElement(e).mouseX;
      //positionalX = this.getMousePositionRelativeToWindow(e).mouseX;
    }
    const date = this.getDateAtCoordinate(dateX);
    const target = type === 'start' ? this.startDateIndicatorTarget : this.endDateIndicatorTarget;
    target.innerHTML = this.getFormattedDate(date);
    const { width, height } = target.getBoundingClientRect();
    if(width > 0) target.style.left = dateX - width / 2 + 'px';
    
    if(height > 0) target.style.top =
        STATUS_BAR_HEIGHT * (type === 'start' ? 1 : 0)
      + INDICATOR_PADDING * (type === 'start' ? 1 : -1)
      + height * (type === 'start' ? 0 : -1)
      + 'px';
    target.removeAttribute('hidden');
  }
  
  getFormattedDate(date) {
    const monthWord = date.toLocaleString('default', {month: 'short'});
    let hours = date.getHours() % 12;
    if(hours === 0) hours = 12;
    hours = hours.toString().padStart(2, '0');
    const timeframe = this.endDate - this.startDate;
    const THREE_YEARS = 94_608_000_000;
    const ONE_YEAR = 31_536_000_000;
    const ONE_WEEK = 604_800_000;
    const ONE_DAY = 86_400_000;
    const TEN_MINUTES = 600_000;
    
    if(timeframe >= THREE_YEARS) {
      return `${date.getFullYear()}`;
    } else if(timeframe >= ONE_YEAR) {
      return `${monthWord} ${date.getFullYear()}`;
    } else if(timeframe >= ONE_WEEK) {
      return `${monthWord} ${date.getDate()}`;
    } else if(timeframe >= ONE_DAY) {
      return `${monthWord} ${date.getDate()} ${hours}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
    } else if(timeframe >= TEN_MINUTES) {
      return `${hours}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
    } else {
      return `${hours}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')} ${date.getHours() >= 12 ? 'PM' : 'AM'}`;
    }
  }
}