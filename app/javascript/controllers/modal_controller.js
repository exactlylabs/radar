import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
  }

  hideModal() {
    $(this.element).modal('hide');
  }

  submit(e) {
    if (e.detail.success) {
      this.hideModal();
    }
  }
}
