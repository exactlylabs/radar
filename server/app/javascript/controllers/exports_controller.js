import { Controller } from "@hotwired/stimulus"
import handleError from "./error_handler_controller";

export default class extends Controller {

  connect() {}

  /**
   * This method prevents the <a> from handling the actual file download
   * and triggers an AJAX fetch request to be able to control request
   * start/end and display a spinner to let the user know the download
   * is actually being processed.
   * @param e
   */
  displayProgress(e) {
    e.preventDefault();
    const previousContent = this.element.innerHTML;
    const spinnerContent = `<div class="spinner-border spinner-border-sm text-secondary" role="status"></div>`
    this.element.innerHTML = spinnerContent;
    const filename = this.element.href.split('/').splice(-1, 1);
    fetch(this.element.href, {
      method: 'GET',
      headers: {
        'Accept': '*/*',
        'Connection': 'keep-alive',
      }
    })
      .then(res => res.blob())
      .then(data => {
        let a = document.createElement('a');
        a.href = window.URL.createObjectURL(data);
        a.download = filename;
        a.click();
        a.remove();
      })
      .catch(err => handleError(err, this.identifier))
      .finally(() => { this.element.innerHTML = previousContent; });
  }
}
