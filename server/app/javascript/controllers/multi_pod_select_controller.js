import { Controller } from "@hotwired/stimulus";
import { emitCustomEvent } from "../eventsEmitter";
import {AlertTypes} from "../alerts";

export default class extends Controller {
  
  static targets = [
    "podSelectContainer",
    "podCheckbox",
    "noPodsMessage",
    "podCountMessage",
    "podCountMessageText",
    "podSelectOption",
    "podIdsHiddenInput",
    "selectedPodIdsHiddenInput",
    "allPodIdsHiddenInput",
    "accountAdditionalText"
  ]
  
  connect() {
    this.checkedPodIds = [];
    this.availablePodIds = [];
    this.podIds = [];
    this.allSelected = false;
  }
  
  disconnect() {
    this.checkedPodIds = [];
    this.availablePodIds = [];
    this.podIds = [];
    this.allSelected = false;
  }
  
  allPodIdsHiddenInputTargetConnected(target) {
    const currentTargetValue = target.value;
    if(!currentTargetValue || currentTargetValue === '') return;
    this.availablePodIds = JSON.parse(currentTargetValue);
  }
  
  podIdsHiddenInputTargetConnected(target) {
    const currentTargetValue = target.value;
    if(!currentTargetValue || currentTargetValue === '') return;
    this.podIds = JSON.parse(currentTargetValue);
    this.updateMessage();
  }
  
  goBack(e) {
    const podIds = JSON.stringify(JSON.parse(this.selectedPodIdsHiddenInputTarget.value));
    const url = new URL(window.location.origin + e.target.dataset.url);
    url.searchParams.set('pod_ids', podIds);
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').content
      }
    })
      .then(response => response.text())
      .then(html => Turbo.renderStreamMessage(html));
  }
  
  onCheckboxChange(e) {
    const target = e.target;
    const podId = target.id.split('pod--')[1];
    if(!target.checked) {
      const index = this.podIds.indexOf(podId);
      this.podIds.splice(index, 1);
      emitCustomEvent('removePod', { detail: { podId } });
    } else {
      this.podIds.push(podId);
      emitCustomEvent('addPod', { detail: { podId } });
    }
    this.updateMessage();
  }
  
  addPodFromQR(e) {
    const podId = e.detail.podId;
    if(this.checkedPodIds.includes(podId)) return;
    this.checkedPodIds.push(podId);
    if(!this.availablePodIds.includes(podId)) return;
    if(this.podIds.includes(podId)) return;
    this.podIds.push(podId);
    const checkbox = document.getElementById(`pod--${podId}`);
    checkbox.checked = true;
    this.updateMessage();
  }
  
  deletePodEvent(e) {
    const podId = e.detail.podId;
    const index = this.podIds.indexOf(podId);
    this.podIds.splice(index, 1);
    const checkbox = document.getElementById(`pod--${podId}`);
    checkbox.checked = false;
    this.allSelected = false;
    document.getElementById('pods--select-all').checked = false;
    this.checkedPodIds.splice(this.checkedPodIds.indexOf(podId), 1);
    this.updateMessage();
  }
  
  toggleSelect(e) {
    const target = e.target;
    if(target.dataset.open === undefined || target.dataset.open === null) return;
    if(this.podSelectContainerTarget.hasAttribute('hidden')) {
      this.podSelectContainerTarget.removeAttribute('hidden');
    } else {
      this.podSelectContainerTarget.setAttribute('hidden', 'hidden');
    }
  }
  
  toggleSelectAll(e) {
    e.preventDefault();
    if(this.allSelected) {
      this.deselectAll();
    } else {
      this.selectAll();
    }
    this.updateMessage();
    this.allSelected = !this.allSelected;
  }
  
  updateMessage() {
    const currentPodCount = this.podIds.length;
    if(currentPodCount === 0) {
      this.noPodsMessageTarget.removeAttribute('hidden');
      this.podCountMessageTarget.setAttribute('hidden', 'hidden');
    } else {
      this.noPodsMessageTarget.setAttribute('hidden', 'hidden');
      this.podCountMessageTextTarget.innerText = `${currentPodCount} pods selected`;
      this.podCountMessageTarget.removeAttribute('hidden');
    }
    this.podIdsHiddenInputTarget.value = JSON.stringify(this.podIds);
  }
  
  selectAll() {
    this.podIds = [];
    this.podCheckboxTargets.forEach((checkbox) => {
      checkbox.checked = true;
      const podId = checkbox.id.split('pod--')[1];
      this.podIds.push(podId);
    });
    emitCustomEvent('selectAll', { detail: { podIds: this.podIds } });
  }
  
  removeAll() {
    this.podCheckboxTargets.forEach((checkbox) => {
      checkbox.checked = false;
    });
    this.podIds = [];
    this.checkedPodIds = [];
    this.allSelected = false;
    document.getElementById('pods--select-all').checked = false;
    this.updateMessage();
  }
  
  deselectAll() {
    this.podCheckboxTargets.forEach((checkbox) => {
      checkbox.checked = false;
    });
    this.podIds = [];
    this.checkedPodIds = [];
    emitCustomEvent('deselectAll');
  }
 
  search(e) {
    e.preventDefault();
    const query = e.target.value;
    if(!query || query === '') {
      this.podSelectOptionTargets.forEach(option => {
        option.removeAttribute('hidden', 'hidden');
      });
    } else {
      this.podSelectOptionTargets.forEach(option => {
        const optionId = option.dataset.podId;
        if (optionId.includes(query)) {
          option.removeAttribute('hidden', 'hidden');
        } else {
          option.setAttribute('hidden', 'hidden');
        }
      });
    }
  }
  
  changeSelectedAccount(e) {
    const selectedOption = e.target.selectedOptions[0].label;
    this.accountAdditionalTextTarget.innerText = `Your pods will be accessible to everyone at ${selectedOption}.`;
  }
}