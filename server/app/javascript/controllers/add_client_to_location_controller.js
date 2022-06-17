import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  static targets = ["oldPodOption", "newPodOption", "continueButton", "clientIdInput", "locationIdInput", "clientNameInput"]

  connect() {
    $('#client_id').on('select2:select', function () {
      let event = new Event('change', { bubbles: true }) // fire a native event
      this.dispatchEvent(event);
    });
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

  moveClient() {
    const clientId = this.clientIdInputTarget.value;
    const locationId = this.locationIdInputTarget.value;
    const clientName = this.clientNameInputTarget.value;
    const token = document.getElementsByName('csrf-token')[0].content;
    fetch(`/clients/${clientId}`, {
      method: 'PUT',
      headers: {
        'X-CSRF-Token': token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        location_id: locationId,
        name: clientName,
      })
    })
    .then(res => {
      if(res.status.toString().startsWith('4')) {
        console.error(res);
        return;
      }
      window.location.reload()
    })
    .catch(err => {
      // TODO: integrate Sentry!
      console.error(err);
    });
  }

  toggleSelectedOption(currentSelectedOption) {
    const previousSelectedOption = document.querySelector(`[picked="true"]`);
    if(previousSelectedOption) { // there could be none selected atm
      previousSelectedOption.setAttribute('picked', 'false');
    }
    currentSelectedOption.setAttribute('picked', 'true');
  }

  checkClientLocation(e) {
    const currentClientSelectedId = e.target.value;
    if(!currentClientSelectedId) {
      document.querySelector('#change-name-button').classList.add('disabled');
      return;
    }
    const optionSelected = document.querySelector(`[value="${currentClientSelectedId}"]`);
    this.toggleSelectedOption(optionSelected);
    const optionLocationName = optionSelected.getAttribute('data-location-name');
    const optionLocationId = optionSelected.getAttribute('data-location-id');
    const currentLocationId = window.location.pathname.split('/locations/')[1].split('/')[0];
    const warningElement = document.querySelector('#warning-client-location');
    if(currentLocationId !== optionLocationId) {
      const currentLocationName = document.querySelector('#add-pod-title').innerText.split('Add Pod to ')[1];
      const warningText = document.querySelector('#warning-text');
      warningElement.classList.remove('d-none');
      warningText.innerText = `This Pod belongs to ${optionLocationName}. If you continue, it will be moved to ${currentLocationName}.`
    } else {
      warningElement.classList.add('d-none');
    }
    document.querySelector('#change-name-button').classList.remove('disabled');
  }
}