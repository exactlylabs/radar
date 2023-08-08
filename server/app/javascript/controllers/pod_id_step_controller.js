import { Controller } from "@hotwired/stimulus";
import { ADD_POD_TYPE } from "./add_pod_to_network_controller";

const POD_ID_LENGTH = 12;

export default class extends Controller {

  static targets = [
    "hiddenPodIdInput",
    "submitIdButton"
  ]

  connect(){}

  disableButton() {
    this.submitIdButtonTarget.classList.add('custom-button--disabled');
  }

  enableButton() {
    this.submitIdButtonTarget.classList.remove('custom-button--disabled');
  }

  fillHiddenInput(e) {
    const { podId } = e.detail;
    this.hiddenPodIdInputTarget.value = podId;
  }
}