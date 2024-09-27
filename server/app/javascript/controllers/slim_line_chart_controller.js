import LineChartController from "./line_chart_controller";

export default class SlimLineChartController extends LineChartController {
  connect() {
    this.chartId = 'slimDownloadSpeed';
    this.usesQueryIntervalValue = false;
    super.connect();
  }

  showTooltip(mouseX, mouseY) {

  }

  plotChart() {

  }
}