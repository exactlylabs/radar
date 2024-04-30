import MultiLineChartController from "./multi_line_chart_controller";

export default class MultiLineDotChartController extends MultiLineChartController {
  
  hours = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  
  connect() {
    super.connect();
  }
  
  setXAxis() {
    this.renderLabels(this.hours);
  }
  
  prepareData(rawData) {
    const data = new Map();
    this.hours.forEach(hour => {
      data.set(hour, []);
    });
    rawData.forEach((line, index) => {
      const { x } = line;
      Object.keys(line).forEach((key) => {
        if(key === 'x') return;
        const color = key;
        const y = line[key];
        if(data.has(color)) {
          data.get(color).push({ x, y });
        } else {
          data.set(color, [{ x, y }]);
        }
      });
    });
    this.chartData = data;
    this.adjustedData = this.adjustData(this.chartData);
  }
}