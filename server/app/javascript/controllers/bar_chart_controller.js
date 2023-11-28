import ChartController, {
  BOTTOM_LABELS_HEIGHT, GRID_LINE_Y_OFFSET,
  X_AXIS_OFFSET,
  X_CONTEXT_OFFSET,
  Y_AXIS_OFFSET
} from "./chart_controller";

const MB_UNIT = 1024 ** 2;
const GB_UNIT = 1024 ** 3;
const TB_UNIT = 1024 ** 4;

export default class BarChartController extends ChartController {
  connect() {
    super.connect();
  }
  
  prepareData(rawData) {
    this.chartData = this.chartData.map((barData) => {
      const { x, y } = barData;
      return { x, y: this.convertToPreferredUnit(y) };
    })
  }
  
  plotChart() {
    this.chartData.forEach((barData, index) => {
      this.drawBar(barData, index);
    });
  }
  
  drawBar(barData, index) {
    this.ctx.beginPath();
    const { y } = barData;
    const barHeight = y * this.netHeight / this.maxTotal;
    const barWidth = (this.netWidth - this.chartData.length * 4) / this.chartData.length;
    const barX = this.labels[index].x;
    const barY = this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - GRID_LINE_Y_OFFSET - barHeight;
    this.ctx.fillStyle = 'rgba(75,123,229,0.5)';
    this.ctx.roundRect(barX, barY, barWidth, barHeight, 2, 2, 0, 0);
    this.ctx.fill();
    this.ctx.stroke();
    this.ctx.beginPath();
  }
  
  // incoming value is in bytes, use this.preferredUnit to convert to MB, GB, etc.
  convertToPreferredUnit(value) {
    switch (this.labelSuffix) {
      case 'MB':
        return value / MB_UNIT;
      case 'GB':
        return value / GB_UNIT;
      case 'TB':
        return value / TB_UNIT;
      default:
          return value;
    }
  }
}