import ChartController from "./chart_controller";

export default class LineChartController extends ChartController {
  connect() {
    this.chartId = 'onlinePods';
    super.connect();
  }
  
  plotChart() {
    this.clearCanvas();
    this.drawLine(this.chartData);
  }
  
  showTooltip(mouseX, mouseY) {
    const shouldContinue = this.setupTooltipContext(mouseX, mouseY);
    if(!shouldContinue) return;
    
    const step = this.netWidth / this.chartData.length;
    let index = Math.floor(mouseX / step);
    index = index < 0 ? 0 : index > this.chartData.length - 1 ? this.chartData.length - 1 : index;
    const { y } = this.chartData[index];
    const xCoordinate = mouseX;
    const yCoordinate = this.getYCoordinateFromYValue(y);
    
    this.drawDotOnLine(xCoordinate, yCoordinate);
    // this.ctx.beginPath();
    // this.ctx.fillStyle = '#fff';
    // this.ctx.strokeStyle = 'rgba(188, 187, 199, 0.15)';
    // // create shadow for rect
    // this.ctx.shadowColor = 'rgba(160, 159, 183, 0.4)';
    // this.ctx.shadowOffsetX = 0;
    // this.ctx.shadowOffsetY = 2;
    // this.ctx.shadowBlur = 6;
    // this.ctx.fillRect(mouseX, mouseY, 120, 70);
    // this.ctx.stroke();
  }
}