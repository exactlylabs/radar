import { Controller } from "@hotwired/stimulus";

const PREFIXES = {
  category: 'category--tooltip@',
  accounts: 'accounts--tooltip@',
}

export default class extends Controller {  
  connect() {
    this.tooltipType = this.element.dataset.type || 'category';
    this.tooltipPrefix = PREFIXES[this.tooltipType];
  }

  findTooltip() {
    const rowNumber = this.element.getAttribute('data-row-number');
    return document.getElementById(`${this.tooltipPrefix}${rowNumber}`);
  }

  showTooltip() {
    const tooltip = this.findTooltip();
    if(tooltip) {
      tooltip.classList.remove('invisible');
      // check if tooltip extends over right side of screen
      const tooltipRect = tooltip.getBoundingClientRect();
      const tooltipRight = tooltipRect.right;
      const windowWidth = window.innerWidth;
      if(tooltipRight > windowWidth) {
        tooltip.dataset.position = 'left';
      }
    }
  }

  hideTooltip() {
    const tooltip = this.findTooltip();
    if(tooltip) {
      tooltip.classList.add('invisible');
    }
  }
}