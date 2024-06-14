import ChartController, {CHART_TITLES} from "./chart_controller";

const MB_UNIT = 1024 ** 2;
const GB_UNIT = 1024 ** 3;
const TB_UNIT = 1024 ** 4;

const CHART_BUTTONS_HEIGHT = 30;

export default class MultiLineChartController extends ChartController {
  connect() {
    this.chartId = this.element.dataset.chartId;
    this.selectedHexes = [];
    super.connect();
  }
  
  createHiDPICanvas(w, h, ratio) {
    const heightWithoutButtons = this.isCompareChart ? h : h - CHART_BUTTONS_HEIGHT;
    return super.createHiDPICanvas(w, heightWithoutButtons, ratio);
  }
  
  setXAxis() {
    const dateSet = new Set();
    const firstDate = new Date(Number(this.chartData.values().next().value[0].x));
    const lastDate = new Date(Number(this.chartData.values().next().value[this.chartData.values().next().value.length - 1].x));
    const dateDiff = Number(this.chartData.values().next().value[this.chartData.values().next().value.length - 1].x) - Number(this.chartData.values().next().value[0].x);
    const maxLabels = 5;
    const dateStep = Math.ceil(dateDiff / (maxLabels - 1));
    for(let i = 0 ; i < maxLabels - 1 ; i++) {
      const date = new Date(firstDate.getTime() + dateStep * i);
      dateSet.add(this.formatTime(date));
    }
    dateSet.add(this.formatTime(lastDate));
    this.renderLabels(dateSet);
  }
  
  setYAxis() {
    this.ctx.beginPath();
    this.ctx.fillStyle = 'black';
    this.ctx.font = '13px Mulish';
    this.maxTotal = 0;
    this.chartData.forEach((value, key) => {
      const totals = value.map(entry => entry.y);
      const max = Math.max(...totals);
      if(max > this.maxTotal) this.maxTotal = max;
    });
    this.yStepSize = Math.ceil(this.maxTotal / 3);
    this.drawJumpLines();
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
    }
    this.adjustedData = this.adjustData(this.chartData);
  }
  
  adjustData(points) {
    const adjustedDataByHex = new Map();
    points.forEach((linePoints, lineHex) => {
      if(this.selectedHexes.length === 0 || (this.selectedHexes.includes(lineHex)))
        adjustedDataByHex.set(lineHex, this.adjustLineData(linePoints, '1d'));
    });
    return adjustedDataByHex;
  }
  
  getChartDataForComparison() {
    const rawData = JSON.parse(this.element.dataset.lineChartData);
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
      const hex = this.COMPARISON_HEX[hexIndex];
      const x = line['x'];
      const y = line['y'];
      if(data.has(hex)) {
        data.get(hex).push({x, y});
      } else {
        data.set(hex, [{x, y}]);
      }
      if(!timestamps.includes(x)) timestamps.push(x);
    });
    data.forEach((linePoints, _) => {
      if(timestamps.length > linePoints.length) {
        timestamps.forEach(timestamp => {
          if(!linePoints.find(linePoint => linePoint.x === timestamp)) {
            linePoints.push({x: timestamp, y: 0});
          }
        });
        linePoints.sort((a, b) => a.x - b.x);
      }
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
    this.plotChart(this.adjustedData);
  }
  
  showTooltip(mouseX, mouseY) {
    const shouldContinue = this.setupTooltipContext(mouseX, mouseY);
    if(!shouldContinue) return;
    const firstEntry = this.adjustedData.entries().next();
    const xDifs = firstEntry.value[1].map(({x, _}, index) => Math.abs(this.getXCoordinateFromXValue(firstEntry.value[1], index) - mouseX));
    const minDif = Math.min(...xDifs);
    let minDifIndex = xDifs.indexOf(minDif);
    if(minDifIndex < 0) return;
    let yValues = [];
    //let xCoordinate;
    const minDifIndexEntry = firstEntry.value[1][minDifIndex];
    let xCoordinate = this.getXCoordinateFromXValue(firstEntry.value[1], minDifIndex);
    let yCoordinate;
    
    for(let [hex, linePoints] of this.adjustedData.entries()) {
      const currentColorMinDifEntry = linePoints[minDifIndex];
      let yValue;
      if(currentColorMinDifEntry.ys.length === 1) {
        yCoordinate = this.getYCoordinateFromYValue(currentColorMinDifEntry.ys[0]);
        yValue = currentColorMinDifEntry.ys[0];
      } else {
        const yDifs = currentColorMinDifEntry.ys.map(y => Math.abs(this.getYCoordinateFromYValue(y) - mouseY));
        const minDif = Math.min(...yDifs);
        const minDifIndex = yDifs.indexOf(minDif);
        if(minDifIndex < 0) return;
        yCoordinate = this.getYCoordinateFromYValue(currentColorMinDifEntry.ys[minDifIndex]);
        yValue = currentColorMinDifEntry.ys[minDifIndex];
      }
      yValues.push(yValue);
      
      this.drawDotOnLine(xCoordinate, yCoordinate, hex);
    }
    
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
    const tooltipWidth = 180;
    //const tooltipHeight = this.selectedHexes.length > 0 ? 70 : 120;
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
    
    if(tooltipTopYCoordinate + tooltipHeight > this.canvasHeight) {
      const tooltipEndY = tooltipTopYCoordinate + tooltipHeight;
      const diff = tooltipEndY - this.canvasHeight;
      tooltipTopYCoordinate -= diff + 12;
    } else if (tooltipTopYCoordinate < 0) {
      tooltipTopYCoordinate = 5;
    }
    

    this.ctx.roundRect(xCoordinate, tooltipTopYCoordinate, tooltipWidth, tooltipHeight, 6);
    this.ctx.fill();
    this.ctx.stroke();

    this.ctx.shadowColor = 'transparent';
    this.ctx.fillStyle = 'black';
    this.ctx.font = 'normal bold 13px MulishBold';

    this.ctx.fillText(CHART_TITLES[this.chartId], xCoordinate + 8, tooltipTopYCoordinate + 20);

    this.ctx.beginPath();
    this.ctx.fillStyle = '#e3e3e8';
    this.ctx.lineWidth = 1;
    this.ctx.moveTo(xCoordinate, tooltipTopYCoordinate + 30);
    this.ctx.lineTo(xCoordinate + tooltipWidth, tooltipTopYCoordinate +  30);
    this.ctx.stroke();

    
    const date = new Date(Number(minDifIndexEntry.x));
    let i = 0;
    for(let [hex, _] of this.adjustedData.entries()) {
      this.drawDotOnLine(xCoordinate + 12, tooltipTopYCoordinate + 40 + 8 + i * 25, hex);
      
      this.ctx.font = '13px Mulish';
      this.ctx.fillStyle = '#6d6a94';
      this.ctx.fillText(this.formatTime(date), xCoordinate + 12 + 12, tooltipTopYCoordinate + 40 + 13 + i * 25);
      
      this.ctx.font = '13px MulishSemiBold';
      
      this.ctx.fillStyle = 'black';
      this.ctx.fillText(yValues[i].toFixed(2) + this.labelSuffix, xCoordinate + tooltipWidth - 12 - 75, tooltipTopYCoordinate + 40 + 13 + i * 25);
      i++;
    }
    this.ctx.font = '16px Mulish';
  }
  
  getDynamicTooltipHeight(yValuesLength = 0) {
    const tooltipHeaderHeight = 32;
    const verticalPadding = 8 * 2;
    const maxVisibleRows = 7;
    const rowCountUsed = this.selectedHexes.length > 0 ? this.selectedHexes.length : yValuesLength;
    if(rowCountUsed > maxVisibleRows) return tooltipHeaderHeight + verticalPadding + 25 * maxVisibleRows;
    return tooltipHeaderHeight + verticalPadding + 25 * rowCountUsed;
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
}