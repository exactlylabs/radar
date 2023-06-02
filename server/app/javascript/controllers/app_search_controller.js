import { Controller } from "@hotwired/stimulus";
import { emitCustomEvent } from "../eventsEmitter";

export default class extends Controller {

  static targets = [
    'searchInput',
    'spinner',
    'resultsList'
  ];

  // ALL COMMENTED CODE IS FOR FUTURE IMPLEMENTATION
  connect() {
    this.debounceTimeoutId = null;
    this.accountIdFilter = -1;
    //this.shouldShowSpinner = true;
  }

  debouncedSearch() {
    clearTimeout(this.debounceTimeoutId);
    this.debounceTimeoutId = setTimeout(this.search.bind(this), 500);
    emitCustomEvent('closeAccountsFilter');
  }

  search() {
    const query = this.searchInputTarget.value;
    // TODO: test in production how much time loading takes to evaluate
    // using this logic, should stay commented
    {/*if (query.length === 0 || this.shouldShowSpinner) {
      this.showSpinner(); 
      this.hideResultsList();
    }*/}
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
      // TODO: test in production how much time loading takes to evaluate
      // using this logic, should stay commented
      /*.finally(() => {
        this.hideSpinner();
        this.showResultsList();
      });*/
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
    if(this.searchInputTarget.value.length > 0) this.search();
  }
}
