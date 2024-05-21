import {Controller} from "@hotwired/stimulus";
import {emitCustomEvent} from "../eventsEmitter";
import handleError from "./error_handler_controller";

const POD_ID_LENGTH = 12;
const EMPTY_POD_ID_LENGTH = 0;

export default class extends Controller {

    static targets = ["podIdInput", "continueButton", "inputsContainer", "spinner", "claimedPod", "hiddenOnboardingStep"];

    connect() {
        this.token = document.getElementsByName("csrf-token")[0].content;
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
        this.onPodIdChanged(e)
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

    parseKeydownEvent(e) {
        switch (e.key) {
            case "ArrowLeft":
                this.moveLeftWithArrow(e);
                break;
            case "ArrowRight":
                this.moveRightWithArrow(e);
                break;
            case "Backspace":
                this.deleteAndMoveLeft(e);
                break;
        }
    }

    moveRightWithArrow(e) {
        const element = e.srcElement;
        e.preventDefault();
        e.stopPropagation();
        element.nextElementSibling && element.nextElementSibling.focus();
    }

    moveLeftWithArrow(e) {
        const element = e.srcElement;
        e.preventDefault();
        e.stopPropagation();
        element.previousElementSibling && element.previousElementSibling.focus();
    }

    deleteAndMoveLeft(e) {
        const element = e.srcElement;
        if (element.value.length === 0) {
            element.previousElementSibling && element.previousElementSibling.focus();
        }
        const podsCount = this.getPodsCount()
        if (podsCount === 0) {
            this.disableContinueButton();
        }
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
        if (e.data?.length === element.maxLength) {
            element.nextElementSibling && element.nextElementSibling.focus();
        }
        // this.toggleButtonState();
        this.onPodIdChanged(e)
    }

    onPodIdChanged(e) {
        if (this.isComplete()) {
            this.validatePodId(this.getPodIdString())
        } else {
            if (this.isEmpty() && this.podsId.length > 0) {
                this.enableContinueButton();
            } else {
                const podsCount = this.getPodsCount()
                if (podsCount === 0) {
                    this.disableContinueButton();
                }
            }
            this.hideSpinner();
        }
    }

    validatePodId(podId) {
        this.disableContinueButton();
        this.showSpinner()
        const podsCount = this.getPodsCount()
        const formData = new FormData();
        formData.append("pod_id", podId);
        formData.append("pods_count", podsCount);
        const url = window.origin + '/clients/check_claimed_pod';

        fetch(url, {
            method: "POST",
            headers: {"X-CSRF-Token": this.token},
            body: formData,
        }).then(response => {
            if (response.ok) return response.text()
            else throw new Error(response.statusText);
        })
            .then(html => {
                this.hideSpinner();
                Turbo.renderStreamMessage(html);
            })
            .catch(error => handleError(error));
    }

    onPodDeleted(e) {
        const podId = e.target.dataset.podId;
        const podsCount = this.getPodsCount()
        const formData = new FormData();
        formData.append("pod_id", podId);
        formData.append("pods_count", podsCount);
        this.removeClaimedPods(formData);
    }

    onDeleteAllPods(e) {
        const formData = new FormData();
        this.removeClaimedPods(formData);
    }

    onMoveClaimedPod(e) {
        const podId = e.target.dataset.podId;
        const podsCount = this.getPodsCount()
        const formData = new FormData();
        formData.append("pod_id", podId);
        formData.append("pods_count", podsCount);
        const url = window.origin + '/clients/move_claimed_pod';
        fetch(url, {
            method: "POST",
            headers: {"X-CSRF-Token": this.token},
            body: formData,
        }).then(response => {
            if (response.ok) return response.text()
            else throw new Error(response.statusText);
        })
            .then(html => {
                Turbo.renderStreamMessage(html);
            })
            .catch(error => handleError(error));
    }

    removeClaimedPods(formData) {
        const url = window.origin + '/clients/remove_claimed_pod';
        fetch(url, {
            method: "DELETE",
            headers: {"X-CSRF-Token": this.token},
            body: formData,
        }).then(response => {
            if (response.ok) return response.text()
            else throw new Error(response.statusText);
        })
            .then(html => {
                Turbo.renderStreamMessage(html);
            })
            .catch(error => handleError(error));
    }

    goToSelectAccountAndNetworkStep(e) {
        const podsIds = this.getPodsIdList();
        const onboarding = this.getOnboarding();
        const formData = new FormData();
        formData.append("pods_ids", podsIds);
        formData.append("onboarding", onboarding);
        const url = window.origin + '/clients/save_claimed_pods';
        fetch(url, {
            method: "POST",
            headers: {"X-CSRF-Token": this.token},
            body: formData,
        }).then(response => {
            if (response.ok) return response.text()
            else throw new Error(response.statusText);
        })
            .then(html => {
                Turbo.renderStreamMessage(html);
            })
            .catch(error => handleError(error));
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

    getPodsCount() {
        if (this.claimedPodTargets.length > 0) {
            return this.claimedPodTargets.length;
        } else {
            return 0;
        }
    }

    getPodsIdList() {
        let podsIds = [];
        this.claimedPodTargets.forEach((pod) => {
            //take the id from the id attribute
            const podId = pod.id.split('pod-claimed-')[1];
            podsIds.push(podId);
        });
        return podsIds;
    }

    getOnboarding() {
        if (this.hasHiddenOnboardingStepTarget) {
            return this.hiddenOnboardingStepTarget.value;
        } else {
            return false;
        }
    }
}