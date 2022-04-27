import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    blanks: String
  }

  connect() {
    var options = {
      dir: document.body.getAttribute('direction')
    };

    if (this.blanksValue) {
      options.allowClear = true;
    }

    $(this.element).select2(options);
  }
}
