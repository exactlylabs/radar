import {Controller} from "@hotwired/stimulus";
import {emitCustomEvent} from "../eventsEmitter";
import handleError from "./error_handler_controller";

const POD_ID_LENGTH = 12;
const EMPTY_POD_ID_LENGTH = 0;

export default class extends Controller {

    static targets = ["podIdInput", "continueButton", "inputsContainer", "spinner", "podsIdList"];

    connect() {
        if (this.hasPodsIdListTarget) {
            this.podsId = this.podsIdListTarget.value;
        } else {
            this.podsId = [];
        }
    }

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
            emitCustomEvent('fillHiddenInput', {detail: {podId: this.getPodIdString()}});
            emitCustomEvent('enableButton');
        } else {
            emitCustomEvent('disableButton');
        }
    }

    isComplete() {
        const currentId = this.getPodIdString();
        return currentId.length === POD_ID_LENGTH;
    }

    isEmpty() {
        const currentId = this.getPodIdString();
        return currentId.length === EMPTY_POD_ID_LENGTH
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
        // this.toggleButtonState();
        this.onPodIdChanged(e)
    }

    // set caret position to the end of the input

    // When the last character is typed, the validation is triggered automatically.
    onPodIdChanged(e) {
        if (this.isComplete()) {
            this.validatePodId(this.getPodIdString())
        } else {
            if (this.isEmpty() && this.podsId.length > 0) {
                this.enableContinueButton();
            } else {
                this.disableContinueButton();
            }
            this.hideSpinner();
        }
    }

    validatePodId(podId) {
        //disable continue button
        this.disableContinueButton();
        // show spinner at the end of the input field
        this.showSpinner()

        const token = document.getElementsByName("csrf-token")[0].content;
        const formData = new FormData();
        formData.append("pod_id", podId);

        fetch('clients/check_claim_new_pod', {
            method: "POST",
            headers: {"X-CSRF-Token": token},
            body: formData,
        }).then(response => {
            if (response.ok) return response.text()
            else throw new Error(response.statusText);
        })
            .then(html => {
                this.hideSpinner();
                this.enableContinueButton();
                Turbo.renderStreamMessage(html);
            })
            .catch(error => handleError(error));

        // send the pod id to the backend and wait for the response
        // if it's a valid pod id then add it to the instance podsId list, hide the spinner, clear the input field and enable the continue button.
        // if it's not a valid pod id then hide the spinner, disable the continue button
        // if the pod belongs to one of your accounts, show warning message suggesting moving it to this account.
        // if the pod id it's invalid, show the error message.

    }

    disableContinueButton() {
        emitCustomEvent('continueButtonStateChanged', {detail: {state: "disable"}});
    }

    enableContinueButton() {
        emitCustomEvent('continueButtonStateChanged', {detail: {state: "enable"}})
    }

    showSpinner() {
        this.spinnerTarget.removeAttribute('hidden');
    }

    hideSpinner() {
        this.spinnerTarget.setAttribute('hidden', 'true')
    }

}