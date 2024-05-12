import {Controller} from "@hotwired/stimulus";

export default class extends Controller {

    static targets = [
        "hiddenPodIdsInput",
        "continueButton"
    ]

    connect() {
        this.hiddenPodIdsAddedOrMoved = [];
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
        this.continueButtonTarget.classList.add('custom-button--disabled');
    }

    enableButton() {
        this.continueButtonTarget.classList.remove('custom-button--disabled');
    }

    addPodIdToHiddenPodIds(e) {
        const podId = e.detail.podId;
        this.hiddenPodIdsAddedOrMoved.push(podId);
        this.hiddenPodIdsInputTarget.value = this.hiddenPodIdsAddedOrMoved;
    }

    removePodIdFromHiddenPodIds(e) {
        const podId = e.detail.podId;
    }
}