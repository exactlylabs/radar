import ChartController from "./chart_controller";

export default class MultiLineChartController extends ChartController {
  connect() {
    super.connect();
  }
  
  setXAxis() {
    this.ctx.fillStyle = '#6d6a94';
    const dateSet = new Set();
    const defaultSpacing = this.getDefaultSpacing();
    const firstLine = this.chartData.keys().next().value;
    const hasEnoughDataPoints = this.chartData.get(firstLine).length > defaultSpacing;
    this.chartData.get(firstLine).forEach((point, index) => {
      if(hasEnoughDataPoints && index % defaultSpacing !== 0) return;
      const { x } = point;
      dateSet.add(this.formatTime(x));
    });
    this.renderLabels(dateSet);
  }
  
  setYAxis() {
    this.ctx.beginPath();
    this.ctx.fillStyle = 'black';
    this.ctx.font = '13px Mulish';
    this.maxTotal = 0;
    this.chartData.forEach((value, key) => {
      const totals = value.map(entry => entry.y);
      const max = Math.max(...totals);
      if(max > this.maxTotal) this.maxTotal = max;
    });
    this.yStepSize = Math.ceil(this.maxTotal / 3);
    this.drawJumpLines();
  }
  
  prepareData(rawData) {
    const data = new Map();
    rawData.forEach((line, index) => {
      const { x } = line;
      Object.keys(line).forEach((key) => {
        if(key === 'x') return;
        const color = key;
        const y = line[key];
        if(data.has(color)) {
          data.get(color).push({ x, y });
        } else {
          data.set(color, [{ x, y }]);
        }
      });
    });
    this.chartData = data;
  }
  
  plotChart() {
    this.chartData.forEach((points, colorHex) => {
      this.drawLine(points, colorHex, this.getFirstGradientStopColor(colorHex));
    });
  }
}