import { Controller } from "@hotwired/stimulus";

export default class extends Controller {  
  connect() {}

  findTooltip() {
    const rowNumber = this.element.getAttribute('data-row-number');
    return document.getElementById(`category--tooltip@${rowNumber}`);
  }

  showTooltip() {
    const tooltip = this.findTooltip();
    if(tooltip) {
      tooltip.classList.remove('invisible');
    }
  }

  hideTooltip() {
    const tooltip = this.findTooltip();
    if(tooltip) {
      tooltip.classList.add('invisible');
    }
  }
}