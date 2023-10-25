import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";
import {emitCustomEvent} from "../eventsEmitter";

const POD_ID_LENGTH = 12;

export default class extends Controller {
  static targets = [
    "podId",
    "step0",
    "step0Footer",
    "step2",
    "step2Footer",
    "step2IdInput",
    "step2IdInputHidden",
    "step2SecretInputHidden",
    "stepError",
    "stepErrorFooter",
    "addNewLocationWrapper",
    "locationWrapper",
    "finalButton",
    "podIdInput",
    "podNameInput",
    "locationsSelect",
    "stepAlreadyClaimed",
    "stepAlreadyClaimedFooter",
    "stepNotFound",
    "stepNotFoundFooter",
    "accountsSelect",
    "addPodButton"
  ];

  connect() {
    const currentUrl = new URL(window.location.href);
    if(currentUrl.searchParams.has('unix_user') && currentUrl.searchParams.has('setup')) {
      this.openAddPodModal(currentUrl.searchParams.get('unix_user'));
    }
  }
  
  openAddPodModal(podId) {
    const token = document.getElementsByName("csrf-token")[0].content;
    const url = new URL(window.location.origin + '/clients/claim');
    url.searchParams.set('unix_user', podId);
    url.searchParams.set('setup', 'true');
    fetch(url, {
      method: "GET",
      headers: { "X-CSRF-Token": token },
    })
      .then (response => response.text())
      .then(html => {
        Turbo.renderStreamMessage(html);
        $('#add_pod_modal_wizard').modal('show');
      })
      .catch((err) => {
        handleError(err, this.identifier);
      });
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
    const nextButtonClassList = this.finalButtonTarget.classList;
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
    const nextButtonClassList = this.finalButtonTarget.classList;
    if (this.isComplete()) {
      nextButtonClassList.remove("custom-button--disabled");
      nextButtonClassList.remove("disabled");
    } else {
      nextButtonClassList.add("custom-button--disabled");
      nextButtonClassList.add("disabled");
    }
  }

  forceDisable() {
    const nextButtonClassList = this.finalButtonTarget.classList;
    nextButtonClassList.add("custom-button--disabled");
    nextButtonClassList.add("disabled");
  }

  getPodIdString() {
    const inputs = this.podIdInputTargets;
    let value = "";
    inputs.forEach((input) => (value += input.value));
    return value;
  }
  
  hideModal() {
    $(this.element).modal("hide");
  }

  submit(e) {
    const postPath = e.srcElement.attributes[0].nodeValue;
    if (e.detail.success) {
      if (postPath === "/clients/check_claim") this.gotoLocationModal();
      else this.hideModal();
    } else {
      this.goToErrorModal();
    }
  }
  
  restart() {
    if(!!this.step0Target) {
      this.step0Target.style.display = "block";
      this.step0FooterTarget.style.display = "flex";
    }

    if(this.podIdInputTargets) {
      this.podIdInputTargets.forEach(input => input.value = null);
    }

    if (this.podNameInputTarget) {
      this.podNameInputTarget.value = null;
    }

    if (this.locationsSelectTarget) {
      this.locationsSelectTarget.value = null;
    }
    
    if(this.step2Target.style.display !== 'none') {
      this.step2Target.style.display = "none";
      this.step2FooterTarget.style.display = "none";
    }

    if(this.stepErrorTarget.style.display !== 'none') {
      this.stepErrorTarget.style.display = "none";
      this.stepErrorFooterTarget.style.display = "none";
    }

    if(this.stepAlreadyClaimedTarget.style.display !== 'none') {
      this.stepAlreadyClaimedTarget.style.display = "none";
      this.stepAlreadyClaimedFooterTarget.style.display = "none";
    }

    if(this.stepNotFoundTarget.style.display !== 'none') {
      this.stepNotFoundTarget.style.display = "none";
      this.stepNotFoundFooterTarget.style.display = "none";
    }
  }
  
  gotoLocationModal() {
    if (document.location.pathname === "/dashboard") {
      this.addNewLocationWrapperTarget.style.display = "none";
      this.locationWrapperTarget.style.display = "none";
    }
    $("#client-locations-dropdown").select2({
      dropdownParent: $("#add_pod_modal_wizard"),
    });
    const podId = this.getPodIdString();
    this.step2IdInputTarget.innerText = podId;
    this.step2IdInputHiddenTarget.value = podId;
    this.step2Target.style.display = "block";
    this.step2FooterTarget.style.display = "flex";
    this.step0Target.style.display = "none";
    this.step0FooterTarget.style.display = "none";
  }
  
  goToErrorModal() {
    this.stepErrorTarget.style.display = "flex";
    this.stepErrorFooterTarget.style.display = "flex";
    this.step0Target.style.display = "none";
    this.step0FooterTarget.style.display = "none";
  }
  
  goToNotFoundModal() {
    this.stepNotFoundTarget.style.display = "flex";
    this.stepNotFoundFooterTarget.style.display = "flex";
    this.step0Target.style.display = "none";
    this.step0FooterTarget.style.display = "none";
  }
  
  goToAlreadyClaimedModal() {
    this.stepAlreadyClaimedTarget.style.display = "flex";
    this.stepAlreadyClaimedFooterTarget.style.display = "flex";
    this.step0Target.style.display = "none";
    this.step0FooterTarget.style.display = "none";
  }
  
  handleSubmitStart(e) {
    this.hideModal();
    $("#add_pod_modal_wizard").modal("show");
    const loadingContainer = document.getElementById("loading-container");
    if(loadingContainer) loadingContainer.classList.remove("d-none");
    $("#client-locations-dropdown").select2({
      dropdownParent: $("#add_pod_modal_wizard"),
    });
  }
  
  handleSubmitEnd(e) {
    if(e.detail.success) {
      this.restart();
      this.hideModal();
    } else {
      this.goToErrorModal();
    }
  }
  
  handleNewLocationFromClientModal(e) {
    if (e.detail.success) {
      document.querySelector("#loading-container").classList.add("d-none");
      document
        .querySelector("#location-created-snackbar")
        .classList.remove("d-none");
    }
  }
  submitClaimCheck(e) {
    const podId = this.getPodIdString();
    const token = document.getElementsByName("csrf-token")[0].content;
    const formData = new FormData();
    formData.append("id", podId);
    fetch("/clients/check_claim", {
      method: "POST",
      headers: { "X-CSRF-Token": token },
      body: formData,
    })
      .then((res) => {
        if (res.status === 422) {
          this.goToErrorModal();
          return;
        } else if(res.status === 400) {
          this.goToAlreadyClaimedModal();
          return;
        } else if(res.status === 404) {
          this.goToNotFoundModal();
          return;
        }
        this.gotoLocationModal();
      })
      .catch((err) => {
        this.goToErrorModal();
        handleError(err, this.identifier);
      });
  }

  onAccountsSelectChange(e) {
    const currentSelectedAccountId = this.accountsSelectTarget.value;
    if (currentSelectedAccountId) {
      fetch(`/locations/account/${currentSelectedAccountId}`)
        .then((res) => {
          if (res.ok) return res.json();
          else throw new Error(res.statusText);
        })
        .then((res) => {
          const locationsDropdownSelector = $(
            "#client-locations-dropdown"
          );
          // empty current locations dropdown
          locationsDropdownSelector.empty();
          // populate with new locations received
          const placeholderOption = document.createElement('option');
          const emptyOption = document.createElement('option');
          emptyOption.innerText = '\xA0';
          locationsDropdownSelector.append(placeholderOption);
          locationsDropdownSelector.append(emptyOption);
          res.forEach((location) => {
            const currentLocationOption = new Option(
              location.text,
              location.id,
              false,
              false
            );
            locationsDropdownSelector.append(currentLocationOption);
          });
          // clear default selection
          locationsDropdownSelector.val(null);
        })
        .catch((err) => console.error(err));
    }
  }
}
