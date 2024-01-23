import { Controller } from "@hotwired/stimulus";

export const PADDING = 0;
export const X_AXIS_OFFSET = 10;
export const Y_AXIS_OFFSET = 10;
export const X_CONTEXT_OFFSET = (labelSuffix) => labelSuffix ? 20 + 10 * labelSuffix.length : 20;
export const RIGHT_X_CONTEXT_OFFSET = 40;
export const GRID_LINE_Y_OFFSET = 5;
export const BOTTOM_LABELS_HEIGHT = 32;
export const STANDARD_LABEL_WIDTH = 20;

export const CHART_TITLES = {
  'downloadSpeeds': 'Download Speeds',
  'uploadSpeeds': 'Upload Speeds',
  'latency': 'Latency',
  'compareDownloadSpeeds': 'Download Speeds',
}

export default class ChartController extends Controller {
  connect() {
    this.prepareInitialState();
    this.prepareData(this.chartData);
    this.loadChart();
    window.addEventListener('resize', this.loadChart.bind(this));
    this.element.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.element.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.element.addEventListener('mouseup', this.handleMouseUp.bind(this));
  }
  
  prepareInitialState() {
    this.parent = document.getElementById(this.element.dataset.parentId);
    // TODO: try/catch
    if(this.chartId === 'compareDownloadSpeeds') {
      this.chartData = this.getChartDataForComparison();
    } else {
      this.chartData = JSON.parse(this.element.dataset.lineChartData);
    }
    this.labels = [];
    this.labelSuffix = this.element.dataset.labelSuffix || '';
    
    // Specific coordinates for click-drag feature
    this.mouseClickedX = null;
    this.mouseReleasedX = null;
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
    if(this.isDragging) {
      this.plotChart();
      this.showDragArea(e);
      return;
    }
    this.showTooltip(mouseX, mouseY);
  }
  
  handleMouseDown(e) {
    const { mouseX} = this.getMousePosition(e);
    this.mouseClickedX = mouseX;
    this.isDragging = true;
  }
  
  handleMouseUp(e) {
    const { mouseX} = this.getMousePosition(e);
    this.mouseReleasedX = mouseX;
    this.isDragging = false;
    if(this.mouseClickedX) {
      this.calculateDraggedTimeline();
    }
  }
  
  calculateDraggedTimeline() {
    const mouseStart = Math.min(this.mouseClickedX, this.mouseReleasedX);
    const mouseEnd = Math.max(this.mouseClickedX, this.mouseReleasedX);
    const canvasStart = PADDING + X_AXIS_OFFSET + X_CONTEXT_OFFSET(this.labelSuffix);
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
    const { mouseX} = this.getMousePosition(e);
    const dragAreaVerticalOffset = 5;
    
    // Draw base solid rectangle
    this.ctx.beginPath();
    this.ctx.fillStyle = 'rgba(160, 159, 183, 0.2)';
    const blockWidth = mouseX - this.mouseClickedX;
    this.ctx.roundRect(this.mouseClickedX, dragAreaVerticalOffset, blockWidth, this.netHeight);
    this.ctx.fill();
    this.ctx.stroke();
    
    // Draw outline for rectangle with dashed style (using both in combination doesn't seem to work)
    this.ctx.lineWidth = 1;
    this.ctx.strokeStyle = '#a09fb7';
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
    // padding: 1.5rem -- 24px
    // margin-top: 1.5rem -- 24px
    ratio ||= this.getPixelRatio();
    this.element.width = (w + PADDING) * ratio;
    this.element.height = (h + PADDING) * ratio;
    this.element.style.width = w + PADDING + 'px';
    this.element.style.height = h + PADDING + 'px';
    this.canvasWidth = w + PADDING;
    this.canvasHeight = h + PADDING;
    return ratio;
  }
  
  loadChart() {
    if(this.ctx) {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.labels = [];
    }
    const dpr = this.createHiDPICanvas(this.parent.clientWidth, this.parent.clientHeight);
    this.ctx = this.element.getContext('2d');
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.netWidth = this.canvasWidth - 2 * X_AXIS_OFFSET - X_CONTEXT_OFFSET(this.labelSuffix) - RIGHT_X_CONTEXT_OFFSET - 2 * PADDING;
    this.netHeight = this.canvasHeight - 2 * Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - 2 * PADDING;
    
    this.setChartAxis();
    this.plotChart();
  }
  
  clearCanvas() {
    this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    this.setChartAxis();
  }
  
  setChartAxis() {
    this.setYAxis();
    this.setXAxis();
  }
  
  // This method expects the following format for the chart data:
  // [{x: number, y: number}]
  // If different data format is expected, override this method
  setXAxis() {
    this.ctx.fillStyle = '#6d6a94';
    const dateSet = new Set();
    const defaultSpacing = this.getDefaultSpacing();
    const hasEnoughPoints = this.chartData.length > defaultSpacing;
    this.chartData.forEach((point, index) => {
      if(hasEnoughPoints && index % defaultSpacing !== 0) return;
      const { x } = point;
      dateSet.add(this.formatTime(x));
    });
    if(!dateSet.has(this.chartData[this.chartData.length - 1].x)) {
      dateSet.add(this.formatTime(this.chartData[this.chartData.length - 1].x));
    }
    this.renderLabels(dateSet);
  }
  
  renderLabels(dateSet) {
    this.labels = [];
    const labelY = this.canvasHeight - Y_AXIS_OFFSET - PADDING;
    const labels = Array.from(dateSet);
    const pointCount = labels.length - 1;
    labels.forEach((label, index) => {
      const labelX = PADDING + X_AXIS_OFFSET + X_CONTEXT_OFFSET(this.labelSuffix) + index * this.netWidth / pointCount;
      this.ctx.fillText(label, labelX, labelY);
      this.labels.push({ label, x: labelX - STANDARD_LABEL_WIDTH / 2 });
    });
  }
  
  // This method expects the following format for the chart data:
  // [{x: number, y: number}]
  // If different data format is expected, override this method
  setYAxis() {
    this.resetStyles();
    const totals = this.chartData.map(entry => entry.y);
    this.maxTotal = Math.max(...totals);
    this.yStepSize = this.maxTotal / 3 > 1 ? Math.ceil(this.maxTotal / 3) : this.maxTotal / 3;
    this.drawJumpLines();
  }
  
  formatLabelNumericValue(value) {
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
  
  drawJumpLines() {
    this.createYAxisLabel("0", X_AXIS_OFFSET + PADDING, this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - PADDING);
    const jumps = Math.ceil(this.maxTotal / this.yStepSize);
    if(jumps < 2) {
      this.createYAxisLabel(`${this.formatLabelNumericValue(this.maxTotal)}${this.labelSuffix}`, X_AXIS_OFFSET + PADDING, Y_AXIS_OFFSET + PADDING);
    } else {
      this.createYAxisLabel(`${this.formatLabelNumericValue(this.yStepSize * jumps)}${this.labelSuffix}`, X_AXIS_OFFSET + PADDING, Y_AXIS_OFFSET + PADDING);
    }
    const boxHeight = this.netHeight / jumps;
    for(let i = 0 ; i < jumps - 1 ; i++) {
      const y = this.canvasHeight - PADDING - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - ((i + 1) * boxHeight);
      const text = `${this.formatLabelNumericValue((i + 1) * this.yStepSize)}${this.labelSuffix}`;
      this.createYAxisLabel(text, X_AXIS_OFFSET + PADDING, y);
    }
    this.maxYLabelValue = jumps * this.yStepSize;
  }
  
  createYAxisLabel(label, x, y) {
    this.resetStyles();
    this.ctx.beginPath();
    this.ctx.fillStyle = '#6d6a94';
    this.ctx.strokeStyle = '#E3E3E8';
    this.ctx.lineHeight = 1;
    this.ctx.strokeWidth = 1;
    this.ctx.fillText(label, x, y);
    this.ctx.moveTo(x + X_CONTEXT_OFFSET(this.labelSuffix), y - GRID_LINE_Y_OFFSET);
    this.ctx.lineTo(this.canvasWidth - X_AXIS_OFFSET - PADDING, y - GRID_LINE_Y_OFFSET);
    this.ctx.stroke();
  }
  
  drawLine(data, strokeStyle = '#4b7be5', gradientFirstStopColor = 'rgba(75, 123, 229, 0.2)') {
    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.lineWidth = 2;
    let pointY = this.getYCoordinateFromYValue(data[0].ys[0]);
    data.forEach((point, index) => {
      const { x, ys } = point;
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
    const timeStep = '1d'; // TODO: should be a filter of some sorts
    if(timeStep === '1d') {
      return this.adjustLineData(points, '1d')
    }
  }
  
  adjustLineData(points, timeInterval) {
    const pointsByDay = [];
    points.forEach((point, index) => {
      const { x, y } = point;
      const pointTimeLabel = this.formatTime(x);
      let prevPointTimeLabel = null;
      if(index > 0) {
        prevPointTimeLabel  = this.formatTime(points[index - 1].x);
      }
      if(pointTimeLabel === prevPointTimeLabel) {
        const prevPoint = pointsByDay[pointsByDay.length - 1];
        prevPoint.ys.push(y);
      } else {
        pointsByDay.push({ x, ys: [y] });
      }
    });
    return pointsByDay;
  }
  
  closeLine(pointY, gradientFirstStopColor) {
    this.ctx.lineTo(this.canvasWidth - X_AXIS_OFFSET - PADDING, pointY);
    this.ctx.stroke();
    // close shape to create fill
    // reset line color to be invisible
    this.ctx.strokeStyle = 'rgba(0,0,0,0)';
    this.ctx.lineWidth = 0;
    this.ctx.lineTo(this.canvasWidth - X_AXIS_OFFSET - PADDING, this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - GRID_LINE_Y_OFFSET - PADDING);
    this.ctx.lineTo(PADDING + X_AXIS_OFFSET + X_CONTEXT_OFFSET(this.labelSuffix), this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - GRID_LINE_Y_OFFSET - PADDING);
    this.ctx.closePath();
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, gradientFirstStopColor);
    gradient.addColorStop(0.85, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, '#fff');
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.stroke();
  }
  
  formatTime(timestamp) {
    try {
      let date = null;
      if(isNaN(Number(timestamp))) {
        date = new Date(timestamp);
      } else {
        date = new Date(Number(timestamp));
      }
      const monthWord = date.toLocaleString('default', { month: 'short' });
      return `${monthWord} ${date.getDate()}`;
    } catch(e) {
      console.error('Invalid timestamp', timestamp);
    }
  }
  
  getDefaultSpacing() {
    const url = new URL(window.location.href);
    let days = url.searchParams.get('days');
    let spacing = 1;
    days = parseInt(days) || 30;
    if(days < 30) spacing = 6;
    else if(days < 90) spacing = 10;
    else if(days < 120) spacing = 12;
    else if(days < 180) spacing = 16;
    else spacing = 40;
    
    // if(this.canvasWidth < 500) spacing = 40;
    // if(this.canvasWidth < 400) spacing = 60;
    // if(this.canvasWidth < 300) spacing = 80;
    
    const totalPoints = this.chartData.length;
    const maxLabels = 10;
    if(totalPoints / spacing > maxLabels) {
      spacing = Math.ceil(totalPoints / maxLabels);
    }
    
    return spacing;
  }
  
  getFirstGradientStopColor(hex) {
    switch (hex) {
      case '#4B7BE5':
        return 'rgba(75, 123, 229, 0.2)';
      case '#FF695D':
        return 'rgba(255, 105, 93, 0.2)';
      case '#9138E5':
        return 'rgba(145, 56, 229, 0.2)';
      case '#98CB87':
        return 'rgba(152, 203, 135, 0.2)';
      case '#F51278':
        return 'rgba(245, 18, 120, 0.2)';
      case '#F7AA5A':
        return 'rgba(247, 170, 90, 0.2)';
      default:
        return 'black';
    }
  }
  
  shouldHideTooltip(mouseX, mouseY) {
    return (
      mouseX < X_AXIS_OFFSET + X_CONTEXT_OFFSET(this.labelSuffix) - 1 ||
      mouseX > this.canvasWidth - X_AXIS_OFFSET - 1 ||
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
    const netHeight = this.canvasHeight - 2 * PADDING - 2 * Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT;
    const yAxisBlockHeight = netHeight / this.maxYLabelValue;
    const baseHeight = this.canvasHeight - GRID_LINE_Y_OFFSET - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - PADDING;
    return baseHeight - yValue * yAxisBlockHeight;
  }
  
  getXCoordinateFromXValue(data = this.chartData, index) {
    const netWidth = this.canvasWidth - 2 * PADDING - X_AXIS_OFFSET - X_CONTEXT_OFFSET(this.labelSuffix) - RIGHT_X_CONTEXT_OFFSET / 4;
    const step = netWidth / (data.length - 1);
    const baseWidth = PADDING + X_AXIS_OFFSET + X_CONTEXT_OFFSET(this.labelSuffix);
    return baseWidth + step * index;
  }
  
  drawDotOnLine(x, y, color = '#4b7be5') {
    this.ctx.beginPath();
    this.ctx.fillStyle = color;
    this.ctx.strokeStyle = color;
    this.ctx.arc(x, y, 4, 0, 2 * Math.PI);
    this.ctx.fill();
    this.ctx.stroke();
  }
}