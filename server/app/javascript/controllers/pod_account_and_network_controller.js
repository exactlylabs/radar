import { Controller } from "@hotwired/stimulus";

const NETWORK_SELECT_STATUS = {
  NO_NETWORK: 'no_network',
  EXISTING_NETWORK: 'existing_network',
  NEW_NETWORK: 'new_network'
}

export default class extends Controller {

  static targets = [
    "networkSubtitle",
    "existingNetworkSelect",
    "newNetworkComponent",
    "accountsSelect"
  ]

  connect() {
    const { onboarding } = this.element.dataset;
    this.networkAssignmentType = !!onboarding ? NETWORK_SELECT_STATUS.EXISTING_NETWORK : NETWORK_SELECT_STATUS.NO_NETWORK;
    if(this.networkAssignmentType === NETWORK_SELECT_STATUS.EXISTING_NETWORK) {
      this.removeNetworkSubtitle();
      this.removeNewNetworkComponent();
      this.showExistingNetworkSelect();
    }
  }
  
  existingNetworkSelectTargetConnected(e) {
    this.existingNetworkSelect = $('#pod-existing-network-select');
    if(e.dataset.onboarding !== 'true') {
      setTimeout(() => {
        this.removeExistingNetworkSelect()
      }, 5);
    }
  }
  
  handleNetworkAssignmentTypeSelect(e) {
    const selectedValue = e.target.value;
    if(selectedValue === this.networkAssignmentType) return;
    this.networkAssignmentType = selectedValue;
    if(selectedValue === NETWORK_SELECT_STATUS.NO_NETWORK) {
      this.removeExistingNetworkSelect();
      this.removeNewNetworkComponent();
      this.showNetworkSubtitle();
    } else if(selectedValue === NETWORK_SELECT_STATUS.EXISTING_NETWORK) {
      this.removeNetworkSubtitle();
      this.removeNewNetworkComponent();
      this.showExistingNetworkSelect();
    } else {
      this.removeNetworkSubtitle();
      this.removeExistingNetworkSelect(); 
      this.showNewNetworkComponent();
    }
  }

  showNetworkSubtitle() {
    this.networkSubtitleTarget.classList.remove('invisible');
  }

  removeNetworkSubtitle() {
    this.networkSubtitleTarget.classList.add('invisible');
  }

  showExistingNetworkSelect() {
    this.existingNetworkSelect.select2().next().show();
  }

  removeExistingNetworkSelect() {
    this.existingNetworkSelect.select2().next().hide();
  }

  showNewNetworkComponent() {
    this.newNetworkComponentTarget.classList.remove('invisible');
  }

  removeNewNetworkComponent() {
    this.newNetworkComponentTarget.classList.add('invisible');
    this.clearNewNetworkComponent();
  }

  clearNewNetworkComponent() {
    const newNetworkNameInput = document.querySelector('[name="location[name]"]');
    if(newNetworkNameInput) newNetworkNameInput.value = '';

    const downloadExpectedInput = document.querySelector('[name="location[expected_mbps_down]"]');
    const uploadExpectedInput = document.querySelector('[name="location[expected_mbps_up]"]');
    if(downloadExpectedInput) downloadExpectedInput.value = '';
    if(uploadExpectedInput) uploadExpectedInput.value = '';

    const addressInput = document.querySelector('[name="location[address]"]');
    if(addressInput) addressInput.value = '';

    const manualCheckbox = document.querySelectorAll('[name="location[manual_lat_long]"]');
    if(manualCheckbox) {
      manualCheckbox.forEach(checkbox => { checkbox.checked = false; });
    }

    const latLngWrapper = document.querySelector('#hidden_lat_lng_wrapper');
    const latitudeInput = document.querySelector('[name="location[latitude]"]');
    const longitudeInput = document.querySelector('[name="location[longitude]"]');
    if(latLngWrapper) latLngWrapper.setAttribute('hidden', true);
    if(latitudeInput) latitudeInput.value = '';
    if(longitudeInput) longitudeInput.value = '';

  }

  handleAccountChangeOnNewNetwork(e) {
    const currentSelectedAccountId = e.target.value;
    if(currentSelectedAccountId) {
      $("#new-pod-account-select").val(currentSelectedAccountId).trigger('change');
      this.onAccountsSelectChange();
    }
  }

  onAccountsSelectChange() {
    const currentSelectedAccountId = this.accountsSelectTarget.value;
    if (currentSelectedAccountId) {
      $("#new-network-accounts-dropdown").val(currentSelectedAccountId).trigger('change');
      fetch(`/locations/account/${currentSelectedAccountId}`)
        .then((res) => {
          if (res.ok) return res.json();
          else throw new Error(res.statusText);
        })
        .then((res) => {
          const networksByAccountSelect = $("#pod-existing-network-select");
          // empty current locations dropdown
          networksByAccountSelect.empty();
          // populate with new locations received
          const placeholderOption = document.createElement('option');
          const emptyOption = document.createElement('option');
          emptyOption.innerText = '\xA0';
          networksByAccountSelect.append(placeholderOption);
          networksByAccountSelect.append(emptyOption);
          res.forEach((location) => {
            const currentLocationOption = new Option(
              location.text,
              location.id,
              false,
              false
            );
            networksByAccountSelect.append(currentLocationOption);
          });
          // clear default selection
          networksByAccountSelect.val(null);
        })
        .catch((err) => console.error(err));
    }
  }


}