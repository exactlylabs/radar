import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
  }

  hideModal() {
    $(this.element).modal('hide');
  }

  showModal() {
    console.log('SHOW MODAL');
    $(this.element).modal('show');
  }

  submit(e) {
    if (e.detail.success) {
      this.hideModal();
    }
  }
}
