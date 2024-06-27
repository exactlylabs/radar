import ChartController, {
  BOTTOM_LABELS_HEIGHT,
  GRID_LINE_Y_OFFSET,
  TOOLTIP_TITLE_PADDING,
  Y_AXIS_OFFSET,
  DEFAULT_BLUE, TOOLTIP_X_OFFSET, TOOLTIP_Y_OFFSET
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
  
  getChartDataForComparison(rawData) {
    return rawData;
  }
  
  plotChart() {
    this.clearCanvas();
    this.individualBlockCount ||= this.calculateIndividualBlockCount();
    this.barWidth = this.calculateBarWidth(this.chartData.length);
    this.chartData.forEach((barData, index) => {
      if(this.isCompareChart) {
        this.drawBar(barData, index, this.getFirstGradientStopColor(this.COMPARISON_HEX[index % this.COMPARISON_HEX.length], 0.5));
      } else {
        this.drawBar(barData, index);
      }
    });
  }
  
  /**
   * To have equally spaced bars, we split the entire available space into equal "blocks".
   * Each data point will have 2 blocks for the bar and 1 block for the space in between bars.
   * The last block has no space to the right, reason for the -1 at the end.
   *
   * @example: { this.chartData = [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }] }
   * --------    --------    --------
   * |  2   | 1  |  2   | 1  |  2   |
   * |      |    |      |    |      |
   * |      |    |      |    |      |
   * --------    --------    --------
   *    x1          x2          x3
   *
   * Block count would be 3 * 2 + 3 - 1 = 8
   * @returns {number}
   */
  calculateIndividualBlockCount() {
    return this.chartData.length * 2 + this.chartData.length - 1; // one full data block is 2 individual spacers
  }
  
  calculateBarWidth(totalDataPointsCount) {
    return 2 * (this.netWidth / this.individualBlockCount);
  }
  
  setXAxis() {
    if(!this.isCompareChart) {
      super.setXAxis();
    }
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
  
  showComparisonTooltip(mouseX, mouseY, hoveredBarProperties, hoveredBarData) {
    const SPACING_BETWEEN_TOOLTIP_AND_BAR = 14;
    const TOOLTIP_HEIGHT = 30;
    const PADDING = 4;
    
    const { barX, barY, barHeight, barWidth } = hoveredBarProperties;
    let yCoordinate = barY - SPACING_BETWEEN_TOOLTIP_AND_BAR - TOOLTIP_HEIGHT;
    const tooltipText = Number(hoveredBarData.y).toFixed(2) + " " + this.labelSuffix;
    const tooltipWidth = this.textWidth(tooltipText) + PADDING * 2;
    const midYPoint = yCoordinate + TOOLTIP_HEIGHT / 2 + PADDING;
    let xCoordinate = barX + barWidth / 2 - tooltipWidth / 2;
    
    if(yCoordinate < 0) {
      yCoordinate = SPACING_BETWEEN_TOOLTIP_AND_BAR / 2;
      xCoordinate = barX + barWidth + SPACING_BETWEEN_TOOLTIP_AND_BAR / 2;
    }
    
    this.ctx.roundRect(xCoordinate, yCoordinate, tooltipWidth, TOOLTIP_HEIGHT, 6);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.shadowColor = 'transparent';
    
    const [tooltipValue, tooltipUnit] = tooltipText.split(" ");
    
    this.ctx.fillStyle = 'black';
    this.ctx.font = 'normal bold 13px MulishBold';
    const tooltipValueXCoordinate = xCoordinate + PADDING;
    this.ctx.fillText(tooltipValue, tooltipValueXCoordinate, midYPoint);
    
    const tooltipUnitXCoordinate = tooltipValueXCoordinate + this.textWidth(tooltipValue + " ");
    this.ctx.font = '13px Mulish';
    this.ctx.fillText(tooltipUnit, tooltipUnitXCoordinate, midYPoint);
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
    
    const TOOLTIP_TITLE_BOTTOM_PADDING = 30;
    const TOOLTIP_COMPARISON_DATA_TOP_PADDING = 53;
    const OFFSET = 8;
    
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
    
    if(this.isCompareChart) {
      this.showComparisonTooltip(mouseX, mouseY, res, this.chartData[minDifIndex]);
      return;
    }
    
    let yCoordinate = barY;
    let xCoordinate = barX + barWidth;
    
    // check if tooltip is within the chart space, otherwise shift over
    // if there is no space left, draw on top of the bar
    let tooltipWidth = 120;
    const tooltipTitle= this.formatTime(new Date(Number(this.chartData[minDifIndex].x)));
    const tooltipTitleWidth = this.textWidth(tooltipTitle) + TOOLTIP_TITLE_PADDING;
    
    if(tooltipTitleWidth > tooltipWidth) tooltipWidth = tooltipTitleWidth;
    
    const tooltipDataLength = OFFSET + this.textWidth(this.formatLabelNumericValue(this.chartData[minDifIndex].y) + this.labelSuffix);
    
    if(tooltipDataLength > tooltipWidth) tooltipWidth = tooltipDataLength;
    
    const tooltipHeight = 70;
    if(xCoordinate + OFFSET + tooltipWidth > this.canvasWidth) {
      xCoordinate = barX - tooltipWidth - OFFSET;
    } else {
      xCoordinate += OFFSET;
    }
    
    if(xCoordinate < 0) {
      xCoordinate = mouseX;
    }
    
    
    if(xCoordinate === mouseX) {
      yCoordinate = mouseY;
    } else if(yCoordinate + OFFSET + tooltipHeight > this.canvasHeight) {
      const tooltipEndY = yCoordinate + OFFSET + tooltipHeight;
      const diff = tooltipEndY - this.canvasHeight;
      yCoordinate -= diff;
    } else {
      yCoordinate += OFFSET;
    }
    const RADII = 6;
    this.ctx.roundRect(xCoordinate, yCoordinate, tooltipWidth, tooltipHeight, RADII);
    this.ctx.fill();
    this.ctx.stroke();
    
    this.ctx.shadowColor = 'transparent';
    this.ctx.fillStyle = 'black';
    this.ctx.font = 'normal bold 13px MulishBold';
    
    this.ctx.fillText(this.formatTime(tooltipTitle), xCoordinate + TOOLTIP_X_OFFSET, yCoordinate + TOOLTIP_Y_OFFSET);
    
    this.ctx.beginPath();
    this.ctx.fillStyle = '#e3e3e8';
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(xCoordinate, yCoordinate + TOOLTIP_TITLE_BOTTOM_PADDING);
    this.ctx.lineTo(xCoordinate + tooltipWidth, yCoordinate + TOOLTIP_TITLE_BOTTOM_PADDING);
    this.ctx.stroke();
    
    this.ctx.font = '13px Mulish';
    
    this.ctx.fillStyle = '#6d6a94';
    if(this.isCompareChart) {
      this.ctx.fillText('Data:', xCoordinate + OFFSET, yCoordinate + TOOLTIP_COMPARISON_DATA_TOP_PADDING);
    }
    
    this.ctx.font = '13px MulishSemiBold';
    
    this.ctx.fillStyle = 'black';
    this.ctx.fillText(this.formatLabelNumericValue(this.chartData[minDifIndex].y) + " " + this.labelSuffix, xCoordinate + OFFSET, yCoordinate + 40 + 13);
    
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