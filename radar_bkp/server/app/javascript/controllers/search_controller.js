import { Controller } from "@hotwired/stimulus";
import { emitCustomEvent } from "../eventsEmitter";

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

  connect() {
    this.token = document.getElementsByName("csrf-token")[0].content;
  }

  doStreamRequest(formElement) {
    const query = document.querySelector("[name=query]").value;
    const url = `${formElement.getAttribute('data-fetch-url')}?query=${query}`;
    const eventToEmitKey = formElement.getAttribute('data-event-key');
    fetch(url, {
      method: 'GET',
      headers: { "X-CSRF-Token": this.token },
    })
    .then (response => response.text())
    .then(html => {
      Turbo.renderStreamMessage(html);
      // The use of a custom event here allows multi-controller
      // communication to handle some functionality when the response
      // is ready to process.
      if(eventToEmitKey) emitCustomEvent(eventToEmitKey);
    })
    .catch((err) => {
      handleError(err, this.identifier);
    });
  }

  search(e) {
    if(e.target.value) {
      document.querySelector('#category--clear-icon-ref').classList.remove('invisible');
    } else {
      document.querySelector('#category--clear-icon-ref').classList.add('invisible');
    }
    if(!this.element.getAttribute('data-turbo')) {
      this.element.requestSubmit();
    } else {
      this.doStreamRequest(this.element);
    }
  }

  clearSearch() {
    this.element.classList.add('invisible');
    document.querySelector("[name=query]").value = null;
    const formElement = document.querySelector('#search-form');
    if(!formElement.getAttribute('data-turbo')) {
      formElement.requestSubmit();
    } else {
      this.doStreamRequest(formElement);
    }
  }
}