import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";

const POD_ID_LENGTH = 12;

export default class extends Controller {

  static targets = ["podIdInput", "continueButton", "alert", "inputsContainer"];

  connect() {
    const firstInput = document.getElementById('public--card-input-first');
    if(firstInput) firstInput.focus();
  }

  async insertFromPaste(e) {
    const data = await e.clipboardData.getData("text");
    if(data === null || data === '') return;
    const inputs = this.podIdInputTargets;
    let i;
    // checking for both lengths just in case data is wrong and has more characters than possible inputs
    for (i = 0; i < data.length && i < inputs.length; i++) {
      inputs[i].value = data[i];
    }
    inputs[i - 1].focus();
    this.toggleButtonState();
    return;
  }

  focusInput(e) {
    const previousFocusedElement = this.findFocusedInput();
    if(previousFocusedElement) previousFocusedElement.removeAttribute('focused');
    this.inputsContainerTarget.classList.add('public--card-inputs-container-focus');
    e.target.setAttribute('focused', 'true');
  }

  findFocusedInput() {
    return this.podIdInputTargets.find(i => this.isFocused(i));
  }

  isFocused(input) {
    return !!input.getAttribute('focused');
  }

  blurInput(e) {
    e.target.removeAttribute('focused');
    const focusedInput = this.findFocusedInput();
    if(!focusedInput) this.inputsContainerTarget.classList.remove('public--card-inputs-container-focus');
  }

  checkBackspace(e) {
    const element = e.srcElement;
    if (e.key === "Backspace") {
      this.forceDisable();
      if(element.value.length === 0) {
        element.previousElementSibling && element.previousElementSibling.focus();
        return;
      }
    }
  }

  forceDisable() {
    const nextButtonClassList = this.continueButtonTarget.classList;
    nextButtonClassList.add("custom-button--disabled");
    nextButtonClassList.add("disabled");
  }

  switchInput(e) {
    if (
      e.inputType === "deleteContentBackward" ||
      e.inputType === "insertFromPaste" ||
      e.inputType === "historyUndo" // CTRL + Z
    )
      return;
    if (e.type === "paste") return this.insertFromPaste(e);
    const element = e.srcElement;
    if (e.data.length == element.maxLength) {
      element.nextElementSibling && element.nextElementSibling.focus();
    }
    this.toggleButtonState();
  }

  isComplete() {
    const currentId = this.getPodIdString();
    return currentId.length === POD_ID_LENGTH;
  }

  toggleButtonState() {
    const nextButtonClassList = this.continueButtonTarget.classList;
    if (this.isComplete()) {
      nextButtonClassList.remove("disabled");
    } else {
      nextButtonClassList.add("disabled");
    }
  }

  getPodIdString() {
    const inputs = this.podIdInputTargets;
    let value = "";
    inputs.forEach((input) => (value += input.value));
    return value;
  }

  hideAlert() {
    this.alertTarget.classList.add('invisible');
  }

  showAlert() {
    this.alertTarget.classList.remove('invisible');
  }

  showNotFoundAlert() {
    this.showAlert();
    this.alertTarget.innerText = 'The pod ID you entered is invalid. Please note that the ID is case sensitive.';
  }

  showErrorAlert() {
    this.showAlert();
    this.alertTarget.innerText = 'There has been an unexpected error. Please try again later.';
  }

  showSpinner() {
    this.continueButtonTarget.classList.add('disabled');
    const spinner = `<div class="spinner-border text-light m-auto" role="status"></div>`;
    this.continueButtonTarget.innerHTML = spinner;
  }

  hideSpinner() {
    this.continueButtonTarget.classList.remove('disabled');
    this.continueButtonTarget.innerHTML = 'Continue';
  }

  checkPodId() {
    this.hideAlert();
    this.showSpinner();
    const token = document.getElementsByName("csrf-token")[0].content;
    const podId = this.getPodIdString();
    const data = new FormData();
    data.append('pod_id', podId);
    fetch('/check_id', {
      method: 'POST',
      headers: { "X-CSRF-Token": token },
      body: data
    })
    .then(res => {
      if(res.ok && res.redirected) {
        window.location.href = res.url;
        return;
      } else if(res.status === 404){
        this.hideSpinner();
        this.showNotFoundAlert();
      } else {
        throw new Error();
      }
    })
    .catch(err => {
      handleError(err, this.identifier);
      this.showErrorAlert();
    });
  }

  runPublicTest() {
    const podId = window.location.pathname.split('/check/')[1];
    const token = document.getElementsByName("csrf-token")[0].content;
    fetch(`/clients/${podId}/run_public_test`, {
      method: 'POST',
      headers: { "X-CSRF-Token": token },
    })
    .then(res => {
      if(res.ok) window.location.reload();
    })
    .catch(err => { handleError(err); });
  }
}