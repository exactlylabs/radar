import {Controller} from "@hotwired/stimulus";
import {emitCustomEvent} from "../eventsEmitter";
import handleError from "./error_handler_controller";

/**
 * The idea for this specific controller is to have an application-wide
 * search interface to integrate to any form/input.
 * Ideally, the controller would be set at the <form> level,
 * and adding a data-action="input->search#search" would trigger
 * the form's submit action. Paired with turbo frames, this makes
 * for a very simplistic, inline, seamless update of the elements
 * of any list.
 *
 * By default, the request will be sent expecting HTML processing
 * on the controller's end. If that is not the expected behaviour
 * and you prefer to have TURBO_STREAM processing, add the following
 * attributes to the <form> element:
 *
 * - data-fetch-url => expected url for the GET request
 * - data-turbo => can be set to "true" to make it explicit
 */
export default class extends Controller {
  
  static targets = ['clearIconRef'];
  
  connect() {
    this.token = document.getElementsByName("csrf-token")[0].content;
  }
  
  doStreamRequest(formElement) {
    const query = this.element.querySelector("[name=query]").value;
    
    const currentUrl = new URL(window.location.href);
    const currentSearchParams = new URLSearchParams(currentUrl.search);
    
    let fetchUrl = formElement.getAttribute('data-fetch-url');
    
    const newUrl = new URL(fetchUrl);
    let newSearchParams = new URLSearchParams(newUrl.search);
    
    newSearchParams.set('query', query);
    let shouldUpdateUrl = formElement.getAttribute('data-should-update-url');
    const usesCurrentParams = formElement.getAttribute('data-uses-current-params');
    
    if (!!usesCurrentParams || !!shouldUpdateUrl) {
      newSearchParams = new URLSearchParams({
        ...Object.fromEntries(currentSearchParams),
        ...Object.fromEntries(newSearchParams)
      });
      
      
      url = newUrl + "?" + newSearchParams.toString();
      if(!shouldUpdateUrl) window.history.replaceState(null, null, url);
    }
    let url = newUrl.origin + newUrl.pathname + '?' + newSearchParams.toString()
    
    const eventToEmitKey = formElement.getAttribute('data-event-key');
    fetch(url, {
      method: 'GET',
      headers: {"X-CSRF-Token": this.token},
    })
      .then(response => response.text())
      .then(html => {
        Turbo.renderStreamMessage(html);
        // The use of a custom event here allows multi-controller
        // communication to handle some functionality when the response
        // is ready to process.
        if (eventToEmitKey) emitCustomEvent(eventToEmitKey);
      })
      .catch((err) => {
        handleError(err, this.identifier);
      });
  }
  
  search(e) {
    this.toggleClearIcon(e);
    if (!this.element.getAttribute('data-turbo')) {
      this.element.requestSubmit();
    } else {
      this.doStreamRequest(this.element);
    }
  }
  
  toggleClearIcon(e) {
    if(!this.hasClearIconRefTarget) return;
    if (e.target.value) {
      this.clearIconRefTarget.classList.remove('invisible');
    } else {
      this.clearIconRefTarget.classList.add('invisible');
    }
  }
  
  clearSearch() {
    if(this.hasClearIconRefTarget) {
      this.clearIconRefTarget.classList.add('invisible');
    }
    this.element.querySelector("input[name='query']").value = '';
    if (!this.element.getAttribute('data-turbo')) {
      this.element.requestSubmit();
    } else {
      this.doStreamRequest(this.element);
    }
  }
  
  searchFilter(e) {
    e.preventDefault();
    const delay = Number(this.element.dataset.delay);
    if(!isNaN(delay)) {
      if(this.timeout) clearTimeout(this.timeout);
      this.timeout = setTimeout(() => {
        this.search(e);
      }, delay);
    } else {
      this.search(e);
    }
  }
}