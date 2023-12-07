import { Controller } from "@hotwired/stimulus";
import {emitCustomEvent} from "../eventsEmitter";

export default class extends Controller {
  
  toggleLine(e) {
    e.preventDefault();
    e.stopPropagation();
    const chartId = e.target.dataset.chartId;
    const selectedLine = e.target.dataset.selectedLine;
    const allButtons = document.querySelectorAll(`[data-chart-id="${chartId}"]`);
    allButtons.forEach(button => {
      if(button.dataset.selectedLine === selectedLine) {
        button.dataset.selected = button.dataset.selected === 'true' ? 'false' : 'true';
      } else {
        button.dataset.selected = 'false';
      }
    });
    emitCustomEvent('toggleLine', { detail: { selectedLine, chartId: chartId } });
  }
}