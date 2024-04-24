import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ['outage'];
  
  connect() {
    this.hideTooltipTimerId = null;
  }
  
  findTooltip(target) {
    const tooltipId = target.getAttribute('data-tooltip-id');
    return document.getElementById(tooltipId);
  }
  
  hideAllTooltips() {
    this.outageTargets.forEach((outage) => {
      const tooltip = this.findTooltip(outage);
      if(tooltip) this.hideTooltip(tooltip);
    });
  }
  
  hoverOutage(e) {
    this.hideAllTooltips();
    const target = e.target;
    const tooltip = this.findTooltip(target)
    if(tooltip) {
      if(!tooltip.getAttribute('hidden')) return;
      tooltip.removeAttribute('hidden');
    }
  }
  
  unhoverOutage(e) {
    const target = e.target;
    const tooltip = this.findTooltip(target)
    if(tooltip) {
      this.hideTooltipTimerId = setTimeout(this.hideTooltip.bind(this, tooltip), 250);
    }
  }
  
  hideTooltip(tooltip) {
    if(!tooltip.tagName) return;
    if(this.hideTooltipTimerId) clearTimeout(this.hideTooltipTimerId);
    if(tooltip) tooltip.setAttribute('hidden', 'hidden');
  }
  
  hoverTooltip() {
    clearTimeout(this.hideTooltipTimerId);
  }
  
  unhoverTooltip(e) {
    const tooltip = e.target;
    if(tooltip) this.hideTooltip(tooltip);
  }
}