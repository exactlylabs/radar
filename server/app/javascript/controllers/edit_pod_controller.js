import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  connect() {
    //$('#client-locations-dropdown').select2({dropdownParent: $('#edit_client_modal')});
  }

  hideModal() {
    $(this.element).modal('hide');
  }

  handleSubmitStart(e) {
    this.hideModal();
    $('#edit_pod_modal').modal('show');
    document.querySelector('#loading-container-edit').classList.remove('d-none');
    $('#client-locations-dropdown-edit').select2({dropdownParent: $('#edit_pod_modal')});
  }

  handleNewLocationFromClientModal(e) {
    if(e.detail.success) {
      document.querySelector('#loading-container-edit').classList.add('d-none');
      document.querySelector('#location-created-snackbar-edit').classList.remove('d-none');
    }
  }

}