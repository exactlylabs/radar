import ChartController, {HELPER_HEIGHT, CHART_IDS, TOOLTIP_TITLE_PADDING, DOWNSAMPLE_METHODS} from "./chart_controller";

export default class LineChartController extends ChartController {
  connect() {
    this.chartId = 'onlinePods';
    this.usesQueryIntervalValue = true;
    this.chartData = [];
    super.connect();
  }

  prepareData(rawData) {
    if (this.chartId == CHART_IDS.latency) {
      // Trying to cover a specific edge case where in the latency chart, the max value is in the millions
      // so we need to adjust the maxTotal value and unit to something that brings the value down to a more
      // reasonable range
      rawData = this.convertLatencyUnits(rawData);
    }
    this.chartData = this.downsample(rawData, DOWNSAMPLE_METHODS.DECIMATE_MIN_MAX);
    this.adjustedData = this.adjustData(this.chartData);
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

  getYValues() {
    return this.chartData.map(entry => entry.y);
  }

  getXValues() {
    return this.chartData.map(entry => entry.x);
  }

  showTooltip(mouseX, mouseY) {
    const shouldContinue = this.setupTooltipContext(mouseX, mouseY);
    if(!shouldContinue) return;
    const index = this.getIndexFromMouseX(mouseX);
    if(index < 0 || index == null) return;
    const TOOLTIP_TITLE_BOTTOM_PADDING = 30;
    const TOOLTIP_TITLE_TOP_PADDING = 20;
    const TOOLTIP_DATA_TOP_PADDING = 53
    const { ys } = this.adjustedData[index];
    let xCoordinate = this.getXCoordinateFromXValue(this.adjustedData, index);
    let yCoordinate;
    let yValue;
    if(ys.length === 1) {
      yCoordinate = this.getYCoordinateFromYValue(ys[0]);
      yValue = ys[0];
    } else {
      const yDifs = ys.map(y => Math.abs(this.getYCoordinateFromYValue(y) - mouseY));
      const minDif = this.getMin(yDifs);
      const index = yDifs.indexOf(minDif);
      if(index < 0) return;
      yCoordinate = this.getYCoordinateFromYValue(ys[index]);
      yValue = ys[index];
    }
    this.showVerticalDashedLine(mouseX);
    this.drawDotOnLine(xCoordinate, yCoordinate);

    // check if tooltip is within the chart space, otherwise shift over
    const offset = 8;
    let tooltipWidth = 97;
    // I need to check if the content is wider than the tooltip base width and adjust it
    const tooltipTitle = this.formatTime(new Date(Number(this.adjustedData[index].x)));
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

  convertLatencyUnits(data) {
    const secondInMilliseconds = 1_000;
    const minuteInMilliseconds = 60_000;
    const hourInMilliseconds = 3_600_000;
    const maxYValue = this.getMax(data.map(entry => entry.y));

    let biggestUnit = 1;
    if(maxYValue > hourInMilliseconds) {
      biggestUnit = hourInMilliseconds;
      this.labelSuffix = 'h';
    } else if(maxYValue > minuteInMilliseconds) {
      biggestUnit = minuteInMilliseconds;
      this.labelSuffix = 'm';
    } else if(maxYValue > secondInMilliseconds) {
      biggestUnit = secondInMilliseconds;
      this.labelSuffix = 's';
    }

    if(biggestUnit === 1) {
      return data;
    }
    data.forEach((values, key, _) => {
      data[key] = values.map((v) => ({...v, y: v.y / biggestUnit }))
    });
    return data
  }
}
