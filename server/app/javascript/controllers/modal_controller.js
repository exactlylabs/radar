import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
  }

  hideModal() {
    $(this.element).modal('hide');
  }

  showModal() {
    $(this.element).modal('show');
  }

  submit(e) {
    if (e.detail.success) {
      this.hideModal();
    }
  }

  handleNewLocationFromClientModal(e) {
    if(e.detail.success) {
      this.hideModal();
      $('#edit_pod_modal').modal('show');
      document.querySelector('#location-created-snackbar').classList.remove('d-none');
    }
  }
}
