import { Controller } from "@hotwired/stimulus";

export const X_AXIS_OFFSET = 10;
export const Y_AXIS_OFFSET = 10;
export const X_CONTEXT_OFFSET = (labelSuffix) => labelSuffix ? 20 + 10 * labelSuffix.length : 20;
export const RIGHT_X_CONTEXT_OFFSET = 40;
export const GRID_LINE_Y_OFFSET = 5;
export const BOTTOM_LABELS_HEIGHT = 32;
export const STANDARD_LABEL_WIDTH = 20;

export default class ChartController extends Controller {
  connect() {
    this.prepareInitialState();
    this.prepareData(this.chartData);
    this.loadChart();
    window.addEventListener('resize', this.loadChart.bind(this));
  }
  
  prepareInitialState() {
    this.parent = document.getElementById(this.element.dataset.parentId);
    // TODO: try/catch
    this.chartData = JSON.parse(this.element.dataset.lineChartData);
    this.labels = [];
    this.labelSuffix = this.element.dataset.labelSuffix || '';
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
    if(this.ctx) {
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
      this.labels = [];
    }
    const dpr = this.createHiDPICanvas(this.parent.clientWidth, this.parent.clientHeight);
    this.ctx = this.element.getContext('2d');
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.netWidth = this.canvasWidth - 2 * X_AXIS_OFFSET - X_CONTEXT_OFFSET(this.labelSuffix) - RIGHT_X_CONTEXT_OFFSET;
    this.netHeight = this.canvasHeight - 2 * Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT;
    this.setChartAxis();
    this.plotChart();
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
    const labelY = this.canvasHeight - Y_AXIS_OFFSET;
    const labels = Array.from(dateSet);
    const pointCount = labels.length - 1;
    labels.forEach((label, index) => {
      const labelX = X_AXIS_OFFSET + STANDARD_LABEL_WIDTH / 2 + X_CONTEXT_OFFSET(this.labelSuffix) + index * this.netWidth / pointCount;
      this.ctx.fillText(label, labelX, labelY);
      this.labels.push({ label, x: labelX - STANDARD_LABEL_WIDTH / 2 });
    });
  }
  
  // This method expects the following format for the chart data:
  // [{x: number, y: number}]
  // If different data format is expected, override this method
  setYAxis() {
    this.ctx.beginPath();
    this.ctx.fillStyle = 'black';
    this.ctx.font = '13px Mulish';
    const totals = this.chartData.map(entry => entry.y);
    this.maxTotal = Math.max(...totals);
    this.yStepSize = Math.ceil(this.maxTotal / 3);
    this.drawJumpLines();
  }
  
  drawJumpLines() {
    this.createYAxisLabel("0", X_AXIS_OFFSET, this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT);
    const jumps = Math.ceil(this.maxTotal / this.yStepSize);
    if(jumps < 2) {
      this.createYAxisLabel(`${this.maxTotal}${this.labelSuffix}`, X_AXIS_OFFSET, Y_AXIS_OFFSET);
    } else {
      this.createYAxisLabel(`${this.yStepSize * jumps}${this.labelSuffix}`, X_AXIS_OFFSET, Y_AXIS_OFFSET);
    }
    const boxHeight = this.netHeight / jumps;
    for(let i = 0 ; i < jumps - 1 ; i++) {
      const y = this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - ((i + 1) * boxHeight);
      const text = `${(i + 1) * this.yStepSize}${this.labelSuffix}`;
      this.createYAxisLabel(text, X_AXIS_OFFSET, y);
    }
    this.ctx.stroke();
  }
  
  createYAxisLabel(label, x, y) {
    this.ctx.fillStyle = '#6d6a94';
    this.ctx.fillText(label, x, y);
    this.ctx.moveTo(x + X_CONTEXT_OFFSET(this.labelSuffix), y - GRID_LINE_Y_OFFSET);
    this.ctx.strokeStyle = '#E3E3E8';
    this.ctx.lineHeight = 1;
    this.ctx.lineTo(this.canvasWidth - X_AXIS_OFFSET, y - GRID_LINE_Y_OFFSET);
  }
  
  drawLine(points = [], strokeStyle = '#4b7be5', gradientFirstStopColor = 'rgba(75, 123, 229, 0.2)') {
    this.ctx.beginPath();
    this.ctx.strokeStyle = strokeStyle;
    this.ctx.lineWidth = 2;
    const netHeight = this.canvasHeight - 2 * Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT;
    const baseHeight = this.canvasHeight - GRID_LINE_Y_OFFSET - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT;
    let pointY = 0;
    points.forEach((point, index) => {
      const {x, y} = point;
      const pointTimeLabel = this.formatTime(x);
      const possibleLabel = this.labels.find(entry => entry.label === pointTimeLabel);
      if (!!possibleLabel) {
        const pointX = possibleLabel.x;
        const yAxisBlockHeight = netHeight / this.maxTotal;
        pointY = baseHeight - y * yAxisBlockHeight;
        if (index === 0) {
          this.ctx.moveTo(pointX, pointY);
        } else {
          this.ctx.lineTo(pointX, pointY);
        }
      }
    });
    this.ctx.lineTo(this.canvasWidth - X_AXIS_OFFSET, pointY);
    this.ctx.stroke();
    // close shape to create fill
    // reset line color to be invisible
    this.ctx.strokeStyle = 'rgba(0,0,0,0)';
    this.ctx.lineWidth = 0;
    this.ctx.lineTo(this.canvasWidth - X_AXIS_OFFSET, this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - GRID_LINE_Y_OFFSET);
    this.ctx.lineTo(X_AXIS_OFFSET + X_CONTEXT_OFFSET(this.labelSuffix), this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - GRID_LINE_Y_OFFSET);
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
    const date = new Date(timestamp);
    const monthWord = date.toLocaleString('default', { month: 'short' });
    return `${monthWord} ${date.getDate()}`;
  }
  
  getDefaultSpacing() {
    const url = new URL(window.location.href);
    let days = url.searchParams.get('days');
    let spacing = 1;
    days = parseInt(days) || 30;
    if(days < 30) spacing = 3;
    else if(days < 90) spacing = 6;
    else if(days < 120) spacing = 12;
    else if(days < 180) spacing = 16;
    else spacing = 25;
    
    if(this.canvasWidth < 500) spacing = 40;
    if(this.canvasWidth < 400) spacing = 60;
    if(this.canvasWidth < 300) spacing = 80;
    
    const totalPoints = this.chartData.length;
    const maxLabels = 10;
    if(totalPoints / spacing > maxLabels) {
      spacing = Math.ceil(totalPoints / maxLabels);
    }
    
    return spacing;
  }
  
  getFirstGradientStopColor(hex) {
    switch (hex) {
      case '#4b7be5':
        return 'rgba(75, 123, 229, 0.2)';
      case '#ff695d':
        return 'rgba(255, 105, 93, 0.2)';
      case '#9138e5':
        return 'rgba(145, 56, 229, 0.2)';
      default:
        return null;
    }
  }
}