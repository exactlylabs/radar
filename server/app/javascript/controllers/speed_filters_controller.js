import { Controller } from "@hotwired/stimulus";

const SPEED_FILTERS = {
  ALL_TIME: 'all_time',
  THIS_WEEK: 'this_year',
  THIS_MONTH: 'this_month',
  TODAY: 'today'
}

export default class extends Controller {

  static targets = [
    "filtersDropdown",
    "dropdownFilter"
  ];

  connect() {
    this.currentFilter = SPEED_FILTERS.ALL_TIME;
  }

  switchFilter(e) {
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