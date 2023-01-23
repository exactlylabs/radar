import { Controller } from "@hotwired/stimulus"
import handleError from "./error_handler_controller";

export default class extends Controller {

  initialize() {
    this.tooltipTimeoutId = -1;
  }

  connect() {}

  exportAll() {
    this.element.classList.add('pending');
    this.element.classList.add('disabled');
    const token = document.getElementsByName("csrf-token")[0].content;
    fetch('/exports/all', {
      method: 'GET',
      headers: {
        headers: { "X-CSRF-Token": token },
      }
    })
      .then(res => res.json())
      .then(res => {
        if('ok' in res && !res.ok) handleError(res, 'exports controller');
      })
      .catch(err => handleError(err, 'exports controller'));
  }

  autoHideTooltip() {
    const tooltip = document.getElementById('downloads-tooltip');
    if(tooltip) tooltip.style.display = 'none';
    this.tooltipTimeoutId = -1;
  }

  showTooltip() {
    if(this.tooltipTimeoutId !== -1) {
      clearTimeout(this.tooltipTimeoutId);
      this.tooltipTimeoutId = -1;
    }
    const tooltip = document.getElementById('downloads-tooltip');
    if(tooltip) tooltip.style.display = 'flex';
  }

  hideTooltip() {
    if(this.tooltipTimeoutId !== -1) return;
    this.tooltipTimeoutId = setTimeout(this.autoHideTooltip, 2000);
  }
}