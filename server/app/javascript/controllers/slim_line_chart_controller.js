import LineChartController from "./line_chart_controller";
import {DOT_SIZE} from "./chart_controller";

const TOP_CLEARANCE = 10;

export default class SlimLineChartController extends LineChartController {
  connect() {
    this.chartId = 'slimDownloadSpeed';
    this.usesQueryIntervalValue = false;
    this.color = this.parseColor(this.element.dataset.chartColor);
    super.connect();
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
    this.setNetWidth();
    this.netHeight = this.canvasHeight - TOP_CLEARANCE;
    this.chartBottomStart = this.canvasHeight
    this.plotChart();
  }
  //
  showTooltip(mouseX, mouseY) {}

  // createYAxisLabel() {}

  setChartAxis() {
    this.setYAxis();
  }

  getXCoordinateFromXValue(data = this.chartData, index) {
    const netWidth = this.netWidth - DOT_SIZE / 2;
    const step = netWidth / (data.length - 1 > 0 ? data.length - 1 : 1);
    return step * index;
  }

  getYCoordinateFromYValue(yValue) {
    const netHeight = this.canvasHeight - TOP_CLEARANCE;
    const yAxisBlockHeight = netHeight / this.maxYLabelValue;
    const baseHeight = this.canvasHeight;
    return baseHeight - yValue * yAxisBlockHeight;
  }

  closeLine(pointY, gradientFirstStopColor) {
    this.ctx.lineTo(this.canvasWidth, pointY);
    this.ctx.stroke();
    // close shape to create fill
    // reset line color to be invisible
    this.ctx.strokeStyle = 'rgba(0,0,0,0)';
    this.ctx.lineWidth = 0;
    this.ctx.lineTo(this.canvasWidth, this.canvasHeight);
    this.ctx.lineTo(0, this.canvasHeight);
    this.ctx.closePath();
    const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvasHeight);
    gradient.addColorStop(0, gradientFirstStopColor);
    gradient.addColorStop(1, '#fff');
    this.ctx.fillStyle = gradient;
    this.ctx.fill();
    this.ctx.stroke();
  }

  plotChart() {
    this.clearCanvas();
    this.drawLine(this.adjustedData, this.color, this.getFirstGradientStopColor(this.color));
  }

  drawJumpLines() {
    let jumps = Math.ceil(this.maxTotal / this.yStepSize);
    if(isNaN(jumps)) jumps = 1;
    this.maxYLabelValue = jumps * this.yStepSize;
  }
  //
  setNetWidth() {
    this.netWidth = this.canvasWidth;
    this.horizontalContentStartingPixel= 0;
  }
  //
  paintInitialChart() {
    if(this.lineToggler) this.lineToggler.style.display = 'block';
    this.skeleton.style.display = 'none';
    this.prepareData(this.chartData);
    window.addEventListener('resize', this.loadChart.bind(this));
    this.loadChart();
  }
  //
  showVerticalDashedLine(mouseX) {}

  parseColor(color) {
    if (color === 'green') {
      return '#31b36c';
    } else if (color === 'red') {
      return '#f1416c';
    } else {
      return '#6d6a94';
    }
  }
}