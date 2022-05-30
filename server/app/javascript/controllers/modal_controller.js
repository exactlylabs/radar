import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
  }

  hideModal() {
    $(this.element).modal('hide');
  }

  showModal() {
    $(this.element).modal('show');
    this.focusInputIfPresent();
  }

  submit(e) {
    if (e.detail.success) {
      this.hideModal();
    }
  }

  focusInputIfPresent() {
    const element = document.querySelector('.podIdInput');
    element && element.focus();
  }
}
