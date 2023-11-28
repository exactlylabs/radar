import ChartController from "./chart_controller";

export default class LineChartController extends ChartController {
  connect() {
    super.connect();
  }
  
  plotChart() {
    this.drawLine(this.chartData);
  }
}