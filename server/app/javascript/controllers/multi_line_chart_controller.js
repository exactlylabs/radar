import ChartController, {
  DOT_SIZE,
  HELPER_HEIGHT,
  QUERY_INTERVALS,
  RADII,
  TOOLTIP_TITLE_PADDING
} from "./chart_controller";

const MB_UNIT = 1024 ** 2;
const GB_UNIT = 1024 ** 3;
const TB_UNIT = 1024 ** 4;

const MAX_TOOLTIP_LINES = 5;


export default class MultiLineChartController extends ChartController {
  connect() {
    this.chartId = this.element.dataset.chartId;
    this.selectedHexes = [];
    // limit label to max 10 characters, and add ellipsis
    this.entitiesAndHexes = JSON.parse(this.element.dataset.entitiesAndHexes)
                            .map(i => JSON.parse(i))
      .map(i => ({label: i.label.length > 12 ? i.label.substring(0, 12) + '...' : i.label, hex: i.hex}));
    this.usesQueryIntervalValue = Object.values(QUERY_INTERVALS).includes(this.element.dataset.queryTimeInterval);
    this.chartData = [];
    super.connect();
    this.responsiveMaxHeight = 220;
  }

  getFirstDate() {
    return Number(this.chartData.values().next().value[0].x);
  }

  getLastDate() {
    return Number(this.chartData.values().next().value[this.chartData.values().next().value.length - 1].x);
  }

  getYValues() {
    let yValues = [];
    this.chartData.forEach((value, _) => {
      yValues.push(...value.map(entry => entry.y));
    });
    return yValues;
  }

  getXValues() {
    return this.chartData.values().next().value.map(entry => entry.x);
  }

  prepareData(rawData) {
    if(!this.isCompareChart) {
      const data = new Map();
      rawData.forEach((line, index) => {
        const {x} = line;
        Object.keys(line).forEach((key) => {
          if (key === 'x') return;
          const color = key;
          const y = line[key];
          if (data.has(color)) {
            data.get(color).push({x, y});
          } else {
            data.set(color, [{x, y}]);
          }
        });
      });
      this.chartData = data;
    } else {
      this.chartData = this.getChartDataForComparison(rawData)
    }
    this.chartData = this.downsample(this.chartData, "decimate-minmax");
    this.adjustedData = this.adjustData(this.chartData);
  }

  adjustData(points) {
    const adjustedDataByHex = new Map();
    points.forEach((linePoints, lineHex) => {
      if(this.selectedHexes.length === 0 || (this.selectedHexes.includes(lineHex)))
        adjustedDataByHex.set(lineHex, this.adjustLineData(linePoints));
    });
    return adjustedDataByHex;
  }

  getChartDataForComparison(rawData) {
    let lastHexUsed = 0;
    const data = new Map();
    const seenKeys = new Map();
    const timestamps = [];
    rawData.forEach((line) => {
      let hexIndex;
      if(seenKeys.has(line['entity_identifier'])) {
        hexIndex = seenKeys.get(line['entity_identifier']);
      } else {
        seenKeys.set(line['entity_identifier'], lastHexUsed);
        hexIndex = lastHexUsed;
        lastHexUsed++;
      }
      const hex = this.COMPARISON_HEX[hexIndex % this.COMPARISON_HEX.length];
      const x = line['x'];
      const y = line['y'];
      if(data.has(hex)) {
        data.get(hex).push({x, y});
      } else {
        data.set(hex, [{x, y}]);
      }
      if(!timestamps.includes(x)) timestamps.push(x);
    });
    timestamps.sort();

    // Zip the timestamps array into each line object
    // The resulting data object will have all lines under the same timestamp axis, with gaps filled using forward-fill rule.
    data.forEach((linePoints, key, _) => {
      let merged = [];
      let lineIndex = 0;

      timestamps.forEach(timestamp  => {
        if (lineIndex < linePoints.length && Number(linePoints[lineIndex].x) == Number(timestamp)) {
          merged.push(linePoints[lineIndex]);
          lineIndex++;
        } else {
          const lastValue = lineIndex > 0 ? linePoints[lineIndex-1].y : 0;
          merged.push({x: timestamp, y: lastValue});
        }
      });
      data.set(key, merged);
    });

    if(this.chartId === 'compareDataUsage') {
      data.forEach((linePoints, hex) => {
        data.set(hex, linePoints.map(lp => ({x: lp.x, y: this.convertToPreferredUnit(lp.y)})));
      });
    }
    return data;
  }

  plotChart() {
    this.clearCanvas();
    for(let [hex, points] of this.adjustedData.entries()) {
      if(this.selectedHexes.length > 0) {
        if(this.selectedHexes.includes(hex)) this.drawLine(points, hex, this.getFirstGradientStopColor(hex));
      } else {
        this.drawLine(points, hex, this.getFirstGradientStopColor(hex));
      }
    }
  }

  toggleLine(e) {
    const chartId = e.detail.chartId;
    if(chartId !== this.chartId) return;
    const selectedHex = e.detail.selectedLine;
    if(this.selectedHexes.includes(selectedHex)) {
      this.selectedHexes = this.selectedHexes.filter(hex => hex !== selectedHex);
    } else {
      this.selectedHexes.push(selectedHex);
    }
    this.adjustedData = this.adjustData(this.chartData);
    this.plotChart();
  }

  showTooltip(mouseX, mouseY) {
    const shouldContinue = this.setupTooltipContext(mouseX, mouseY);
    if(!shouldContinue) return;
    const firstEntry = this.adjustedData.entries().next();
    const xDifs = firstEntry.value[1].map(({x, _}, index) => Math.abs(this.getXCoordinateFromXValue(firstEntry.value[1], index) - mouseX));
    const minDif = this.getMin(xDifs);
    let minDifIndex = xDifs.indexOf(minDif);
    if(minDifIndex < 0) return;

    const VERTICAL_DYNAMIC_OFFSET = 12;
    const TOPMOST_Y_COORDINATE = 5;
    const TOOLTIP_TITLE_BOTTOM_PADDING = 30;
    const TOOLTIP_TITLE_TOP_PADDING = 20;

    let yValues = [];
    const minDifIndexEntry = firstEntry.value[1][minDifIndex];
    let xCoordinate = this.getXCoordinateFromXValue(firstEntry.value[1], minDifIndex);
    let yCoordinate;
    this.showVerticalDashedLine(mouseX);
    let i = 0;
    for(let [hex, linePoints] of this.adjustedData.entries()) {
      if(i >= MAX_TOOLTIP_LINES) break;
      const currentColorMinDifEntry = linePoints[minDifIndex];
      if(!currentColorMinDifEntry || !currentColorMinDifEntry.ys) break;
      let yValue;
      if(currentColorMinDifEntry.ys.length === 1) {
        yCoordinate = this.getYCoordinateFromYValue(currentColorMinDifEntry.ys[0]);
        yValue = currentColorMinDifEntry.ys[0];
      } else {
        const yDifs = currentColorMinDifEntry.ys.map(y => Math.abs(this.getYCoordinateFromYValue(y) - mouseY));
        const minDif = this.getMin(yDifs);
        const minDifIndex = yDifs.indexOf(minDif);
        if(minDifIndex < 0) return;
        yCoordinate = this.getYCoordinateFromYValue(currentColorMinDifEntry.ys[minDifIndex]);
        yValue = currentColorMinDifEntry.ys[minDifIndex];
      }
      yValues.push(yValue);

      this.drawDotOnLine(xCoordinate, yCoordinate, hex);
      i++;
    }

    // check if tooltip is within the chart space, otherwise shift over
    const offset = 8;
    let tooltipWidth;
    const hasEllipsis = this.entitiesAndHexes.find(e => e.label.includes('...'));
    if(this.isCompareChart && hasEllipsis) tooltipWidth = 250;
    else if(hasEllipsis) tooltipWidth = 210;
    else tooltipWidth = 190;

    const tooltipTitle = this.formatTime(new Date(Number(minDifIndexEntry.x)));
    const tooltipTitleWidth = this.ctx.measureText(tooltipTitle).width + TOOLTIP_TITLE_PADDING;
    if(tooltipTitleWidth > tooltipWidth) tooltipWidth = tooltipTitleWidth;

    i = 0;
    const X_SIDE_PADDING = 12;
    const DOT_TEXT_SPACING = 8;
    const MAIN_TEXT_VALUE_SPACING = 16;
    for(let entry of this.adjustedData.entries()) {
      if(i >= MAX_TOOLTIP_LINES) break;
      let lineWidth = X_SIDE_PADDING + DOT_SIZE + DOT_TEXT_SPACING + this.textWidth(this.entitiesAndHexes.find(e => e.hex === entry[0]).label) + MAIN_TEXT_VALUE_SPACING +
        this.textWidth(yValues[i].toFixed(2) + this.labelSuffix) + X_SIDE_PADDING; // 300 Mbps
      if(lineWidth > tooltipWidth) tooltipWidth = lineWidth;
      i++;
    }

    const tooltipHeight = this.getDynamicTooltipHeight(yValues.length);
    let tooltipTopYCoordinate = mouseY - tooltipHeight / 2;

    if(xCoordinate + offset + tooltipWidth > this.canvasWidth) {
      const tooltipEndX = xCoordinate + offset + tooltipWidth;
      const diff = tooltipEndX - this.canvasWidth + 12;
      const dotXCoordinate = xCoordinate;
      xCoordinate -= diff;
      if(dotXCoordinate > xCoordinate && dotXCoordinate < (xCoordinate + offset + tooltipWidth)) { // dot would be hidden behind tooltip
        xCoordinate = dotXCoordinate - offset - tooltipWidth;
      }
    } else {
      xCoordinate += offset;
    }

    if(xCoordinate < 0) {
      xCoordinate = mouseX;
    }

    const helperTopYCoordinate = this.canvasHeight - HELPER_HEIGHT;
    if(tooltipTopYCoordinate + tooltipHeight > helperTopYCoordinate) {
      const tooltipEndY = tooltipTopYCoordinate + tooltipHeight;
      const diff = tooltipEndY - helperTopYCoordinate;
      tooltipTopYCoordinate -= diff + VERTICAL_DYNAMIC_OFFSET;
    } else if (tooltipTopYCoordinate < 0) {
      tooltipTopYCoordinate = TOPMOST_Y_COORDINATE;
    }

    this.createTooltipShape(xCoordinate, tooltipTopYCoordinate, tooltipWidth, tooltipHeight);
    this.ctx.fillText(tooltipTitle, xCoordinate + offset, tooltipTopYCoordinate + TOOLTIP_TITLE_TOP_PADDING);
    this.drawTooltipDivingLine(xCoordinate, xCoordinate + tooltipWidth, tooltipTopYCoordinate + TOOLTIP_TITLE_BOTTOM_PADDING);

    i = 0;
    for(let [hex, _] of this.adjustedData.entries()) {
      if(i >= MAX_TOOLTIP_LINES) break;
      let xPixel = xCoordinate + X_SIDE_PADDING;
      const TOP_PADDING = 40;
      const DOT_TOP_PADDING = 8;
      const TEXT_TOP_PADDING = 13;
      const NEW_LINE_SPACING = 25;
      const DOT_Y_COORDINATE = tooltipTopYCoordinate + TOP_PADDING + DOT_TOP_PADDING + i * NEW_LINE_SPACING;
      const TEXT_Y_COORDINATE = tooltipTopYCoordinate + TOP_PADDING + TEXT_TOP_PADDING + i * NEW_LINE_SPACING;
      this.drawDotOnLine(xPixel, DOT_Y_COORDINATE, hex);
      this.ctx.font = '13px Mulish';
      this.ctx.fillStyle = '#6d6a94';
      xPixel += DOT_SIZE + DOT_TEXT_SPACING;
      const tooltipLineText = this.entitiesAndHexes.find(e => e.hex === hex).label;
      this.ctx.fillText(tooltipLineText, xPixel, TEXT_Y_COORDINATE);

      this.ctx.font = '13px MulishSemiBold';
      this.ctx.fillStyle = 'black';
      // start from right to left to force side padding to be contemplated
      const valueAndUnit = yValues[i].toFixed(2) + this.labelSuffix;
      xPixel = xCoordinate + tooltipWidth - X_SIDE_PADDING - this.textWidth(valueAndUnit);
      this.ctx.fillText(valueAndUnit, xPixel, TEXT_Y_COORDINATE);
      i++;
    }
    this.ctx.font = '16px Mulish';
    this.ctx.stroke();
  }

  getDynamicTooltipHeight(yValuesLength = 0) {
    const TOOLTIP_HEADER_HEIGHT = 32;
    const VERTICAL_PADDING = 16;
    const MAX_VISIBLE_ROWS = 7;
    const ROW_SPACING = 25;
    const rowCountUsed = this.selectedHexes.length > 0 ? this.selectedHexes.length : yValuesLength;
    if(rowCountUsed > MAX_VISIBLE_ROWS) return TOOLTIP_HEADER_HEIGHT + VERTICAL_PADDING + ROW_SPACING * MAX_VISIBLE_ROWS;
    return TOOLTIP_HEADER_HEIGHT + VERTICAL_PADDING + ROW_SPACING * rowCountUsed;
  }

  getXValueAtIndex(index) {
    const firstEntryValues = this.adjustedData.entries().next().value[1];
    if(index === -1) return firstEntryValues[firstEntryValues.length - 1].x
    return firstEntryValues[index].x;
  }

  // incoming value is in bytes, use this.preferredUnit to convert to MB, GB, etc.
  convertToPreferredUnit(value) {
    value = parseFloat(value);
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

  downsample(data, method="decimate") {
    if (data instanceof Map) {
      data.forEach((v, k, map) => {
        map[k] = super.downsample(v, method)
      })
      return data
    }

    return super.downsample(data, method)
  }
}
