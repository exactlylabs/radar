import ChartController, {
  BOTTOM_LABELS_HEIGHT,
  GRID_LINE_Y_OFFSET,
  TOOLTIP_TITLE_PADDING,
  Y_AXIS_OFFSET,
  DEFAULT_BLUE, TOOLTIP_X_OFFSET, TOOLTIP_Y_OFFSET, RADII
} from "./chart_controller";

const MB_UNIT = 1024 ** 2;
const GB_UNIT = 1024 ** 3;
const TB_UNIT = 1024 ** 4;

export default class BarChartController extends ChartController {
  connect() {
    this.chartId = this.element.dataset.chartId;
    this.barIdentifiers = [];
    this.selectedHexes = [];
    super.connect();
  }

  prepareData(rawData) {
    this.chartData = this.chartData.map((barData) => {
      const {x, y, hex} = barData;
      return {x, y: this.convertToPreferredUnit(y), hex};
    });
    this.adjustedData = this.chartData;
  }

  getFirstDate() {
    return Number(this.chartData[0].x);
  }

  getLastDate() {
    return Number(this.chartData[this.chartData.length - 1].x);
  }

  getChartDataForComparison(rawData) {
    this.barIdentifiers = rawData
      .map((row, index) => ({identifier: row['entity_identifier'], hex: this.COMPARISON_HEX[index % this.COMPARISON_HEX.length]}));
    this.adjustedData = rawData.map((row, index) => ({x: row.entity_identifier, y: row.y, hex: this.COMPARISON_HEX[index % this.COMPARISON_HEX.length]}));
    return this.adjustedData;
  }

  plotChart() {
    this.clearCanvas();
    this.individualBlockCount = this.calculateIndividualBlockCount();
    this.barWidth = this.calculateBarWidth(this.adjustedData.length);
    this.adjustedData.forEach((barData, index) => {
      if(this.isCompareChart) {
        this.drawBar(barData, index, this.getFirstGradientStopColor(barData.hex, 0.5));
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
    return this.adjustedData.length * 2 + this.adjustedData.length - 1; // one full data block is 2 individual spacers
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
    const TOOLTIP_HEIGHT = 60;
    const PADDING = 8;
    const TOOLTIP_TITLE_BOTTOM_PADDING = 4;
    const TOOLTIP_DIVIDING_LINE_HEIGHT = 1;

    const {barX, barY, barHeight, barWidth} = hoveredBarProperties;
    let yCoordinate = barY - SPACING_BETWEEN_TOOLTIP_AND_BAR - TOOLTIP_HEIGHT;
    let tooltipIdentifier = hoveredBarData.x;
    const tooltipText = Number(hoveredBarData.y).toFixed(2) + " " + this.labelSuffix;
    let tooltipWidth = Math.max(this.textWidth(tooltipIdentifier), this.textWidth(tooltipText)) + PADDING * 2;
    tooltipWidth = tooltipWidth > 210 ? 210 : tooltipWidth;
    if (tooltipIdentifier.length > 30) {
      tooltipIdentifier = tooltipIdentifier.substring(0, 27) + "...";
    }
    let xCoordinate = barX + barWidth / 2 - tooltipWidth / 2;

    if(yCoordinate < 0) {
      yCoordinate = SPACING_BETWEEN_TOOLTIP_AND_BAR / 2;
      xCoordinate = barX + barWidth + SPACING_BETWEEN_TOOLTIP_AND_BAR / 2;
    }

    if(xCoordinate + tooltipWidth > this.canvasWidth) {
      xCoordinate = this.canvasWidth - barWidth - SPACING_BETWEEN_TOOLTIP_AND_BAR / 2 - tooltipWidth;
    }

    const [tooltipValue, tooltipUnit] = tooltipText.split(" ");

    this.createTooltipShape(xCoordinate, yCoordinate, tooltipWidth, TOOLTIP_HEIGHT);

    const tooltipValueXCoordinate = xCoordinate + PADDING;
    const tooltipIdentifierYCoordinate = yCoordinate + 24;
    this.ctx.fillStyle = '#3F3C70';
    // if the text is too long, add ellipsis at the end
    this.ctx.fillText(tooltipIdentifier, tooltipValueXCoordinate, tooltipIdentifierYCoordinate, tooltipWidth - PADDING * 2);
    this.drawTooltipDivingLine(xCoordinate, xCoordinate + tooltipWidth, tooltipIdentifierYCoordinate + TOOLTIP_TITLE_BOTTOM_PADDING * 2);
    this.ctx.fillStyle = '#110E4C';
    const tooltipValueYCoordinate = tooltipIdentifierYCoordinate + TOOLTIP_DIVIDING_LINE_HEIGHT + PADDING + 16;
    this.ctx.fillText(tooltipValue, tooltipValueXCoordinate, tooltipValueYCoordinate);
    const tooltipUnitXCoordinate = tooltipValueXCoordinate + this.textWidth(tooltipValue + " ");
    this.ctx.font = '13px Mulish';
    this.ctx.fillText(tooltipUnit, tooltipUnitXCoordinate, tooltipValueYCoordinate);
    this.ctx.stroke();
  }

  showTooltip(mouseX, mouseY) {
    const shouldContinue = this.setupTooltipContext(mouseX, mouseY);
    if(!shouldContinue) return;
    this.showVerticalDashedLine(mouseX);
    this.resetStrokeStyles();
    const xDifs = this.adjustedData.map(({x, _}, index) => Math.abs(this.getXCoordinateFromXValue(this.adjustedData, index) - mouseX));
    const minDif = Math.min(...xDifs);
    const minDifIndex = xDifs.indexOf(minDif);
    if(minDifIndex < 0) return;
    if(!this.mouseOverBar(mouseX, mouseY, minDifIndex)) return;

    const TOOLTIP_TITLE_BOTTOM_PADDING = 30;
    const TOOLTIP_COMPARISON_DATA_TOP_PADDING = 53;
    const OFFSET = 8;

    const res = this.isCompareChart ? this.drawBar(this.adjustedData[minDifIndex], minDifIndex, this.getFirstGradientStopColor(this.COMPARISON_HEX[minDifIndex % this.COMPARISON_HEX.length], 1)) : this.drawBar(this.chartData[minDifIndex], minDifIndex, DEFAULT_BLUE);
    const {barX, barY, barHeight, barWidth} = res;

    if(this.isCompareChart) {
      this.showComparisonTooltip(mouseX, mouseY, res, this.adjustedData[minDifIndex]);
      return;
    }

    let yCoordinate = barY;
    let xCoordinate = barX + barWidth;

    // check if tooltip is within the chart space, otherwise shift over
    // if there is no space left, draw on top of the bar
    let tooltipWidth = 120;
    const tooltipTitle = this.formatTime(new Date(Number(this.adjustedData[minDifIndex].x)));
    const tooltipTitleWidth = this.textWidth(tooltipTitle) + TOOLTIP_TITLE_PADDING;

    if(tooltipTitleWidth > tooltipWidth) tooltipWidth = tooltipTitleWidth;

    const tooltipDataLength = OFFSET + this.textWidth(this.formatLabelNumericValue(this.adjustedData[minDifIndex].y) + this.labelSuffix);

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
    this.createTooltipShape(xCoordinate, yCoordinate, tooltipWidth, tooltipHeight);
    this.ctx.fillText(tooltipTitle, xCoordinate + TOOLTIP_X_OFFSET, yCoordinate + TOOLTIP_Y_OFFSET);
    this.drawTooltipDivingLine(xCoordinate, xCoordinate + tooltipWidth, yCoordinate + TOOLTIP_TITLE_BOTTOM_PADDING);
    this.setTooltipContentTextStyle();
    this.ctx.fillText(this.formatLabelNumericValue(this.adjustedData[minDifIndex].y) + " " + this.labelSuffix, xCoordinate + OFFSET, yCoordinate + 40 + 13);

    this.ctx.font = '16px Mulish';
  }

  mouseOverBar(mouseX, mouseY, possibleBarIndex) {
    const startBarX = this.horizontalContentStartingPixel + possibleBarIndex * (this.barWidth + this.barWidth / 2);
    const endBarX = startBarX + this.barWidth;
    const barHeight = this.adjustedData[possibleBarIndex].y * this.netHeight / this.maxYLabelValue;
    const barY = this.chartBottomStart;
    const barEndY = barY - barHeight;
    return mouseX >= startBarX && mouseX <= endBarX && mouseY <= barY && mouseY >= barEndY;
  }

  getXValueAtIndex(index) {
    if(index === -1) return this.adjustedData[this.adjustedData.length - 1].x;
    return this.adjustedData[index].x;
  }

  toggleBar(e) {
    if(e.detail.chartId !== this.chartId) return;
    const selectedHex = e.detail.selectedLine;
    const selectedLabel = e.detail.selectedLabel;
    const selectedEntryKey = `${selectedHex}-${selectedLabel}`;
    if(this.selectedHexes.includes(selectedEntryKey)) {
      this.selectedHexes = this.selectedHexes.filter(key => key !== selectedEntryKey);
    } else {
      this.selectedHexes.push(selectedEntryKey);
    }

    if(this.selectedHexes.length === 0) {
      this.adjustedData = this.chartData;
    } else {
      this.adjustedData = this.chartData.filter((entry, index) => {
        const entryHex = this.barIdentifiers[index].hex;
        const entryLabel = this.barIdentifiers[index].identifier;
        return this.selectedHexes.findIndex(key => key === `${entryHex}-${entryLabel}`) !== -1;
      });
    }
    this.plotChart();
  }
}