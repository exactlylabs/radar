import { Controller } from "@hotwired/stimulus";
import handleError from './error_handler_controller';

export const ADD_POD_TYPE = {
  NEW_POD: 'new_pod',
  EXISTING_POD: 'existing_pod'
};

export default class extends Controller {
  
  static targets = [
    "hiddenTypeInput",
    "hiddenNetworkNameInput",
    "newPodOption",
    "newPodRadio",
    "existingPodOption",
    "existingPodRadio",
    "moveExistingPodButton",
    "warningBanner"
  ];
  
  connect() {
    this.token = document.querySelector('meta[name="csrf-token"]').content;
    this.addPodType = ADD_POD_TYPE.NEW_POD;
    this.networkName = '';
  }

  hiddenTypeInputTargetConnected(target) {
    this.addPodType = target.value;
    this.toggleOptions();
  }

  hiddenNetworkNameInputTargetConnected(target) {
    this.networkName = target.value;
  }

  selectOption(e) {
    const currentTarget = e.target;
    const type = currentTarget.dataset.type;
    if(type === this.addPodType) return;
    this.addPodType = type;
    this.toggleOptions();
  }

  toggleOptions() {
    const selectedTarget = this.addPodType === ADD_POD_TYPE.NEW_POD ? this.newPodOptionTarget : this.existingPodOptionTarget;
    const otherTarget = this.addPodType === ADD_POD_TYPE.NEW_POD ? this.existingPodOptionTarget : this.newPodOptionTarget;

    selectedTarget.dataset.isSelected = true;
    otherTarget.dataset.isSelected = false;

    if(this.addPodType === ADD_POD_TYPE.NEW_POD) {
      this.newPodRadioTarget.checked = true;
      this.existingPodRadioTarget.removeAttribute('checked');
    } else {
      this.existingPodRadioTarget.checked = true;
      this.newPodRadioTarget.removeAttribute('checked');
    }
  }

  continueToSpecificFlow(e) {
    e.preventDefault();
    e.stopPropagation();
    const nextStepUrl = this.addPodType === ADD_POD_TYPE.NEW_POD ? this.newPodOptionTarget.dataset.nextStepUrl : this.existingPodOptionTarget.dataset.nextStepUrl;
    fetch(nextStepUrl, {
      headers: { 'X-CSRF-Token': this.token }
    })
    .then(response => {
      if(response.ok) return response.text()
      else throw new Error(response.statusText);
    })
    .then(html => {
      Turbo.renderStreamMessage(html);
    })
    .catch(error => handleError(error));
  }

  goToInitialStep(e) {
    e.preventDefault();
    e.stopPropagation();
    const goBackTarget = e.target;
    console.log(goBackTarget);
    const initialStepUrl = goBackTarget.dataset.url;
    fetch(initialStepUrl, {
      headers: { 'X-CSRF-Token': this.token }
    })
    .then(response => {
      if (response.ok) return response.text()
      else throw new Error(response.statusText);
    })
    .then(html => {
      Turbo.renderStreamMessage(html);
    })
    .catch(error => handleError(error));
  }

  clearPod(e) {
    e.preventDefault();
    e.stopPropagation();
    this.hideWarningBanner();
    this.disableMovePodButton();
  }

  selectExistingPod(e) {
    e.preventDefault();
    e.stopPropagation();
    const selectedPod = e.target.value.trim();
    if (!selectedPod) {
      this.hideWarningBanner();
      this.disableMovePodButton();
      return;
    }
    
    const podOption = document.querySelector(`option[value="${selectedPod}"]`);
    
    this.enableMovePodButton();
    const locationName = podOption.dataset.locationName;
    if(locationName) {
      this.displayWarningBanner(locationName);
    } else {
      this.hideWarningBanner();
    }
  }

  displayWarningBanner(locationName) {
    const warningMessage = `This pod belongs to "${locationName}". If you continue, it will be moved to "${this.networkName}".`;
    this.warningBannerTarget.innerText = warningMessage;
    this.warningBannerTarget.classList.remove('invisible');
  }

  hideWarningBanner() {
    this.warningBannerTarget.classList.add('invisible');
  }

  disableMovePodButton() {
    this.moveExistingPodButtonTarget.classList.add('custom-button--disabled');
  }

  enableMovePodButton() {
    this.moveExistingPodButtonTarget.classList.remove('custom-button--disabled');
  }
}