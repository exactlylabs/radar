import { Controller } from '@hotwired/stimulus';
import handleError from "./error_handler_controller";

export default class extends Controller {
  connect() {
    this.baseUrl = this.element.dataset.url;
    this.searchParams = new URLSearchParams();
    this.token = document.getElementsByName("csrf-token")[0].content;
    this.debounceTimeout = null;
  }
  
  filterType(e) {
    e.preventDefault();
    e.stopPropagation();
    const type = e.target.dataset.type;
    this.searchParams.set('type', type);
    this.fetchOutages();
  }
  
  filterSearch(e) {
    this.debounceSearch(e.target.value);
  }
  
  debounceSearch(value) {
    clearTimeout(this.debounceTimeout);
    this.debounceTimeout = setTimeout(() => {
      this.searchParams.set('search', value);
      this.fetchOutages();
    }, 500);
  }
  
  fetchOutages() {
    fetch(`${this.baseUrl}?${this.searchParams.toString()}`, {
      method: 'GET',
      headers: { 'X-CSRF-Token': this.token }
    })
    .then(res => {
      if(!res.ok) throw new Error('Error fetching outages');
      return res.text();
    })
    .then(html => { Turbo.renderStreamMessage(html) })
    .catch(err => handleError(err, this.identifier));
  }
}