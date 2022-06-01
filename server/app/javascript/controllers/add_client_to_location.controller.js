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

  chooseMoveOption(e) {
    const oldOptionButtonClassList = document.querySelector('#old-pod-option').classList;
    const newOptionButtonClassList = document.querySelector('#new-pod-option').classList;
    oldOptionButtonClassList.toggle('clicked');
    if(newOptionButtonClassList.contains('clicked'))
      newOptionButtonClassList.toggle('clicked');
    if(oldOptionButtonClassList.contains('clicked') || newOptionButtonClassList.contains('clicked'))
      document.querySelector('#continue-button').classList.remove('disabled');
    else
      document.querySelector('#continue-button').classList.add('disabled');
  }

  chooseNewOption(e) {
    const oldOptionButtonClassList = document.querySelector('#old-pod-option').classList;
    const newOptionButtonClassList = document.querySelector('#new-pod-option').classList;
    newOptionButtonClassList.toggle('clicked');
    if(oldOptionButtonClassList.contains('clicked'))
      oldOptionButtonClassList.toggle('clicked');
    if(oldOptionButtonClassList.contains('clicked') || newOptionButtonClassList.contains('clicked'))
      document.querySelector('#continue-button').classList.remove('disabled');
    else
      document.querySelector('#continue-button').classList.add('disabled');
  }

  continueToNextStep(e) {
    $('#add_pod_modal_step_0').modal('hide');
    const oldOptionButtonClassList = document.querySelector('#old-pod-option').classList;
    if(oldOptionButtonClassList.contains('clicked')) {
      $('#add_pod_step_1_existing').modal('show');
      $('#client_id').select2({dropdownParent: $('#add_pod_step_1_existing')});
    } else
      $('#add_pod_modal').modal('show');
  }

  continueToChangeName(e) {
    const optionSelected = document.querySelector(`[picked="true"]`);
    const selectedClientId = optionSelected.getAttribute('value');
    const selectedClientName = optionSelected.innerText.trim();
    const selectedLocationId = window.location.pathname.split('/locations/')[1].split('/')[0];
    $('#add_pod_step_1_existing').modal('hide');
    $('#add_pod_step_2_existing').modal('show');
    document.querySelector('#client-id').setAttribute('value', selectedClientId);
    document.querySelector('#location-id').setAttribute('value', selectedLocationId);
    document.querySelector('#client-name').setAttribute('value', selectedClientName);
  }

  submit(e) {
    console.log(e);
    if (e.detail.success) {
      this.hideModal();
    }
  }
}