import ChartController, {
  BOTTOM_LABELS_HEIGHT,
  GRID_LINE_Y_OFFSET,
  PADDING,
  RIGHT_X_CONTEXT_OFFSET,
  TOOLTIP_X_OFFSET,
  TOOLTIP_Y_OFFSET,
  TOOLTIP_TITLE_PADDING,
  X_AXIS_OFFSET,
  X_CONTEXT_OFFSET,
  Y_AXIS_OFFSET,
  DEFAULT_BLUE
} from "./chart_controller";

const MB_UNIT = 1024 ** 2;
const GB_UNIT = 1024 ** 3;
const TB_UNIT = 1024 ** 4;

export default class BarChartController extends ChartController {
  connect() {
    this.chartId = this.element.dataset.chartId;
    super.connect();
  }
  
  prepareData(rawData) {
    this.chartData = this.chartData.map((barData) => {
      const {x, y} = barData;
      return {x, y: this.convertToPreferredUnit(y)};
    });
  }
  
  getFirstDate() {
    return Number(this.chartData[0].x);
  }
  
  getLastDate() {
    return Number(this.chartData[this.chartData.length - 1].x);
  }
  
  getChartDataForComparison() {
    return JSON.parse(this.element.dataset.lineChartData);
  }
  
  plotChart() {
    this.clearCanvas();
    this.individualBlockCount ||= this.chartData.length * 2 + this.chartData.length - 1; // one full data block is 2 individual spacers
    this.barWidth = this.calculateBarWidth(this.chartData.length);
    this.chartData.forEach((barData, index) => {
      if(this.isCompareChart) {
        this.drawBar(barData, index, this.getFirstGradientStopColor(this.COMPARISON_HEX[index % this.COMPARISON_HEX.length], 0.5));
      } else {
        this.drawBar(barData, index);
      }
    });
  }
  
  calculateBarWidth(totalDataPointsCount) {
    return 2 * (this.netWidth / this.individualBlockCount);
  }
  
  drawBar(barData, index, color = 'rgba(75,123,229,0.5)') {
    this.ctx.beginPath();
    const { y } = barData;
    const barHeight = y * this.netHeight / this.maxYLabelValue;
    const spaceBetweenBars = this.barWidth / 2;
    const barX = index * this.barWidth + index * spaceBetweenBars + this.horizontalContentStartingPixel;
    const barY = this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - GRID_LINE_Y_OFFSET - barHeight;
    this.ctx.fillStyle = color;
    this.ctx.roundRect(barX, barY, this.barWidth, barHeight, 2, 2, 0, 0);
    this.ctx.fill();
    this.ctx.stroke();
    return { barX, barY, barHeight, barWidth: this.barWidth };
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
    this.showVerticalDashedLine(mouseX);
    const xDifs = this.chartData.map(({x, _}, index) => Math.abs(this.getXCoordinateFromXValue(this.chartData, index) - mouseX));
    const minDif = Math.min(...xDifs);
    const minDifIndex = xDifs.indexOf(minDif);
    if(minDifIndex < 0) return;
    if(!this.mouseOverBar(mouseX, mouseY, minDifIndex)) return;
    const res = this.isCompareChart ? this.drawBar(this.chartData[minDifIndex], minDifIndex, this.getFirstGradientStopColor(this.COMPARISON_HEX[minDifIndex % this.COMPARISON_HEX.length], 1)) : this.drawBar(this.chartData[minDifIndex], minDifIndex, DEFAULT_BLUE);
    const {barX, barY, barHeight, barWidth} = res;
    
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
    // if there is no space left, draw on top of the bar
    const offset = 8;
    let tooltipWidth = 120;
    const tooltipTitle= this.formatTime(new Date(Number(this.chartData[minDifIndex].x)));
    const tooltipTitleWidth = this.textWidth(tooltipTitle) + TOOLTIP_TITLE_PADDING;
    
    if(tooltipTitleWidth > tooltipWidth) tooltipWidth = tooltipTitleWidth;
    
    const tooltipDataLength = offset + this.textWidth(this.formatLabelNumericValue(this.chartData[minDifIndex].y) + this.labelSuffix);
    
    if(tooltipDataLength > tooltipWidth) tooltipWidth = tooltipDataLength;
    
    const tooltipHeight = 70;
    if(xCoordinate + offset + tooltipWidth > this.canvasWidth) {
      xCoordinate = barX - tooltipWidth - offset;
    } else {
      xCoordinate += offset;
    }
    
    if(xCoordinate < 0) {
      xCoordinate = mouseX;
    }
    
    
    if(xCoordinate === mouseX) {
      yCoordinate = mouseY;
    } else if(yCoordinate + offset + tooltipHeight > this.canvasHeight) {
      const tooltipEndY = yCoordinate + offset + tooltipHeight;
      const diff = tooltipEndY - this.canvasHeight;
      yCoordinate -= diff;
    } else {
      yCoordinate += offset;
    }
    const radii = 6;
    this.ctx.roundRect(xCoordinate, yCoordinate, tooltipWidth, tooltipHeight, radii);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.shadowColor = 'transparent';
    this.ctx.fillStyle = 'black';
    this.ctx.font = 'normal bold 13px MulishBold';
    
    this.ctx.fillText(this.formatTime(tooltipTitle), xCoordinate + TOOLTIP_X_OFFSET, yCoordinate + TOOLTIP_Y_OFFSET);
    
    this.ctx.beginPath();
    this.ctx.fillStyle = '#e3e3e8';
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(xCoordinate, yCoordinate + 30);
    this.ctx.lineTo(xCoordinate + tooltipWidth, yCoordinate + 30);
    this.ctx.stroke();
    
    this.ctx.font = '13px Mulish';
    
    this.ctx.fillStyle = '#6d6a94';
    if(this.isCompareChart) {
      this.ctx.fillText('Data:', xCoordinate + 8, yCoordinate + 40 + 13);
    }
    
    this.ctx.font = '13px MulishSemiBold';
    
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(this.formatLabelNumericValue(this.chartData[minDifIndex].y) + " " + this.labelSuffix, xCoordinate + offset, yCoordinate + 40 + 13);
    
    this.ctx.font = '16px Mulish';
  }
  
  mouseOverBar(mouseX, mouseY, possibleBarIndex) {
    const startBarX = this.horizontalContentStartingPixel + possibleBarIndex * (this.barWidth + this.barWidth / 2);
    const endBarX = startBarX + this.barWidth;
    const barHeight = this.chartData[possibleBarIndex].y * this.netHeight / this.maxYLabelValue;
    const barY = this.canvasHeight - Y_AXIS_OFFSET - BOTTOM_LABELS_HEIGHT - GRID_LINE_Y_OFFSET;
    const barEndY = barY - barHeight;
    return mouseX >= startBarX && mouseX <= endBarX && mouseY <= barY && mouseY >= barEndY;
  }
  
  getXValueAtIndex(index) {
    if(index === -1) return this.chartData[this.chartData.length - 1].x;
    return this.chartData[index].x;
  }
}