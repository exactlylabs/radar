import { Controller } from "@hotwired/stimulus";
import { emitCustomEvent } from "../eventsEmitter";

const POD_ID_LENGTH = 12;

export default class extends Controller {

  static targets = ["podIdInput", "continueButton", "inputsContainer"];

  connect(){}

  async insertFromPaste(e) {
    const data = await e.clipboardData.getData("text");
    if (data === null || data === '') return;
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
    if (previousFocusedElement) previousFocusedElement.removeAttribute('focused');
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
    if (!focusedInput) this.inputsContainerTarget.classList.remove('public--card-inputs-container-focus');
  }

  checkBackspace(e) {
    const element = e.srcElement;
    if (e.key === "Backspace") {
      this.forceDisable();
      if (element.value.length === 0) {
        element.previousElementSibling && element.previousElementSibling.focus();
        return;
      }
    }
  }

  forceDisable() {
    emitCustomEvent('disableButton');
  }

  toggleButtonState() {
    if (this.isComplete()) {
      emitCustomEvent('fillHiddenInput', { detail: { podId: this.getPodIdString() } });
      emitCustomEvent('enableButton');
    } else {
      emitCustomEvent('disableButton');
    }
  }

  isComplete() {
    const currentId = this.getPodIdString();
    return currentId.length === POD_ID_LENGTH;
  }

  getPodIdString() {
    const inputs = this.podIdInputTargets;
    let value = "";
    inputs.forEach((input) => (value += input.value));
    return value;
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
    if (e.data?.length == element.maxLength) {
      element.nextElementSibling && element.nextElementSibling.focus();
    }
    this.toggleButtonState();
  }

}