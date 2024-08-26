import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";

const SPEED_FILTERS = {
  LAST_24_HOURS: 'last_24_hours',
  LAST_7_DAYS: 'last_7_days',
  LAST_30_DAYS: 'last_30_days',
  THIS_YEAR: 'this_year',
}

export default class extends Controller {

  static targets = [
    "filtersDropdown",
    "dropdownFilter"
  ];

  connect() {
    this.currentFilter = SPEED_FILTERS.LAST_24_HOURS;
  }

  switchFilter(e) {
    e.preventDefault();
    const filter = e.currentTarget.dataset.filter;
    if(filter === this.currentFilter) return;
    const oldFilterElement = this.element.querySelector(`[data-filter="${this.currentFilter}"]`);
    const newFilterElement = e.currentTarget;
    if(oldFilterElement) {
      oldFilterElement.classList.remove('selected');
      newFilterElement.classList.add('selected');
      this.dropdownFilterTargets.forEach((target) => {
        if (target.value === filter) {
          target.selected = true;
          target.setAttribute('selected', 'selected');
        } else {
          target.selected = false;
          target.removeAttribute('selected');
        }
      });
      $('#speed-filters-select').trigger('change');
      this.currentFilter = filter;
    }
    
    const url = new URL(e.target.href);
    if(this.switchFilterTimeout) {
      clearTimeout(this.switchFilterTimeout);
    }
    this.switchFilterTimeout = setTimeout(() => {
      fetch(url).then((response) => {
        if(response.ok) {
          return response.text();
        } else {
          throw new Error('Error fetching speed data.');
        }
      })
      .then((html) => {
        Turbo.renderStreamMessage(html);
      })
      .catch((error) => {
        handleError(error, this.identifier);
      });
    }, 250);
    
    
  }

  switchDropdownFilter(e) {
    const filter = e.target.value;
    if (filter === this.currentFilter) return;
    const oldFilterElement = this.element.querySelector(`[data-filter="${this.currentFilter}"]`);
    const newFilterElement = this.element.querySelector(`[data-filter="${filter}"]`);
    if (oldFilterElement) {
      oldFilterElement.classList.remove('selected');
      newFilterElement.classList.add('selected');
      newFilterElement.click();
      this.currentFilter = filter;
    }
  }

}