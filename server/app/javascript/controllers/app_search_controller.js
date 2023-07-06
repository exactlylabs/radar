import { Controller } from "@hotwired/stimulus";
import { emitCustomEvent } from "../eventsEmitter";

export default class extends Controller {

  static targets = [
    'searchInput',
    'spinner',
    'resultsList'
  ];

  connect() {
    this.debounceTimeoutId = null;
    this.accountIdFilter = -1;
    this.selectedAccountElement = document.querySelector('.sidebar--account-filter-row[data-account-id="-1"]'); // starts with All accounts by default
  }

  debouncedSearch() {
    clearTimeout(this.debounceTimeoutId);
    this.debounceTimeoutId = setTimeout(this.search.bind(this), 500);
    emitCustomEvent('closeAccountsFilter');
  }

  search() {
    const query = this.searchInputTarget.value;
    const token = document.querySelector('meta[name="csrf-token"]').content;
    fetch(`/search?q=${query}&account_id=${this.accountIdFilter}`, {
      method: 'GET',
      headers: {
        'X-CSRF-Token': token,
      }
    })
      .then(response => response.text())
      .then(html => Turbo.renderStreamMessage(html))
      .catch((err) => handleError(err, this.identifier));
  }

  showResultsList() {
    this.resultsListTarget.classList.remove('invisible');
  }

  hideResultsList() {
    //this.shouldShowSpinner = false;
    this.resultsListTarget.classList.add('invisible');
  }

  showSpinner() {
    this.spinnerTarget.classList.remove('invisible');
  }

  hideSpinner() {
    this.spinnerTarget.classList.add('invisible');
  }

  selectAccount(e) {
    const element = e.target;
    if(!element) return;
    const newAccountId = element.getAttribute('data-account-id');
    if(this.accountIdFilter === newAccountId) return;
    this.accountIdFilter = newAccountId;
    emitCustomEvent('selectAccountFilter', {
      detail: {
        accountName: element.getAttribute('data-account-name')
      }
    });
    this.selectedAccountElement.setAttribute('data-selected', 'false');
    this.selectedAccountElement = element;
    this.selectedAccountElement.setAttribute('data-selected', 'true');
    if(this.searchInputTarget.value.length > 0) this.search();
  }
}
