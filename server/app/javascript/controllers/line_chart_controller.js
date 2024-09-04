import ChartController, {HELPER_HEIGHT, RADII, TOOLTIP_TITLE_PADDING} from "./chart_controller";

export default class LineChartController extends ChartController {
  connect() {
    this.chartId = 'onlinePods';
    this.usesQueryIntervalValue = true;
    super.connect();
  }
  
  prepareData(rawData) {
    this.adjustedData = this.adjustData(rawData);
  }
  
  plotChart() {
    this.clearCanvas();
    this.drawLine(this.adjustedData);
  }
  
  getFirstDate() {
    return Number(this.chartData[0].x);
  }
  
  getLastDate() {
    return Number(this.chartData[this.chartData.length - 1].x);
  }
  
  showTooltip(mouseX, mouseY) {
    const shouldContinue = this.setupTooltipContext(mouseX, mouseY);
    if(!shouldContinue) return;
    const xDifs = this.adjustedData.map(({x, _}, index) => Math.abs(this.getXCoordinateFromXValue(this.adjustedData, index) - mouseX));
    const minDif = Math.min(...xDifs);
    const minDifIndex = xDifs.indexOf(minDif);
    if(minDifIndex < 0) return;
    
    const TOOLTIP_TITLE_BOTTOM_PADDING = 30;
    const TOOLTIP_TITLE_TOP_PADDING = 20;
    const TOOLTIP_DATA_TOP_PADDING = 53
    
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
      if(minDifIndex < 0) return;
      yCoordinate = this.getYCoordinateFromYValue(ys[minDifIndex]);
      yValue = ys[minDifIndex];
    }
    this.showVerticalDashedLine(mouseX);
    this.drawDotOnLine(xCoordinate, yCoordinate);
    
    // check if tooltip is within the chart space, otherwise shift over
    const offset = 8;
    let tooltipWidth = 97;
    
    // I need to check if the content is wider than the tooltip base width and adjust it
    const tooltipTitle = this.formatTime(new Date(Number(this.adjustedData[minDifIndex].x)));
    const tooltipTitleWidth = this.ctx.measureText(tooltipTitle).width + TOOLTIP_TITLE_PADDING;
    if(tooltipTitleWidth > tooltipWidth) {
      tooltipWidth = tooltipTitleWidth;
    }
    
    const tooltipContent = `${yValue} pods`;
    const tooltipContentWidth = this.ctx.measureText(tooltipContent).width + TOOLTIP_TITLE_PADDING;
    if(tooltipContentWidth > tooltipWidth) {
      tooltipWidth = tooltipContentWidth;
    }
    
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
    
    const bottomHelperTopY = this.canvasHeight - HELPER_HEIGHT;
    if(yCoordinate + offset + tooltipHeight > bottomHelperTopY) {
      const tooltipEndY = yCoordinate + offset + tooltipHeight;
      const diff = tooltipEndY - bottomHelperTopY;
      yCoordinate -= diff;
    } else {
      yCoordinate += offset;
    }
    
    this.createTooltipShape(xCoordinate, yCoordinate, tooltipWidth, tooltipHeight);
    this.ctx.fillText(tooltipTitle, xCoordinate + offset, yCoordinate + TOOLTIP_TITLE_TOP_PADDING);
    this.drawTooltipDivingLine(xCoordinate, xCoordinate + tooltipWidth, yCoordinate + TOOLTIP_TITLE_BOTTOM_PADDING);
    this.setTooltipContentTextStyle();
    this.ctx.fillText(`${yValue} pods`, xCoordinate + offset, yCoordinate + TOOLTIP_DATA_TOP_PADDING);
  
    this.ctx.font = '16px Mulish';
  }
  
  getXValueAtIndex(index) {
    if(index === -1) return this.adjustedData[this.adjustedData.length - 1].x;
    return this.adjustedData[index].x;
  }
}