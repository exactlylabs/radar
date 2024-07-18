import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";

export const PADDING = 0;
export const X_AXIS_OFFSET = 12;
export const Y_AXIS_OFFSET = 10;
export const GRID_LINE_Y_OFFSET = 5;
export const BOTTOM_LABELS_HEIGHT = 24;
export const DEFAULT_BLUE = '#4b7be5';
export const TOOLTIP_X_OFFSET = 8;
export const TOOLTIP_Y_OFFSET = 21;
export const DOT_SIZE = 4;
export const RADII = 6;

export const TOOLTIP_TITLE_PADDING = 40;
export const TOP_CLEARANCE = 30;

export const TouchEvents = {
  TOUCH_START: 'touchstart',
  TOUCH_END: 'touchend',
  TOUCH_MOVE: 'touchmove'
}

export const CHART_TITLES = {
  'downloadSpeeds': 'Download Speeds',
  'uploadSpeeds': 'Upload Speeds',
  'latency': 'Latency',
  'compareDownloadSpeeds': 'Download Speeds',
  'compareUploadSpeeds': 'Upload Speeds',
  'compareLatency': 'Latency',
  'compareDataUsage': 'Data Usage',
}

export const QUERY_INTERVALS = {
  DAY: 'day',
  HOUR: 'hour',
  MINUTE: 'minute',
  SECOND: 'second',
}

const MAX_STEPS = [1, 2, 5, 10, 15, 25, 50, 100];

export default class ChartController extends Controller {
  
  COMPARISON_HEX = ['#472118', '#960A8B', '#FC3A11', '#58396A', '#D6463E', '#307B2A', '#535FB6', '#77DFB1', '#767698', '#502628', '#EFE7DF', '#A502EF', '#B21BE4', '#88FC76', '#9FADE3', '#B403C4', '#78BCFE', '#686514', '#B2D343', '#CE87CA', '#20E92E', '#C8A3D7', '#161C6C', '#98AE22', '#A8A5CF', '#D72876', '#105F87', '#432B82', '#5462EA', '#86C625', '#9175BF', '#438F36', '#AF3BCF', '#F3ADEF', '#050044', '#5F47D3', '#E11986', '#0C7566', '#A129E0', '#43B2D6', '#A7CB09', '#0C7318', '#9A6E4F', '#81B2A6', '#AE37B2', '#D66E62', '#05F0D9', '#EC1FA4', '#4CAC54', '#F94C42'];
  
  connect() {
    this.queryTimeInterval = this.element.dataset.queryTimeInterval || 'day';
    this.usesQueryIntervalValue ||= false;
    this.isCompareChart = this.element.dataset.isCompareChart === 'true';
    if(this.isCompareChart) {
      this.entityCount = Number(this.element.dataset.entityCount) || 1;
    }
    this.skeleton = document.getElementById(this.element.dataset.skeletonId);
    this.lineToggler = document.getElementById(this.element.dataset.togglerId);
    this.chartData = [];
    this.prepareInitialState();
  }
  
  paintInitialChart() {
    if(this.lineToggler) this.lineToggler.style.display = 'block';
    this.skeleton.style.display = 'none';
    this.prepareData(this.chartData);
    window.addEventListener('resize', this.loadChart.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mouseleave', this.plotChart.bind(this));
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.element.addEventListener('touchstart', this.handleMouseDown.bind(this));
    this.element.addEventListener('touchend', this.handleMouseUp.bind(this));
    this.element.addEventListener('touchmove', this.handleMouseMove.bind(this));
    this.element.addEventListener('touchcancel', this.handleTapCancelled.bind(this));
    this.loadChart();
  }
  
  textWidth(text = '') {
    return this.ctx.measureText(text).width;
  }
  
  prepareInitialState() {
    this.parent = document.getElementById(this.element.dataset.parentId);
    new ResizeObserver(this.loadChart.bind(this)).observe(this.parent); // This will trigger the loadChart method when the parent element changes size
    this.labelSuffix = this.element.dataset.labelSuffix || '';
    if(this.isCompareChart) {
      if(window.Worker) {
        const worker = new Worker('/workers/chart_worker.js');
        worker.postMessage(this.element.dataset.lineChartData);
        worker.onmessage = (e) => {
          this.chartData = this.getChartDataForComparison(e.data);
          this.paintInitialChart();
        }
      } else {
        this.chartData = this.getChartDataForComparison(JSON.parse(this.element.dataset.lineChartData));
        this.paintInitialChart();
      }
    } else {
      // run the parse in a dedicated worker is available in the browser
      if(window.Worker) {
        const worker = new Worker('/workers/chart_worker.js');
        worker.postMessage(this.element.dataset.lineChartData);
        worker.onmessage = (e) => {
          this.chartData = e.data;
          this.paintInitialChart();
        }
      } else {
        this.chartData = JSON.parse(this.element.dataset.lineChartData);
        this.paintInitialChart();
      }
    }
    this.labels = [];
    
    // Specific coordinates for click-drag feature
    this.mouseClickedX = null;
    this.mouseReleasedX = null;
  }
  
  handleTapCancelled(e) {
    this.mouseClickedX = null;
    this.isDragging = false;
    this.dragInitialTime = null;
    this.plotChart();
  }
  
  /**
   * This method is a helper method to access position of tap event in mobile devices.
   * @param e Actual triggered TouchEvent
   *        If the event type is of type "TouchStart", then the touches array will be used and holds the information about the tap position
   *        If the event type is of type "TouchEnd", then the changedTouches array will be used and holds the information about the tap position
   * @returns {{mouseX: number, mouseY: number}|{mouseX: null, mouseY: null}}
   */
  getTapPosition(e) {
    const rect = this.element.getBoundingClientRect();
    const { touches, changedTouches, type } = e;
    if((type === TouchEvents.TOUCH_START && touches.length > 1) || (type === TouchEvents.TOUCH_END && changedTouches.length > 1)) return {mouseX: null, mouseY: null };
    let clientX, clientY;
    if(type === TouchEvents.TOUCH_START) {
      clientX = touches[0].clientX;
      clientY = touches[0].clientY;
    } else {
      clientX = changedTouches[0].clientX;
      clientY = changedTouches[0].clientY;
    }
    return { mouseX: clientX - rect.left, mouseY: clientY - rect.top};
  }
  
  getMousePosition(e) {
    const rect = this.element.getBoundingClientRect();
    return {
      mouseX: e.clientX - rect.left,
      mouseY: e.clientY - rect.top
    };
  }
  
  handleMouseMove(e) {
    const { mouseX, mouseY } = this.getMousePosition(e);
    const isOffHorizontally = mouseX < this.horizontalContentStartingPixel - 1 || mouseX > this.canvasWidth - 1;
    const isOffVertically = mouseY < Y_AXIS_OFFSET / 2 || mouseY > this.canvasHeight - Y_AXIS_OFFSET * 2 - BOTTOM_LABELS_HEIGHT;
    if(isOffHorizontally || isOffVertically) {
      this.resetStyles();
      this.plotChart();
      return;
    }
    if(this.isDragging) {
      this.plotChart();
      this.showDragArea(e);
      return;
    }
    this.showTooltip(mouseX, mouseY);
  }
  
  showVerticalDashedLine(mouseX) {
    this.resetStyles();
    this.ctx.beginPath();
    this.ctx.strokeStyle = '#3F3C70';
    this.ctx.setLineDash([3]);
    this.ctx.moveTo(mouseX, Y_AXIS_OFFSET / 2 + TOP_CLEARANCE);
    this.ctx.lineTo(mouseX, this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - GRID_LINE_Y_OFFSET);
    this.ctx.stroke();
    this.showHelperPopup(mouseX);
  }
  
  handleMouseDown(e) {
    if(this.chartId === 'compareTotalData') return;
    let xPos;
    if(e.type === TouchEvents.TOUCH_START) {
      e.preventDefault();
      const {mouseX} = this.getTapPosition(e);
      if(mouseX === null) return;
      xPos = mouseX;
    } else {
      const { mouseX} = this.getMousePosition(e);
      xPos = mouseX;
    }
    this.mouseClickedX = xPos;
    this.isDragging = true;
    this.dragInitialTime = new Date().getTime();
  }
  
  handleMouseUp(e) {
    let xPos;
    if(e.type === TouchEvents.TOUCH_END) {
      e.preventDefault();
      const { mouseX, mouseY } = this.getTapPosition(e);
      if(mouseX === null || mouseY === null) return;
      const dragFinalTime = new Date().getTime();
      // establish a threshold for drag to kick in, otherwise it's a simple tap
      if(dragFinalTime - this.dragInitialTime < 200) {
        this.showTooltip(mouseX, mouseY);
        this.mouseClickedX = null;
        this.mouseReleasedX = null;
        this.isDragging = false;
        this.dragInitialTime = null;
        return;
      }
      xPos = mouseX;
    } else {
      const {mouseX} = this.getMousePosition(e);
      xPos = mouseX;
    }
    this.mouseReleasedX = xPos;
    this.isDragging = false;
    const dragFinalTime = new Date().getTime();
    if(this.mouseClickedX && this.mouseReleasedX && dragFinalTime - this.dragInitialTime > 100) {
      this.calculateDraggedTimeline();
    }
  }
  
  calculateDraggedTimeline() {
    const mouseStart = Math.min(this.mouseClickedX, this.mouseReleasedX);
    const mouseEnd = Math.max(this.mouseClickedX, this.mouseReleasedX);
    const canvasStart = PADDING + X_AXIS_OFFSET + this.textWidth(this.labelSuffix);
    const canvasEnd = this.canvasWidth - PADDING - X_AXIS_OFFSET;
    const canvasWidth = canvasEnd - canvasStart;
    
    const normalizedMouseStart = (mouseStart - canvasStart) / canvasWidth;
    const normalizedMouseEnd = (mouseEnd - canvasStart) / canvasWidth;
    
    const currentTimelineStart = Number(this.getXValueAtIndex(0));
    const currentTimelineEnd = Number(this.getXValueAtIndex(-1)); // ask for last element
    const fullTimelineDistance = currentTimelineEnd - currentTimelineStart;
    
    const normalizedTimelineStart = fullTimelineDistance * normalizedMouseStart + currentTimelineStart;
    const normalizedTimelineEnd = fullTimelineDistance * normalizedMouseEnd + currentTimelineStart;
    
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('start', normalizedTimelineStart.toFixed(0));
    currentUrl.searchParams.set('end', normalizedTimelineEnd.toFixed(0));
    currentUrl.searchParams.delete('days');
    this.mouseClickedX = null;
    this.mouseReleasedX = null;
    window.location.replace(currentUrl);
  }
  
  showDragArea(e) {
    let xPos;
    if(e.type === TouchEvents.TOUCH_MOVE) {
      e.preventDefault();
      const { mouseX } = this.getTapPosition(e);
      if(mouseX === null) return;
      xPos = mouseX;
    } else {
      const { mouseX} = this.getMousePosition(e);
      xPos = mouseX;
    }
    const dragAreaVerticalOffset = Y_AXIS_OFFSET / 2 + TOP_CLEARANCE;
    
    // Draw base solid rectangle
    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgba(160, 159, 183, 0.2)';
    const blockWidth = xPos - this.mouseClickedX;
    this.ctx.roundRect(this.mouseClickedX, dragAreaVerticalOffset, blockWidth, this.netHeight);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Draw outline for rectangle with dashed style (using both in combination doesn't seem to work)
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#3F3C70';
    this.ctx.setLineDash([3]);
    // Top horizontal line
    this.ctx.beginPath();
    this.ctx.moveTo(this.mouseClickedX, dragAreaVerticalOffset);
    this.ctx.lineTo(blockWidth + this.mouseClickedX, dragAreaVerticalOffset);
    // Right side vertical line
    this.ctx.lineTo(blockWidth + this.mouseClickedX, dragAreaVerticalOffset + this.netHeight);
    // Bottom horizontal line
    this.ctx.lineTo(this.mouseClickedX, dragAreaVerticalOffset + this.netHeight);
    // Left side vertical line
    this.ctx.closePath();
    this.ctx.stroke();
    this.resetStyles();
    this.showTriangleIndicator(this.mouseClickedX);
    this.showHelperPopup(this.mouseClickedX);
    this.showTriangleIndicator(xPos, 'down');
    this.showHelperPopup(xPos, 'top');
  }
  
  prepareData(rawData) {
    // override this method if needed
  }
  
  getPixelRatio() {
    const refCtx = document.createElement('canvas').getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const bsr = refCtx.webkitBackingStorePixelRatio ||
      refCtx.mozBackingStorePixelRatio ||
      refCtx.msBackingStorePixelRatio ||
      refCtx.oBackingStorePixelRatio ||
      refCtx.backingStorePixelRatio ||
      1;
    return dpr / bsr;
  };
  
  createHiDPICanvas(w, h, ratio) {
    // In comparison charts that have a right-side line toggler, we need to reduce the width of the canvas
    // to make space for the toggler.
    // Toggler's max-width is 140px, and we add 16px for padding
    if(this.isCompareChart && !!this.element.dataset.togglerId) {
      const LINE_TOGGLER_WIDTH = 140;
      const LINE_TOGGLER_SPACING = 16;
      w = w - LINE_TOGGLER_WIDTH - LINE_TOGGLER_SPACING;
    }
    
    ratio ||= this.getPixelRatio();
    this.element.width = w * ratio;
    this.element.height = h * ratio;
    this.element.style.width = w + 'px';
    this.element.style.height = h + 'px';
    this.canvasWidth = w;
    this.canvasHeight = h;
    return ratio;
  }
  
  loadChart() {
    if(this.chartData.length === 0) return;
    if(this.ctx) {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.labels = [];
    }
    const dpr = this.createHiDPICanvas(this.parent.clientWidth, this.parent.clientHeight);
    this.ctx = this.element.getContext('2d');
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.setLongestLabel();
    this.setNetWidth();
    this.netHeight = this.canvasHeight - 2 * Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - TOP_CLEARANCE;
    this.chartBottomStart = this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - GRID_LINE_Y_OFFSET;
    this.setChartAxis();
    this.plotChart();
  }
  
  setNetWidth() {
    this.netWidth = this.canvasWidth - this.ctx.measureText(this.longestLabel).width - X_AXIS_OFFSET;
    this.horizontalContentStartingPixel = X_AXIS_OFFSET + this.textWidth(this.longestLabel);
  }
  
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.setChartAxis();
  }
  
  setChartAxis() {
    this.setYAxis();
    this.setXAxis();
  }
  
  setXAxis() {
    const dateSet = new Set();
    const firstDate = new Date(this.getFirstDate());
    const lastDate = new Date(this.getLastDate());
    const dateDiff = lastDate.getTime() - firstDate.getTime();
    const MINIMUM_SPACING_BETWEEN_LABELS = 50;
    const referenceLabel = this.formatTime(firstDate, true);
    const referenceLabelWidth = this.textWidth(referenceLabel);
    // get the max amount of labels that can fit in the canvas considering the minimum spacing between labels
    // consider having overlapping padding for the first and last labels
    let maxLabels = 1;
    let accumulatedWidth = referenceLabelWidth + MINIMUM_SPACING_BETWEEN_LABELS;
    while(accumulatedWidth < this.netWidth) {
      accumulatedWidth += referenceLabelWidth + MINIMUM_SPACING_BETWEEN_LABELS;
      maxLabels++;
    }
    
    const dateStep = Math.ceil(dateDiff / (maxLabels - 1));
    for(let i = 0 ; i < maxLabels - 1 ; i++) {
      const date = new Date(firstDate.getTime() + dateStep * i);
      dateSet.add(this.formatTime(date, true));
    }
    dateSet.add(this.formatTime(lastDate, true));
    this.renderLabels(dateSet);
  }
  
  getFirstDate() {
    // to override
    throw new Error('Method not implemented.');
  }
  
  getLastDate() {
    // to override
    throw new Error('Method not implemented.');
  }
  
  renderLabels(dateSet) {
    this.labels = [];
    const labelY = this.canvasHeight - Y_AXIS_OFFSET;
    const labels = Array.from(dateSet);
    const pointCount = labels.length - 1;
    // get each label length, and distance them equally
    const totalLabelCharWidth = labels.reduce((acc, label) => acc + this.ctx.measureText(label).width, 0);
    const spaceBetweenLabels = (this.netWidth - totalLabelCharWidth) / pointCount;
    let startingPixel = this.horizontalContentStartingPixel;
    labels.forEach((label, index) => {
      if(index > 0) startingPixel += this.ctx.measureText(labels[index - 1]).width + spaceBetweenLabels;
      this.ctx.fillText(label, startingPixel, labelY);
      this.labels.push({ label, x: startingPixel });
    });
  }
  
  // This method expects the following format for the chart data:
  // [{x: number, y: number}]
  // If different data format is expected, override this method
  setYAxis() {
    this.resetStyles();
    const totals = this.getYValues();
    
    // If values go over 100, get the closest multiple of 100
    const maxValue = Math.max(...totals);
    if(maxValue > MAX_STEPS[MAX_STEPS.length - 1]) {
      this.maxTotal = Math.ceil(maxValue / 100) * 100;
    } else {
      const closestIndex = MAX_STEPS.findIndex(step => step > maxValue);
      this.maxTotal = MAX_STEPS[closestIndex];
    }
    this.yStepSize = this.getYStepSize();
    this.drawJumpLines();
  }
  
  /**
   * This method is used to calculate the step size for the Y axis. All values are rounded to the nearest multiple of 5.
   * And all values here are handpicked to ensure the best possible user experience, but can be adjusted as needed.
   * @returns {number}
   */
  getYStepSize() {
    if(this.maxTotal <= 5) return 1;
    if(this.maxTotal <= 10) return 2;
    if(this.maxTotal <= 25) return 5;
    if(this.maxTotal <= 50) return 10;
    if(this.maxTotal <= 100) return 25;
    if(this.maxTotal <= 200) return 50;
    if(this.maxTotal <= 500) return 100;
    if(this.maxTotal <= 1000) return 200;
    if(this.maxTotal <= 2000) return 500;
    if(this.maxTotal <= 5000) return 1000;
    return 2500;
  }
  
  getYValues() {
    return this.chartData.map(entry => entry.y);
  }
  
  formatLabelNumericValue(value) {
    if(value === 0) return '0';
    const number = Number(value);
    const twoDigit = number.toFixed(2);
    if(twoDigit === '0.00') {
      let decimalPoints = 3;
      let goOn = true;
      while(goOn) {
        let zerosString = '0.';
        for(let i = 0 ; i < decimalPoints ; i++) {
          zerosString += '0';
        }
        goOn = number.toFixed(decimalPoints) === zerosString;
        if(goOn) decimalPoints++;
      }
      return number.toFixed(decimalPoints);
    } else if(twoDigit.split('.')[1] === '00') {
      return number.toFixed(0);
    } else {
      return twoDigit;
    }
  }
  
  isSmallScreen() {
    return window.innerWidth < 768;
  }
  
  setLongestLabel() {
    this.longestLabel = this.isSmallScreen() ? "0" : `0 ${this.labelSuffix}`;
    const jumps = Math.ceil(this.maxTotal / this.yStepSize);
    if(isNaN(jumps)) return;
    if(jumps < 2) {
      let label = `${this.formatLabelNumericValue(this.maxTotal)}${this.isSmallScreen() ? '' : this.labelSuffix}`;
      if(label.length > this.longestLabel.length) this.longestLabel = label;
    } else {
      let label = `${this.formatLabelNumericValue(this.yStepSize * jumps)}${this.isSmallScreen() ? '' : this.labelSuffix}`;
      if(label.length > this.longestLabel.length) this.longestLabel = label;
    }
    for(let i = 0 ; i < jumps - 1 ; i++) {
      let rowLabel = `${this.formatLabelNumericValue((i + 1) * this.yStepSize)}${this.isSmallScreen() ? '' : this.labelSuffix}`;
      if(rowLabel.length > this.longestLabel.length) this.longestLabel = rowLabel;
    }
  }
  
  drawJumpLines() {
    this.setLongestLabel();
    this.setNetWidth();
    this.createYAxisLabel(this.isSmallScreen() ? this.labelSuffix : "0", 0, this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT);
    let jumps = Math.ceil(this.maxTotal / this.yStepSize);
    if(isNaN(jumps)) jumps = 1;
    if(jumps < 2) {
      this.createYAxisLabel(`${this.formatLabelNumericValue(this.maxTotal)}${this.isSmallScreen() ? '' : this.labelSuffix}`, 0, Y_AXIS_OFFSET + TOP_CLEARANCE);
    } else {
      this.createYAxisLabel(`${this.formatLabelNumericValue(this.yStepSize * jumps)}${this.isSmallScreen() ? '' : this.labelSuffix}`, 0, Y_AXIS_OFFSET + TOP_CLEARANCE);
    }
    const boxHeight = this.netHeight / jumps;
    for(let i = 0 ; i < jumps - 1 ; i++) {
      const y = this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - ((i + 1) * boxHeight);
      const text = `${this.formatLabelNumericValue((i + 1) * this.yStepSize)}${this.isSmallScreen() ? '' : this.labelSuffix}`;
      this.createYAxisLabel(text, 0, y);
    }
    this.maxYLabelValue = jumps * this.yStepSize;
  }
  
  createYAxisLabel(label, x, y) {
    this.setLongestLabel();
    this.resetStyles();
    this.ctx.beginPath();
    this.ctx.fillStyle = '#6d6a94';
    this.ctx.strokeStyle = '#E3E3E8';
    this.ctx.lineHeight = 1;
    this.ctx.strokeWidth = 1;
    this.ctx.fillText(label, x, y);
    this.ctx.moveTo(x + this.textWidth(this.longestLabel) + X_AXIS_OFFSET, y - GRID_LINE_Y_OFFSET);
    this.ctx.lineTo(this.canvasWidth, y - GRID_LINE_Y_OFFSET);
    this.ctx.stroke();
  }
  
  drawLine(data, strokeStyle = DEFAULT_BLUE, gradientFirstStopColor = 'rgba(75, 123, 229, 0.2)') {
    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.lineWidth = 2;
    let pointY = this.getYCoordinateFromYValue(data[0].ys[0]);
    data.forEach((point, index) => {
      const { ys } = point;
      ys.forEach(y => {
        const pointX = this.getXCoordinateFromXValue(data, index);
        pointY = this.getYCoordinateFromYValue(y);
        if (index === 0) {
          this.ctx.moveTo(pointX, pointY);
        } else {
          this.ctx.lineTo(pointX, pointY);
        }
      });
    });
    this.closeLine(pointY, gradientFirstStopColor);
  }
  
  /**
   * Adjusts data to be grouped by time period
   * @param points {{x: string, y: number}[]} - array of points
   * @returns {{x: string, ys: number[]}[]}
   */
  adjustData(points) {
    return this.adjustLineData(points)
  }
  
  adjustLineData(points) {
    return points.map(point => ({ x: point.x, ys: [point.y] }));
  }
  
  closeLine(pointY, gradientFirstStopColor) {
    this.ctx.lineTo(this.canvasWidth, pointY);
    this.ctx.stroke();
    // close shape to create fill
    // reset line color to be invisible
    this.ctx.strokeStyle = 'rgba(0,0,0,0)';
    this.ctx.lineWidth = 0;
    this.ctx.lineTo(this.canvasWidth, this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - GRID_LINE_Y_OFFSET - PADDING);
    this.ctx.lineTo(PADDING + X_AXIS_OFFSET + this.textWidth(this.longestLabel), this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - GRID_LINE_Y_OFFSET - PADDING);
    this.ctx.closePath();
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, gradientFirstStopColor);
    gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, '#fff');
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.stroke();
  }
  
  /**
   * The rules for axis labels are a bit different than the ones for the tooltip.
   *
   * @param date
   * @param monthWord
   * @param hours
   */
  formatAxisTime(date, monthWord, hours) {
    const firstDate = new Date(this.getFirstDate());
    const lastDate = new Date(this.getLastDate());
    const dateDiff = lastDate.getTime() - firstDate.getTime();
    const THREE_YEARS_IN_MS = 94_608_000_000;
    const ONE_YEAR_IN_MS = 31_536_000_000;
    const ONE_WEEK_IN_MS = 604_800_000;
    const ONE_DAY_IN_MS = 86_400_000;
    const TEN_MINUTES_IN_MS = 600_000;
    
    // If time dateDiff >= 3 years, show year only
    // If time dateDiff >= 1 year, show month and year
    // If time dateDiff >= 1 week, show month and day
    // If time dateDiff >= 1 day, show day and time in HH:MM AM/PM format
    // If time dateDiff >= 10 min, show time in HH:MM AM/PM format
    // If time dateDiff less than 10 min, show time in HH:MM:SS AM/PM format
    
    if(dateDiff > THREE_YEARS_IN_MS) {
      return date.getFullYear();
    } else if(dateDiff > ONE_YEAR_IN_MS) {
      return `${monthWord} ${date.getFullYear()}`;
    } else if(dateDiff > ONE_WEEK_IN_MS) {
      return `${monthWord} ${date.getDate()}`;
    } else if(dateDiff > ONE_DAY_IN_MS) {
      return `${monthWord} ${date.getDate()}, ${hours}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() < 12 ? 'AM' : 'PM'}`;
    } else if(dateDiff > TEN_MINUTES_IN_MS) {
      return `${hours}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() < 12 ? 'AM' : 'PM'}`;
    } else {
      return `${hours}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')} ${date.getHours() < 12 ? 'AM' : 'PM'}`;
    }
  }
  
  formatTimeBasedOnDateDiff(date, monthWord, hours) {
    const firstDate = new Date(this.getFirstDate());
    const lastDate = new Date(this.getLastDate());
    const dateDiff = lastDate.getTime() - firstDate.getTime();
    const ONE_YEAR_IN_MS = 31_536_000_000;
    const ONE_WEEK_IN_MS = 604_800_000;
    const ONE_DAY_IN_MS = 86_400_000;
    // If time dateDiff >= 1 year, show month, day and year
    // If time dateDiff >= 1 week, show month and day
    // If time dateDiff >= 1 day, show month day and time in HH:MM AM/PM format
    // If time dateDiff < 1 day, show month day and time in HH:MM:SS AM/PM format
    
    if(dateDiff >= ONE_YEAR_IN_MS) {
      return `${monthWord} ${date.getDate()}, ${date.getFullYear()}`;
    } else if(dateDiff >= ONE_WEEK_IN_MS) {
      return `${monthWord} ${date.getDate()}`;
    } else if(dateDiff >= ONE_DAY_IN_MS) {
      return `${monthWord} ${date.getDate()}, ${hours}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() < 12 ? 'AM' : 'PM'}`;
    } else {
      return `${monthWord} ${date.getDate()}, ${hours}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')} ${date.getHours() < 12 ? 'AM' : 'PM'}`;
    }
    
  }
  
  formatTimeBasedOnQueryInterval(date, monthWord, hours) {
    if (this.queryTimeInterval === QUERY_INTERVALS.DAY) {
      return `${monthWord} ${date.getDate()}`;
    } else if (this.queryTimeInterval === QUERY_INTERVALS.HOUR) {
      return `${monthWord} ${date.getDate()}, ${hours}:${date.getMinutes().toString().padStart(2, '0')} ${date.getHours() < 12 ? 'AM' : 'PM'}`;
    } else if ([QUERY_INTERVALS.MINUTE, QUERY_INTERVALS.SECOND].includes(this.queryTimeInterval)) {
      return `${monthWord} ${date.getDate()}, ${hours}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')} ${date.getHours() < 12 ? 'AM' : 'PM'}`;
    }
  }
  
  formatTime(timestamp, isInAxis = false) {
    try {
      let date = null;
      if(isNaN(Number(timestamp))) {
        date = new Date(timestamp);
      } else {
        date = new Date(Number(timestamp));
      }
      const monthWord = date.toLocaleString('default', {month: 'short'});
      let hours = date.getHours() % 12;
      if(hours === 0) hours = 12;
      hours = hours.toString().padStart(2, '0');
      
      if(isInAxis) return this.formatAxisTime(date, monthWord, hours);
      if(this.usesQueryIntervalValue) return this.formatTimeBasedOnQueryInterval(date, monthWord, hours);
      return this.formatTimeBasedOnDateDiff(date, monthWord, hours);
    } catch(e) {
      handleError(e, this.identifier);
    }
  }
  
  getFirstGradientStopColor(hex, opacity = 0.2) {
    // return hex with specified opacity
    const hexColor = hex.replace('#', '');
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  }
  
  shouldHideTooltip(mouseX, mouseY) {
    return (
      mouseX <= this.horizontalContentStartingPixel ||
      mouseX >= this.canvasWidth ||
      mouseY < Y_AXIS_OFFSET / 2 ||
      mouseY > this.canvasHeight - Y_AXIS_OFFSET * 2 - BOTTOM_LABELS_HEIGHT
    );
  }
  
  setupTooltipContext(mouseX, mouseY) {
    this.plotChart();
    return !this.shouldHideTooltip(mouseX, mouseY);
  }
  
  showTooltip(mouseX, mouseY) {
    this.plotChart();
    const shouldContinue = this.setupTooltipContext(mouseX, mouseY);
    if(!shouldContinue) return;
    this.ctx.beginPath();
    this.ctx.fillStyle = '#fff';
    this.ctx.strokeStyle = 'rgba(188, 187, 199, 0.15)';
    // create shadow for rect
    this.ctx.shadowColor = 'rgba(160, 159, 183, 0.4)';
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 2;
    this.ctx.shadowBlur = 6;
    this.ctx.fillRect(mouseX, mouseY, 180, 120);
    this.ctx.stroke();
  }
  
  resetStrokeStyles() {
    this.ctx.strokeStyle = 'transparent';
    this.ctx.strokeWidth = 0;
    this.ctx.setLineDash([]);
  }
  
  resetStyles() {
    this.ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    this.ctx.shadowBlur = 0;
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;
    this.ctx.strokeWidth = 0;
    this.ctx.fillStyle = 'black';
    this.ctx.strokeStyle = 'black';
    this.ctx.font = '13px Mulish';
    this.ctx.lineHeight = 1;
    this.ctx.lineWidth = 1;
    this.ctx.setLineDash([]);
  }
  
  getYCoordinateFromYValue(yValue) {
    const netHeight = this.canvasHeight - 2 * PADDING - 2 * Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - TOP_CLEARANCE;
    const yAxisBlockHeight = netHeight / this.maxYLabelValue;
    const baseHeight = this.canvasHeight - GRID_LINE_Y_OFFSET - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - PADDING;
    return baseHeight - yValue * yAxisBlockHeight;
  }
  
  getXCoordinateFromXValue(data = this.chartData, index) {
    const netWidth = this.netWidth - DOT_SIZE / 2;
    const step = netWidth / (data.length - 1 > 0 ? data.length - 1 : 1);
    const baseWidth = PADDING + X_AXIS_OFFSET + this.textWidth(this.longestLabel);
    return baseWidth + step * index;
  }
  
  drawDotOnLine(x, y, color = DEFAULT_BLUE) {
    this.resetStyles();
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.arc(x, y, DOT_SIZE, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }
  
  showTriangleIndicator(xPosition, direction = 'up') {
    this.resetStyles();
    this.ctx.beginPath();
    this.ctx.fillStyle = '#3F3C70';
    this.ctx.strokeStyle = '#3F3C70';
    const TRIANGLE_WIDTH = 6;
    const TRIANGLE_HEIGHT = 4;
    const BOTTOM_Y_AXIS_LINE_POSITION = this.chartBottomStart;
    if(direction === 'up') {
      this.ctx.moveTo(xPosition, BOTTOM_Y_AXIS_LINE_POSITION);
      this.ctx.lineTo(xPosition - TRIANGLE_WIDTH / 2, BOTTOM_Y_AXIS_LINE_POSITION + TRIANGLE_HEIGHT);
      this.ctx.lineTo(xPosition + TRIANGLE_WIDTH / 2,BOTTOM_Y_AXIS_LINE_POSITION + TRIANGLE_HEIGHT);
    } else {
      this.ctx.moveTo(xPosition, TOP_CLEARANCE + GRID_LINE_Y_OFFSET);
      this.ctx.lineTo(xPosition - TRIANGLE_WIDTH / 2, TOP_CLEARANCE + GRID_LINE_Y_OFFSET - TRIANGLE_HEIGHT);
      this.ctx.lineTo(xPosition + TRIANGLE_WIDTH / 2, TOP_CLEARANCE + GRID_LINE_Y_OFFSET - TRIANGLE_HEIGHT);
    }
    this.ctx.closePath();
    this.ctx.fill();
    this.ctx.stroke();
  }
  
  showHelperPopup(mouseX, position = 'bottom') {
    this.resetStyles();
    this.ctx.beginPath();
    this.ctx.fillStyle = '#F6F7FA';
    this.ctx.strokeStyle = '#F6F7FA';
    const HELPER_HEIGHT = 24;
    const HORIZONTAL_PADDING = 6;
    const VERTICAL_PADDING = 2;
    const yPosition = position === 'bottom' ? this.canvasHeight - HELPER_HEIGHT : 0;
    const text = this.formatTime(this.getExactXValue(mouseX), true);
    const textWidth = this.textWidth(text);
    const popupWidth = textWidth + 2 * HORIZONTAL_PADDING;
    let xPosition = mouseX - popupWidth / 2;
    
    if(xPosition + popupWidth > this.canvasWidth) {
      xPosition = this.canvasWidth - popupWidth;
    } else if(xPosition < 0) {
      xPosition = 0;
    }
    
    this.ctx.roundRect(xPosition, yPosition, popupWidth, HELPER_HEIGHT, RADII);
    this.ctx.fill();
    
    this.ctx.fillStyle = '#6d6a94';
    this.ctx.font = '12px MulishBold';
    this.ctx.fillText(text, xPosition + HORIZONTAL_PADDING, yPosition + HELPER_HEIGHT / 2 + VERTICAL_PADDING);
    
    this.ctx.stroke();
  }
  
  getExactXValue(mouseX) {
    const firstDate = this.getFirstDate();
    const lastDate = this.getLastDate();
    const dateDiff = lastDate - firstDate;
    const startingPixel = this.horizontalContentStartingPixel;
    const endPixel = this.canvasWidth;
    const netWidth = endPixel - startingPixel;
    const ratio = (mouseX - startingPixel) / netWidth;
    const fullTime = dateDiff * ratio;
    return firstDate + fullTime;
  }
}