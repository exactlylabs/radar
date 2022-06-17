import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  static targets = ["oldPodOption", "newPodOption", "continueButton"]

  connect() {
  }

  hideModal() {
    $(this.element).modal('hide');
  }

  showModal() {
    $(this.element).modal('show');
  }

  chooseMoveOption(e) {
    const oldOptionButtonClassList = this.oldPodOptionTarget.classList;
    const newOptionButtonClassList = this.newPodOptionTarget.classList;
    oldOptionButtonClassList.toggle('clicked');
    if(newOptionButtonClassList.contains('clicked'))
      newOptionButtonClassList.toggle('clicked');
    if(oldOptionButtonClassList.contains('clicked') || newOptionButtonClassList.contains('clicked'))
      this.continueButtonTarget.classList.remove('disabled');  
    else
      this.continueButtonTarget.classList.add('disabled');  
  }

  chooseNewOption(e) {
    const oldOptionButtonClassList = this.oldPodOptionTarget.classList;
    const newOptionButtonClassList = this.newPodOptionTarget.classList;
    newOptionButtonClassList.toggle('clicked');
    if(oldOptionButtonClassList.contains('clicked'))
      oldOptionButtonClassList.toggle('clicked');
    if(oldOptionButtonClassList.contains('clicked') || newOptionButtonClassList.contains('clicked'))
      this.continueButtonTarget.classList.remove('disabled');
    else
      this.continueButtonTarget.classList.add('disabled');
  }

  continueToNextStep(e) {
    $('#add_pod_modal_step_0').modal('hide');
    const oldOptionButtonClassList = this.oldPodOptionTarget.classList;
    if(oldOptionButtonClassList.contains('clicked')) {
      $('#add_pod_step_1_existing').modal('show');
      $('#client_id').select2({dropdownParent: $('#add_pod_step_1_existing')});
    } else {
      $('#add_pod_modal').modal('show');
    }
  }

  continueToChangeName(e) {
    const optionSelected = document.querySelector(`[picked="true"]`); // need DOM because this falls under the select2 controller
    const selectedClientId = optionSelected.getAttribute('value');
    const selectedClientName = optionSelected.innerText.trim();
    const selectedLocationId = window.location.pathname.split('/locations/')[1].split('/')[0];
    $('#add_pod_step_1_existing').modal('hide');
    $('#add_pod_step_2_existing').modal('show');
    document.querySelector('#client-id').setAttribute('value', selectedClientId); // need DOM because it is not rendered still
    document.querySelector('#location-id').setAttribute('value', selectedLocationId);
    document.querySelector('#client-name').setAttribute('value', selectedClientName);
  }

  submit(e) {
    if (e.detail.success) {
      this.hideModal();
    }
  }
}