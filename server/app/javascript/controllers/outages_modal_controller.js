import { Controller } from '@hotwired/stimulus';
import handleError from "./error_handler_controller";
import {emitCustomEvent} from "../eventsEmitter";

export default class extends Controller {
  
  static targets = ['filtersButtonBase', 'filter'];
  
  connect() {
    this.baseUrl = this.element.dataset.url;
    this.searchParams = new URLSearchParams();
    this.element.dataset.outagesIds
      .replace('[', '')
      .replace(']', '')
      .split(',')
      .forEach(id => this.searchParams.append('ids[]', id.trim()));
    this.token = document.getElementsByName("csrf-token")[0].content;
    this.debounceTimeout = null;
  }
  
  setOptionToActive(type) {
    this.filterTargets.forEach(filter => {
      if(filter.dataset.type === type) {
        filter.classList.add('active');
      } else {
        filter.classList.remove('active');
      }
    });
  }
  
  filterType(e) {
    e.preventDefault();
    e.stopPropagation();
    const type = e.target.dataset.type;
    const img = this.filtersButtonBaseTarget.querySelector('img');
    this.filtersButtonBaseTarget.innerHTML = `${e.target.dataset.label} ${img.outerHTML}`;
    this.setOptionToActive(type);
    this.searchParams.set('outage_type', type);
    emitCustomEvent('setOutageType', {detail: {outageType: type}})
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