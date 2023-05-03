import { Controller } from "@hotwired/stimulus";
import handleError from './error_handler_controller';

export default class extends Controller {
  connect() {}

  fetchTurbo() {
    const url = this.element.getAttribute('data-url');
    const token = document.getElementsByName("csrf-token")[0].content;
    fetch(url, {
      method: "GET",
      headers: { "X-CSRF-Token": token },
    })
      .then (response => response.text())
      .then(html => { Turbo.renderStreamMessage(html); })
      .catch((err) => { handleError(err, this.identifier); });
  }
}