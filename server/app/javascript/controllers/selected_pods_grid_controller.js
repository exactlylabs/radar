import { Controller } from "@hotwired/stimulus";
import { emitCustomEvent } from "../eventsEmitter";

export default class extends Controller {
  
  static targets = [
    "podListCount",
    "podGridHeader",
    "selectedPodIdsHiddenInput",
    "allPodIdsHiddenInput",
    "continueButton"
  ]
  
  connect() {
    this.checkedPodIds = [];
    this.availablePodIds = [];
    this.selectedPods = [];
  }
  
  allPodIdsHiddenInputTargetConnected(target) {
    const currentTargetValue = target.value;
    if(!currentTargetValue || currentTargetValue === '') return;
    this.availablePodIds = JSON.parse(currentTargetValue);
  }
  
  selectedPodIdsHiddenInputTargetConnected(target) {
    const currentTargetValue = target.value;
    if(!currentTargetValue || currentTargetValue === '') return;
    this.selectedPods = JSON.parse(currentTargetValue);
    this.updateMessage();
  }
  
  deleteNode(podId) {
    document.getElementById(`selected-pod-${podId}`).remove();
  }
  
  createNewNode(podId) {
    const referenceNode = document.getElementById('reference-pod-cell');
    const wrapper = document.getElementById('selected-pods-grid-wrapper');
    const cloneNode = referenceNode.cloneNode(true);
    const nodeText = cloneNode.querySelector('p');
    const closeImage = cloneNode.querySelector('img.hoverable');
    nodeText.innerText = podId;
    cloneNode.removeAttribute('hidden');
    cloneNode.id = `selected-pod-${podId}`;
    closeImage.dataset.podId = podId;
    wrapper.appendChild(cloneNode);
  }
  
  addPod(e) {
    const podId = e.detail.podId;
    if(!this.availablePodIds.includes(podId)) return;
    if(this.selectedPods.includes(podId)) return;
    this.selectedPods.push(podId);
    this.createNewNode(podId);
    this.updateMessage();
  }
  
  // This method is triggered by the close icon on each pod cell
  deletePod(e) {
    const podId = e.target.dataset.podId;
    this.removeFromGrid(podId);
    this.checkedPodIds.splice(this.checkedPodIds.indexOf(podId), 1);
    emitCustomEvent('deletePodEvent', { detail: { podId } })
  }
  
  // This method is triggered by the <select> element through a custom event
  removePod(e) {
    this.removeFromGrid(e.detail.podId);
  }
  
  removeFromGrid(podId) {
    const index = this.selectedPods.findIndex(elem => elem === podId);
    this.selectedPods.splice(index, 1);
    this.deleteNode(podId);
    this.updateMessage();
  }
  
  selectAll(e) {
    const allPodIds = e.detail.podIds;
    allPodIds.forEach(podId => {
      if(!this.selectedPods.includes(podId)) {
        this.createNewNode(podId);
        this.selectedPods.push(podId);
      }
    });
    this.updateMessage();
  }
  
  removeAll() {
    this.deselectAll();
    emitCustomEvent('removeAll');
  }
  
  deselectAll() {
    this.selectedPods.forEach(podId => {
      this.deleteNode(podId);
    });
    this.selectedPods = [];
    this.checkedPodIds = [];
    this.updateMessage();
  }
  
  updateMessage() {
    const currentPodCount = this.selectedPods.length;
    if(currentPodCount > 0) {
      this.podGridHeaderTarget.removeAttribute('hidden');
      this.podListCountTarget.innerText = `Pod list (${currentPodCount})`;
      this.continueButtonTarget.removeAttribute('disabled');
    } else {
      this.podGridHeaderTarget.setAttribute('hidden', 'hidden');
      this.continueButtonTarget.setAttribute('disabled', 'disabled');
    }
  }
}