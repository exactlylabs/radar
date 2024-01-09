import ChartController, {
  BOTTOM_LABELS_HEIGHT, GRID_LINE_Y_OFFSET, PADDING, RIGHT_X_CONTEXT_OFFSET,
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
    this.clearCanvas();
    this.chartData.forEach((barData, index) => {
      this.drawBar(barData, index);
    });
  }
  
  drawBar(barData, index, color = 'rgba(75,123,229,0.5)') {
    this.ctx.beginPath();
    const { y } = barData;
    const barHeight = y * this.netHeight / this.maxYLabelValue;
    let individualBlockCount = this.chartData.length * 2 + this.chartData.length - 1; // one full data block is 2 individual spacers
    const individualBlockWidth = (this.netWidth + RIGHT_X_CONTEXT_OFFSET + PADDING) / individualBlockCount;
    const barX = index * 2 * individualBlockWidth + index * individualBlockWidth + PADDING + X_AXIS_OFFSET + X_CONTEXT_OFFSET(this.labelSuffix);
    const barY = this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - GRID_LINE_Y_OFFSET - barHeight;
    this.ctx.fillStyle = color;
    this.ctx.roundRect(barX, barY, 2 * individualBlockWidth, barHeight, 2, 2, 0, 0);
    this.ctx.fill();
    this.ctx.stroke();
    return { barX, barY, barHeight, barWidth: 2 * individualBlockWidth };
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
  
  showTooltip(mouseX, mouseY) {
    const shouldContinue = this.setupTooltipContext(mouseX, mouseY);
    if(!shouldContinue) return;
    const xDifs = this.chartData.map(({x, _}, index) => Math.abs(this.getXCoordinateFromXValue(this.chartData, index) - mouseX));
    const minDif = Math.min(...xDifs);
    const minDifIndex = xDifs.indexOf(minDif);
    if(!this.mouseOverBar(mouseX, mouseY, minDifIndex)) return;
    const {barX, barY, barHeight, barWidth} = this.drawBar(this.chartData[minDifIndex], minDifIndex, '#4b7be5');
    
    // Tooltip drawing section
    this.ctx.beginPath();
    this.ctx.fillStyle = '#fff';
    this.ctx.strokeStyle = 'rgba(188, 187, 199, 0.15)';
    
    // create shadow for rect
    this.ctx.shadowColor = 'rgba(160, 159, 183, 0.4)';
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 2;
    this.ctx.shadowBlur = 6;
    
    let yCoordinate = barY;
    let xCoordinate = barX + barWidth;
    
    // check if tooltip is within the chart space, otherwise shift over
    const offset = 8;
    const tooltipWidth = 120;
    const tooltipHeight = 70;
    if(xCoordinate + offset + tooltipWidth > this.canvasWidth) {
      xCoordinate = barX - tooltipWidth - offset;
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
    
    this.ctx.fillText('Data usage', xCoordinate + 8, yCoordinate + 8 + 13);
    
    this.ctx.beginPath();
    this.ctx.fillStyle = '#e3e3e8';
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(xCoordinate, yCoordinate + 30);
    this.ctx.lineTo(xCoordinate + tooltipWidth, yCoordinate + 30);
    this.ctx.stroke();
    
    this.ctx.font = '13px Mulish';
    
    this.ctx.fillStyle = '#6d6a94';
    const date = new Date(Number(this.chartData[minDifIndex].x));
    this.ctx.fillText(this.formatTime(date), xCoordinate + 8, yCoordinate + 40 + 13);
    
    this.ctx.font = '13px MulishSemiBold';
    
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(this.formatLabelNumericValue(this.chartData[minDifIndex].y) + this.labelSuffix, xCoordinate + tooltipWidth - 12 - 45, yCoordinate + 40 + 13);
    
    this.ctx.font = '16px Mulish';
  }
  
  mouseOverBar(mouseX, mouseY, possibleBarIndex) {
    let individualBlockCount = this.chartData.length * 2 + this.chartData.length - 1; // one full data block is 2 individual spacers
    const individualBlockWidth = (this.netWidth + RIGHT_X_CONTEXT_OFFSET + PADDING) / individualBlockCount;
    const barX = possibleBarIndex * 2 * individualBlockWidth + possibleBarIndex * individualBlockWidth + PADDING + X_AXIS_OFFSET + X_CONTEXT_OFFSET(this.labelSuffix);
    const barEndX = barX + individualBlockWidth * 2;
    const barHeight = this.chartData[possibleBarIndex].y * this.netHeight / this.maxYLabelValue;
    const barY = this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - GRID_LINE_Y_OFFSET;
    const barEndY = barY - barHeight;
    return mouseX >= barX && mouseX <= barEndX && mouseY <= barY && mouseY >= barEndY;
  }
  
  getXValueAtIndex(index) {
    if(index === -1) this.chartData[this.chartData.length - 1].x;
    return this.chartData[index].x;
  }
}