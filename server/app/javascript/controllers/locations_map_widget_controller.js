import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";
import { emitCustomEvent } from '../eventsEmitter';

const STATUS = {
  ALL: 'all',
  ONLINE: 'online',
  OFFLINE: 'offline'
}

const SORT_BY = {
  NAME: 'name',
  STATUS: 'status',
  ACCOUNT: 'account',
  ISP: 'isp',
}

export default class extends Controller {
  
  SEARCH_TIMEOUT_DELAY = 500;
  
  static targets = ["filterButton"];

  connect() {
    this.token = document.getElementsByName("csrf-token")[0].content;
    this.searchParams = new URLSearchParams();
    this.searchParams.set('query', '');
    this.searchParams.set('status', STATUS.ALL);
    this.searchParams.set('sort_by', SORT_BY.NAME);
    this.searchTimeout = null;
    this.locationsListElement = document.getElementById('locations_map_widget_list');
    this.mapElement = document.getElementById('map');
  }

  search() {
    this.setOpacityToLoadingElements(0.5);
    const formElement = document.querySelector('#search-form');
    const url = new URL(formElement.getAttribute('data-fetch-url'));
    const urlSearchParams = url.searchParams;
    urlSearchParams.forEach((value, key) => {
      this.searchParams.set(key, value);
    });
    const fullUrl = `${url.protocol}//${url.host}${url.pathname}?${this.searchParams.toString()}`;
    fetch(fullUrl, {
      method: 'GET',
      headers: { "X-CSRF-Token": this.token },
    })
      .then(response => response.text())
      .then(html => {
        Turbo.renderStreamMessage(html);
        emitCustomEvent('renderLocationsMap');
      })
      .catch((err) => {
        handleError(err, this.identifier);
      })
      .finally(() => { this.setOpacityToLoadingElements(1); })
  }
  
  triggerInitialMapPopulate() {
    setTimeout(() => { emitCustomEvent('renderLocationsMap'); }, 200);
  }
  
  setOpacityToLoadingElements(opacity) {
    this.locationsListElement.style.opacity = opacity;
    this.mapElement.style.opacity = opacity;
  }

  handleInputChange(e) {
    e.preventDefault();
    e.stopPropagation();
    if(this.searchTimeout) clearTimeout(this.searchTimeout);
    this.searchTimeout = setTimeout(() => {
      this.searchParams.set('query', e.target.value);
      this.search();
    }, this.SEARCH_TIMEOUT_DELAY);
  }

  clearSearch() {
    this.element.classList.add('invisible');
    this.searchParams.set('query', '');
    this.search();
  }

  selectStatusFilter(e) {
    e.preventDefault();
    e.stopPropagation();
    const previousStatus = this.searchParams.get('status');
    const newStatus = e.target.dataset.value;
    const newLabel = e.target.dataset.label;
    this.updateBaseButton(newLabel, e.target.dataset.filterButtonId);
    this.setFilterAsActive('status', previousStatus, newStatus);
    this.searchParams.set('status', newStatus);
    this.search();
  }
  
  selectSortByFilter(e) {
    e.preventDefault();
    e.stopPropagation();
    const previousSortBy = this.searchParams.get('sort_by');
    const newSortBy = e.target.dataset.value;
    const newLabel = e.target.dataset.label;
    this.updateBaseButton(newLabel, e.target.dataset.filterButtonId);
    this.setFilterAsActive('sort_by', previousSortBy, newSortBy);
    this.searchParams.set('sort_by', newSortBy);
    this.search();
  }
  
  updateBaseButton(newLabel, buttonId) {
    const filterButton = document.getElementById(buttonId);
    if(filterButton) {
      const caret = filterButton.querySelector('img');
      filterButton.innerText = newLabel;
      filterButton.append(caret);
    }
  }
  
  setFilterAsActive(key, previousStatus, newStatus) {
    const previousStatusElement = this.element.querySelector(`div[data-key="${key}"][data-value="${previousStatus}"]`);
    const newStatusElement = this.element.querySelector(`div[data-key="${key}"][data-value="${newStatus}"]`);
    previousStatusElement.classList.remove('active');
    newStatusElement.classList.add('active');
  }
}