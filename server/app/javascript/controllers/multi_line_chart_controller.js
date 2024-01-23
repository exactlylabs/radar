import ChartController, {CHART_TITLES} from "./chart_controller";

const CHART_BUTTONS_HEIGHT = 30;
const LINE_TO_HEX = {
  minimum: '#FF695D',
  median: '#4B7BE5',
  maximum: '#9138E5',
}
const COMPARISON_HEX = [
  '#98CB87',
  '#F51278',
  '#4B7BE5',
  '#9138E5',
  '#FF695D',
  '#F7AA5A'
];

export default class MultiLineChartController extends ChartController {
  connect() {
    this.chartId = this.element.dataset.chartId;
    this.selectedHex = null;
    super.connect();
  }
  
  getChartDataForComparison() {
    const rawData = JSON.parse(this.element.dataset.lineChartData);
    let lastHexUsed = 0;
    const data = new Map();
    const seenKeys = new Map();
    const timestamps = [];
    rawData.forEach((line) => {
      let hexIndex;
      if(seenKeys.has(line['case'])) {
        hexIndex = seenKeys.get(line['case']);
      } else {
        seenKeys.set(line['case'], lastHexUsed);
        hexIndex = lastHexUsed;
        lastHexUsed++;
      }
      const hex = COMPARISON_HEX[hexIndex];
      const x = line['x'];
      const y = line['y'];
      if(data.has(hex)) {
        data.get(hex).push({x, y});
      } else {
        data.set(hex, [{x, y}]);
      }
      if(!timestamps.includes(x)) timestamps.push(x);
    });
    data.forEach((linePoints, hex) => {
      if(timestamps.length > linePoints.length) {
        timestamps.forEach(timestamp => {
          if(!linePoints.find(linePoint => linePoint.x === timestamp)) {
            linePoints.push({x: timestamp, y: 0});
          }
        });
        linePoints.sort((a, b) => a.x - b.x);
      }
    });
    return data;
  }
  
  createHiDPICanvas(w, h, ratio) {
    const heightWithoutButtons = h - CHART_BUTTONS_HEIGHT;
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
    if(this.chartId !== 'compareDownloadSpeeds') {
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
      if(!this.selectedHex || (!!this.selectedHex && this.selectedHex === lineHex))
        adjustedDataByHex.set(lineHex, this.adjustLineData(linePoints, '1d'));
    });
    return adjustedDataByHex;
  }
  
  plotChart() {
    this.clearCanvas();
    for(let [hex, points] of this.adjustedData.entries()) {
      if(!!this.selectedHex) {
        if(this.selectedHex === hex) this.drawLine(points, hex, this.getFirstGradientStopColor(hex));
      } else {
        this.drawLine(points, hex, this.getFirstGradientStopColor(hex));
      }
    }
  }
  
  toggleLine(e) {
    const chartId = e.detail.chartId;
    if(chartId !== this.chartId) return;
    const selectedLine = e.detail.selectedLine;
    const selectedHex = LINE_TO_HEX[selectedLine];
    if(this.selectedHex === selectedHex) {
      this.selectedHex = null;
    } else {
      this.selectedHex = selectedHex;
    }
    this.adjustedData = this.adjustData(this.chartData);
    this.plotChart(this.adjustedData);
  }
  
  showTooltip(mouseX, mouseY) {
    const shouldContinue = this.setupTooltipContext(mouseX, mouseY);
    if(!shouldContinue) return;
    const firstEntry = this.adjustedData.entries().next(); // {value: [hex, points], done: boolean}
    const xDifs = firstEntry.value[1].map(({x, _}, index) => Math.abs(this.getXCoordinateFromXValue(firstEntry.value[1], index) - mouseX));
    const minDif = Math.min(...xDifs);
    let minDifIndex = xDifs.indexOf(minDif);
    let yValues = [];
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
    const tooltipHeight = !!this.selectedHex ? 70 : 120;
    let tooltipTopYCoordinate;
    if(!!this.selectedHex) {
      const { ys } = minDifIndexEntry;
      const yDifs = ys.map(y => Math.abs(this.getYCoordinateFromYValue(y) - mouseY));
      const minDif = Math.min(...yDifs);
      const minDifIndex = yDifs.indexOf(minDif);
      tooltipTopYCoordinate = this.getYCoordinateFromYValue(ys[minDifIndex]);
    } else {
      tooltipTopYCoordinate = 16;
    }
    
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
      this.ctx.fillText(yValues[i].toFixed(2) + ' Mbps', xCoordinate + tooltipWidth - 12 - 75, tooltipTopYCoordinate + 40 + 13 + i * 25);
      i++;
    }
    this.ctx.font = '16px Mulish';
  }
  
  getXValueAtIndex(index) {
    const firstEntryValues = this.adjustedData.entries().next().value[1];
    if(index === -1) return firstEntryValues[firstEntryValues.length - 1].x
    return firstEntryValues[index].x;
  }
}