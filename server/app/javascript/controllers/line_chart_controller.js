import ChartController, {RIGHT_X_CONTEXT_OFFSET, X_AXIS_OFFSET, X_CONTEXT_OFFSET} from "./chart_controller";

export default class LineChartController extends ChartController {
  connect() {
    this.chartId = 'onlinePods';
    super.connect();
  }
  
  prepareData(rawData) {
    this.adjustedData = this.adjustData(rawData);
  }
  
  plotChart() {
    this.clearCanvas();
    this.drawLine(this.adjustedData);
  }
  
  setXAxis() {
    const dateSet = new Set();
    const firstDate = new Date(Number(this.chartData[0].x));
    const lastDate = new Date(Number(this.chartData[this.chartData.length - 1].x));
    const dateDiff = Number(this.chartData[this.chartData.length - 1].x) - Number(this.chartData[0].x);
    const maxLabels = 5;
    const dateStep = Math.ceil(dateDiff / (maxLabels - 1));
    for(let i = 0 ; i < maxLabels - 1 ; i++) {
      const date = new Date(firstDate.getTime() + dateStep * i);
      dateSet.add(this.formatTime(date));
    }
    dateSet.add(this.formatTime(lastDate));
    this.renderLabels(dateSet);
  }
  
  showTooltip(mouseX, mouseY) {
    const shouldContinue = this.setupTooltipContext(mouseX, mouseY);
    if(!shouldContinue) return;
    const xDifs = this.adjustedData.map(({x, _}, index) => Math.abs(this.getXCoordinateFromXValue(this.adjustedData, index) - mouseX));
    const minDif = Math.min(...xDifs);
    const minDifIndex = xDifs.indexOf(minDif);
    
    const { ys } = this.adjustedData[minDifIndex];
    
    let xCoordinate = this.getXCoordinateFromXValue(this.adjustedData, minDifIndex);
    let yCoordinate;
    let yValue;
    if(ys.length === 1) {
      yCoordinate = this.getYCoordinateFromYValue(ys[0]);
      yValue = ys[0];
    } else {
      const yDifs = ys.map(y => Math.abs(this.getYCoordinateFromYValue(y) - mouseY));
      const minDif = Math.min(...yDifs);
      const minDifIndex = yDifs.indexOf(minDif);
      yCoordinate = this.getYCoordinateFromYValue(ys[minDifIndex]);
      yValue = ys[minDifIndex];
    }
    
    this.drawDotOnLine(xCoordinate, yCoordinate);
    
    // Tooltip drawing section
    this.ctx.beginPath();
    this.ctx.fillStyle = '#fff';
    this.ctx.strokeStyle = 'rgba(188, 187, 199, 0.15)';
    
    // create shadow for rect
    this.ctx.shadowColor = 'rgba(160, 159, 183, 0.4)';
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 2;
    this.ctx.shadowBlur = 6;
    
    // check if tooltip is within the chart space, otherwise shift over
    const offset = 8;
    const tooltipWidth = 120;
    const tooltipHeight = 70;
    if(xCoordinate + offset + tooltipWidth > this.canvasWidth) {
      const tooltipEndX = xCoordinate + offset + tooltipWidth;
      const diff = tooltipEndX - this.canvasWidth;
      const dotXCoordinate = xCoordinate;
      xCoordinate -= diff;
      if(dotXCoordinate > xCoordinate && dotXCoordinate < (xCoordinate + offset + tooltipWidth)) {
        xCoordinate = dotXCoordinate - offset - tooltipWidth;
      }
    } else {
      xCoordinate += offset;
    }
    
    if(yCoordinate + offset + tooltipHeight > this.canvasHeight) {
      const tooltipEndY = yCoordinate + offset + tooltipHeight;
      const diff = tooltipEndY - this.canvasHeight;
      yCoordinate -= diff;
    } else {
      yCoordinate += offset;
    }
    
    this.ctx.roundRect(xCoordinate, yCoordinate, tooltipWidth, tooltipHeight, 6);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.shadowColor = 'transparent';
    this.ctx.fillStyle = 'black';
    this.ctx.font = 'normal bold 13px MulishBold';
    
    this.ctx.fillText('Online pods', xCoordinate + 8, yCoordinate + 8 + 13);
    
    this.ctx.beginPath();
    this.ctx.fillStyle = '#e3e3e8';
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(xCoordinate, yCoordinate + 30);
    this.ctx.lineTo(xCoordinate + tooltipWidth, yCoordinate + 30);
    this.ctx.stroke();
    
    this.ctx.font = '13px Mulish';
    
    this.ctx.fillStyle = '#6d6a94';
    const date = new Date(Number(this.adjustedData[minDifIndex].x));
    this.ctx.fillText(this.formatTime(date), xCoordinate + 8, yCoordinate + 40 + 13);
    
    this.ctx.font = '13px MulishSemiBold';
    
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(yValue, xCoordinate + tooltipWidth - 8 - 25, yCoordinate + 40 + 13);
  
    this.ctx.font = '16px Mulish';
  }
  
  getXValueAtIndex(index) {
    if(index === -1) return this.adjustedData[this.adjustedData.length - 1].x;
    return this.adjustedData[index].x;
  }
}