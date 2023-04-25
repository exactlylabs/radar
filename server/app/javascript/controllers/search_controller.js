import { Controller } from "@hotwired/stimulus";

/**
 * The idea for this specific controller is to have an application-wide
 * search interface to integrate to any form/input.
 * Ideally, the controller would be set at the <form> level,
 * and adding a data-action="input->search#search" would trigger
 * the form's submit action. Paired with turbo frames, this makes
 * for a very simplistic, inline, seamless update of the elements
 * of any list.
 */
export default class extends Controller {

  connect() {}

  search() {
    this.element.requestSubmit();
  }

}