import { Controller } from '@hotwired/stimulus';
import handleError from "./error_handler_controller";

export default class extends Controller {
  
  static targets = ['spinner', 'content'];
  
  connect() {
    this.url = new URL(this.element.dataset.url);
    this.token = document.querySelector('meta[name="csrf-token"]').content;
    this.query = '';
    this.precision = this.element.dataset.precision;
    this.unit = this.element.dataset.unit;
    this.modalType = this.element.dataset.modalType;
    this.currentSearchParamsInBrowser = new URLSearchParams(window.location.search);
    this.fetchData();
  }
  
  /**
   * Set the search params in the URL combining the current search params in the browser
   * and the custom ones for this specific request.
   */
  setSearchParams() {
    if(this.currentSearchParamsInBrowser.has('start')) this.url.searchParams.set('start', this.currentSearchParamsInBrowser.get('start'));
    if(this.currentSearchParamsInBrowser.has('end')) this.url.searchParams.set('end', this.currentSearchParamsInBrowser.get('end'));
    if(this.currentSearchParamsInBrowser.has('account_id')) this.url.searchParams.set('account_id', this.currentSearchParamsInBrowser.get('account_id'));
    if(this.currentSearchParamsInBrowser.has('network_id')) this.url.searchParams.set('network_id', this.currentSearchParamsInBrowser.get('network_id'));
    if(this.currentSearchParamsInBrowser.has('isp_id')) this.url.searchParams.set('isp_id', this.currentSearchParamsInBrowser.get('isp_id'));
    if(this.currentSearchParamsInBrowser.has('days')) this.url.searchParams.set('days', this.currentSearchParamsInBrowser.get('days'));
    this.url.searchParams.set('query', this.query);
    this.url.searchParams.set('type', this.modalType);
    this.url.searchParams.set('precision', this.precision);
    this.url.searchParams.set('unit', this.unit);
  }
  
  fetchData() {
    this.showSpinnerAndReduceOpacity();
    this.setSearchParams();
    fetch(this.url, {
      headers: {
        'X-CSRF-Token': this.token
      }
    })
      .then(response => response.text())
      .then(html => Turbo.renderStreamMessage(html))
      .catch(error => handleError(error, this.element))
      .finally(this.hideSpinnerAndIncreaseOpacity.bind(this));
  }
  
  showSpinnerAndReduceOpacity() {
    this.spinnerTarget.removeAttribute('hidden');
    this.contentTarget.style.opacity = 0.5;
  }
  
  hideSpinnerAndIncreaseOpacity() {
    this.spinnerTarget.setAttribute('hidden', 'hidden');
    this.contentTarget.style.opacity = 1;
  }
  
  search(e) {
    this.query = e.target.value;
    if(this.timeout) clearTimeout(this.timeout);
    this.timeout = setTimeout(this.fetchData.bind(this), 300);
  }
}