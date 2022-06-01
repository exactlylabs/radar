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

    $('#client_id').on('select2:select', function () {
      let event = new Event('change', { bubbles: true }) // fire a native event
      this.dispatchEvent(event);
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
