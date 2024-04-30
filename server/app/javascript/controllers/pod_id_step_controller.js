import {Controller} from "@hotwired/stimulus";

export default class extends Controller {

    static targets = [
        "hiddenPodIdInput",
        "submitIdButton"
    ]

    connect() {
    }

    handleContinueButtonStateChanged(e) {
        let buttonState = e.detail.state;
        if (buttonState === 'disable') {
            this.disableButton();
        } else {
            this.enableButton();
        }

    }

    disableButton() {
        this.submitIdButtonTarget.classList.add('custom-button--disabled');
    }

    enableButton() {
        this.submitIdButtonTarget.classList.remove('custom-button--disabled');
    }

    fillHiddenInput(e) {
        const {podId} = e.detail;
        this.hiddenPodIdInputTarget.value = podId;
    }


}