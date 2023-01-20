import { Controller } from "@hotwired/stimulus"
import handleError from "./error_handler_controller";

export default class extends Controller {
  connect() {}

  exportAll() {
    this.element.innerHTML = 'Preparing download...';
    this.element.classList.add('pending');
    const token = document.getElementsByName("csrf-token")[0].content;
    fetch('/exports/all', {
      method: 'GET',
      headers: {
        headers: { "X-CSRF-Token": token },
      }
    })
      .then(res => console.log(res))
      .catch(err => handleError(err, 'exports controller'));
  }
}