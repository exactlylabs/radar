import { Controller } from '@hotwired/stimulus';
import {emitCustomEvent} from "../eventsEmitter";
import handleError from "./error_handler_controller";

const STATE_COUNTIES = {
  'alaska': [
    'Aleutians West Census Area',
    'Bristol Bay Borough',
    'Dillingham Census Area',
    'Nome Census Area',
    'North Slope Borough',
    'Northwest Arctic Borough'
  ],
  'michigan': [
    'Gladwin',
    'Manistee',
    'Missaukee',
    'Montmorency',
    'Osceola',
    'Oscoda'
  ],
  'west-virginia': [
    'Crosby',
    'Fischer',
    'Haskell',
    'Jones',
    'Lamb',
    'Mitchell'
  ],
  'texas': [
    'Calhoun',
    'Clay',
    'Jackson',
    'Kanawha',
    'Nicholas',
    'Ritchie',
    'Roane'
  ]
}

export default class extends Controller {
  
  static targets = [
    "stateSelect",
    "otherStateInput",
    "countiesSelect",
    "businessNameInput",
    "otherCountyInput",
    "firstStepForm",
    "secondStepForm",
    "errorMessage"
  ];
  
  handleConsumerTypeSelect(e) {
    const selectedOptionValue = e.target.value;
    if(selectedOptionValue !== '0') {
      this.businessNameInputTarget.removeAttribute('hidden');
    } else {
      this.businessNameInputTarget.setAttribute('hidden', 'hidden');
      this.businessNameInputTarget.value = null;
    
    }
  }
  
  handleStateSelect(e) {
    const selectedOptionValue = e.target.value;
    const counties = STATE_COUNTIES[selectedOptionValue];
    
    this.countiesSelectTarget.innerHTML = '';
    
    if(!counties) {
      this.otherStateInputTarget.removeAttribute('hidden');
      this.otherStateInputTarget.removeAttribute('disabled');
      this.countiesSelectTarget.setAttribute('disabled', 'disabled');
      this.countiesSelectTarget.setAttribute('hidden', 'hidden');
      this.countiesSelectTarget.value = 'other';
      this.otherCountyInputTarget.removeAttribute('hidden');
      return;
    }
    this.otherCountyInputTarget.setAttribute('hidden', 'hidden');
    this.otherCountyInputTarget.value = null;
    this.otherStateInputTarget.setAttribute('hidden', 'hidden');
    this.otherStateInputTarget.value = null;
    this.countiesSelectTarget.removeAttribute('hidden');
    this.countiesSelectTarget.removeAttribute('disabled');
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.innerHTML = 'Select a county';
    defaultOption.setAttribute('selected', 'selected');
    defaultOption.setAttribute('disabled', 'disabled');
    this.countiesSelectTarget.appendChild(defaultOption);
    counties.forEach(county => {
      const option = document.createElement('option');
      option.value = county;
      option.innerHTML = county;
      this.countiesSelectTarget.appendChild(option);
    });
  }
  
  handleFirstStepSubmit(e) {
    e.preventDefault();
    if(!this.firstStepRequiredFieldsAreFilled()) {
      this.errorMessageTarget.removeAttribute('hidden');
      emitCustomEvent('replaceContent');
      return;
    }
    this.errorMessageTarget.setAttribute('hidden', 'hidden');
    const formData = new FormData();
    formData.append('submission[first_name]', document.getElementById('first-name').value);
    formData.append('submission[last_name]', document.getElementById('last-name').value);
    formData.append('submission[email]', document.getElementById('email').value);
    formData.append('submission[phone_number]', document.getElementById('phone').value);
    formData.append('submission[consumer_type]', document.querySelector('input[name="submission[consumer_type]"]:checked').value);
    formData.append('submission[business_name]', document.getElementById('business-name').value);
    formData.append('submission[state]', document.getElementById('state').value);
    formData.append('submission[county]', document.getElementById('counties-select').value);
    formData.append('submission[other_state]', document.getElementById('other-state').value);
    formData.append('submission[other_county]', document.getElementById('other-county').value);
    fetch(this.firstStepFormTarget.action, {
      method: 'POST',
      headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content },
      body: formData
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
  
  firstStepRequiredFieldsAreFilled() {
    const completedStates = [];
    completedStates.push(this.isInputFilled('first-name'));
    completedStates.push(this.isInputFilled('last-name'));
    completedStates.push(this.isInputFilled('email'));
    completedStates.push(this.isInputFilled('phone'));
    
    const consumerTypeRadioButtons = document.querySelectorAll('input[name="submission[consumer_type]"]');
    const selectedConsumerType = Array.from(consumerTypeRadioButtons).find(radio => radio.checked);
    if(selectedConsumerType && selectedConsumerType.value !== '0') {
      consumerTypeRadioButtons.forEach(radio => radio.setAttribute('data-error', 'false'));
      completedStates.push(this.isInputFilled('business-name'));
    } else if(selectedConsumerType && selectedConsumerType.value === '0') {
      consumerTypeRadioButtons.forEach(radio => radio.setAttribute('data-error', 'false'));
      completedStates.push(true);
    } else {
      consumerTypeRadioButtons.forEach(radio => radio.setAttribute('data-error', 'true'));
      completedStates.push(false);
    }
    
    const selectedState = this.stateSelectTarget.value;
    if(!selectedState) {
      this.stateSelectTarget.dataset.error = 'true';
      completedStates.push(false);
    } else {
      this.stateSelectTarget.dataset.error = 'false';
      if(selectedState === 'other') {
        completedStates.push(this.isInputFilled('other-state'));
        completedStates.push(this.isInputFilled('other-county'));
      } else {
        completedStates.push(true);
      }
    }
    
    const selectedCounty = this.countiesSelectTarget.value;
    if(!selectedCounty) {
      this.countiesSelectTarget.dataset.error = 'true';
      completedStates.push(false);
    } else {
      this.countiesSelectTarget.dataset.error = 'false';
      if(selectedCounty === 'other') {
        completedStates.push(this.isInputFilled('other-county'));
      } else {
        completedStates.push(true);
      }
    }
    
    return completedStates.every(state => !!state);
  }
  
  handleSecondStepSubmit(e) {
    e.preventDefault();
    if(!this.secondStepRequiredFieldsAreFilled()) {
      this.errorMessageTarget.removeAttribute('hidden');
      emitCustomEvent('replaceContent');
      return;
    }
    this.errorMessageTarget.setAttribute('hidden', 'hidden');
    const formData = new FormData();
    formData.append('submission[id]', document.querySelector('input[name="submission[id]"]').value);
    formData.append('submission[isp]', document.getElementById('isp').value);
    formData.append('submission[connection_type]', document.querySelector('input[name="submission[connection_type]"]:checked').value);
    if(this.isInputFilled('download_speed')) formData.append('submission[download_speed]', document.getElementById('download_speed').value);
    if(this.isInputFilled('upload_speed')) formData.append('submission[upload_speed]', document.getElementById('upload_speed').value);
    const checkedConnectionPlacement = document.querySelector('input[name="submission[connection_placement]"]:checked');
    if(checkedConnectionPlacement) formData.append('submission[connection_placement]', checkedConnectionPlacement.value);
    const checkedServiceSatisfaction = document.querySelector('input[name="submission[service_satisfaction]"]:checked');
    if(checkedServiceSatisfaction) formData.append('submission[service_satisfaction]', checkedServiceSatisfaction.value);
    fetch(this.secondStepFormTarget.action, {
      method: 'POST',
      headers: { 'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content },
      body: formData
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
  
  secondStepRequiredFieldsAreFilled() {
    const completedStates = [];
    completedStates.push(this.isInputFilled('isp'));
    
    const connectionTypeRadioButtons = document.querySelectorAll('input[name="submission[connection_type]"]');
    const selectedConnectionType = Array.from(connectionTypeRadioButtons).find(radio => radio.checked);
    if(selectedConnectionType) {
      connectionTypeRadioButtons.forEach(radio => radio.setAttribute('data-error', 'false'));
      completedStates.push(true);
    } else {
      connectionTypeRadioButtons.forEach(radio => radio.setAttribute('data-error', 'true'));
      completedStates.push(false);
    }
    
    return completedStates.every(state => !!state);
  }
  
  isInputFilled(inputId) {
    const input = document.getElementById(inputId);
    if(input.value !== null && input.value !== '') {
      input.dataset.error = 'false';
      return true;
    } else {
      input.dataset.error = 'true';
      return false;
    }
  }
}