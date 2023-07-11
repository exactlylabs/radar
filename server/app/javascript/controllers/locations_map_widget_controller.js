import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";
import { emitCustomEvent } from '../eventsEmitter';

const STATUS = {
  ALL: 'all',
  ONLINE: 'online',
  OFFLINE: 'offline'
}

export default class extends Controller {

  static targets = [
    "filterButton",
    "allCheckmark",
    "onlineCheckmark",
    "offlineCheckmark"
  ];

  connect() {
    this.token = document.getElementsByName("csrf-token")[0].content;
    this.filters = {
      query: '',
      status: STATUS.ALL
    }
  }

  search() {
    const { query, status } = this.filters;
    const formElement = document.querySelector('#search-form');
    const url = `${formElement.getAttribute('data-fetch-url')}?query=${query}&status=${status}`;
    fetch(url, {
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
      });
  }

  handleInputChange(e) {
    this.filters.query = e.target.value;
    this.search();
  }

  clearSearch() {
    this.element.classList.add('invisible');
    this.filters.query = '';
    this.search();
  }

  selectStatusFilter(e) {
    e.preventDefault();
    e.stopPropagation();
    const previousStatus = this.filters.status;
    const newStatus = e.target.dataset.value;
    this.filterButtonTarget.innerText = e.target.dataset.label;
    this.setFilterAsActive(previousStatus, newStatus);
    this.filters.status = newStatus;
    emitCustomEvent('pickFilter');
    this.search();
  }

  setFilterAsActive(previousStatus, newStatus) {
    const previousStatusElement = this.element.querySelector(`[data-value="${previousStatus}"]`);
    const newStatusElement = this.element.querySelector(`[data-value="${newStatus}"]`);
    previousStatusElement.classList.remove('active');
    newStatusElement.classList.add('active');
    const previousCheckmarkTarget = this.getCheckmarkTarget(previousStatus);
    const newCheckmarkTarget = this.getCheckmarkTarget(newStatus);
    previousCheckmarkTarget.classList.add('invisible');
    newCheckmarkTarget.classList.remove('invisible');
  }

  getCheckmarkTarget(status) {
    switch (status) {
      case STATUS.ALL:
        return this.allCheckmarkTarget;
      case STATUS.ONLINE:
        return this.onlineCheckmarkTarget;
      case STATUS.OFFLINE:
        return this.offlineCheckmarkTarget;
    }
  }
}