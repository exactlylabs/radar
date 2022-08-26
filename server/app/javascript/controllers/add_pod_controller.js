import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";

const POD_ID_LENGTH = 12;
const POD_SECRET_LENGTH = 11;

export default class extends Controller {
  static targets = [
    "podId",
    "step0",
    "step0Footer",
    "step1",
    "step1Footer",
    "step1IdInputHidden",
    "step1SecretInputHidden",
    "step2",
    "step2Footer",
    "step2IdInput",
    "step2IdInputHidden",
    "step2SecretInputHidden",
    "stepError",
    "stepErrorFooter",
    "addNewLocationWrapper",
    "locationWrapper",
  ];

  connect() {}

  getDesiredLength(className) {
    return className === "podIdInput" ? POD_ID_LENGTH : POD_SECRET_LENGTH;
  }

  getButtonId(className) {
    return className === "podIdInput" ? "nextButton" : "finalButton";
  }

  async insertFromPaste(e) {
    const data = await e.clipboardData.getData("text");
    if(data === null || data === '') return;
    const className = e.srcElement.className;
    const inputs = document.querySelectorAll(`.${className}`);
    let i;
    // checking for both lengths just in case data is wrong and has more characters than possible inputs
    for (i = 0; i < data.length && i < inputs.length; i++) {
      inputs[i].value = data[i];
    }
    inputs[i - 1].focus();
    this.toggleButtonState(className);
    return;
  }

  checkBackspace(e) {
    const element = e.srcElement;
    if (e.key === "Backspace" && element.value.length === 0) {
      element.previousElementSibling && element.previousElementSibling.focus();
      return;
    }
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
    const desiredLength = this.getDesiredLength(element.className);
    const buttonId = this.getButtonId(element.className);
    this.toggleButtonState(element.className, buttonId, desiredLength);
  }

  isComplete(className) {
    const inputs = document.getElementsByClassName(className);
    let count = 0;
    inputs.forEach((input) => {
      if (input.value !== "") count++;
    });
    return count === this.getDesiredLength(className);
  }

  toggleButtonState(className) {
    const buttonId = this.getButtonId(className);
    const nextButtonClassList = document.querySelector(
      `#${buttonId}`
    ).classList;
    if (this.isComplete(className)) {
      className !== "podIdInput" && this.fillHiddenInput(className);
      nextButtonClassList.remove("disabled");
    } else {
      nextButtonClassList.add("disabled");
    }
  }

  savePodIdAndContinue() {
    this.step1Target.style.display = "block";
    this.step1FooterTarget.style.display = "flex";
    this.step0Target.style.display = "none";
    this.step0FooterTarget.style.display = "none";
    document.querySelector(".podSecretInput").focus(); // I get the first one on the DOM
    this.fillHiddenInput("podIdInput");
    this.podIdTarget.innerText = this.step1IdInputHiddenTarget.value;
  }

  fillHiddenInput(className) {
    const inputs = document.getElementsByClassName(className);
    let value = "";
    inputs.forEach((input) => (value += input.value));
    document.querySelector(
      className === "podIdInput" ? "#id" : "#secret"
    ).value = value;
  }

  hideModal() {
    $(this.element).modal("hide");
  }

  submit(e) {
    const postPath = e.srcElement.attributes[0].nodeValue;
    if (e.detail.success) {
      if (postPath === "/clients/check_claim") this.gotoLocationModal();
      else this.hideModal();
    }
  }

  restart() {
    this.step0Target.style.display = "block";
    this.step0FooterTarget.style.display = "flex";
    this.stepErrorTarget.style.display = "none";
    this.stepErrorFooterTarget.style.display = "none";
  }

  gotoLocationModal() {
    if (document.location.pathname === "/dashboard") {
      this.addNewLocationWrapperTarget.style.display = "none";
      this.locationWrapperTarget.style.display = "none";
    }
    this.step2IdInputTarget.innerText = this.podIdTarget.innerText;
    this.step2IdInputHiddenTarget.value = this.step1IdInputHiddenTarget.value;
    this.step2SecretInputHiddenTarget.value =
      this.step1SecretInputHiddenTarget.value;
    this.step2Target.style.display = "block";
    this.step2FooterTarget.style.display = "flex";
    this.step1Target.style.display = "none";
    this.step1FooterTarget.style.display = "none";
  }

  goToErrorModal() {
    this.stepErrorTarget.style.display = "flex";
    this.stepErrorFooterTarget.style.display = "flex";
    this.step1Target.style.display = "none";
    this.step1FooterTarget.style.display = "none";
  }

  handleSubmitStart(e) {
    this.hideModal();
    $("#add_pod_modal_wizard").modal("show");
    document.querySelector("#loading-container").classList.remove("d-none");
    $("#client-locations-dropdown").select2({
      dropdownParent: $("#add_pod_modal_wizard"),
    });
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
    const podId = this.step1IdInputHiddenTarget.value;
    const podSecret = this.step1SecretInputHiddenTarget.value;
    const token = document.getElementsByName("csrf-token")[0].content;
    const formData = new FormData();
    formData.append("id", podId);
    formData.append("secret", podSecret);
    fetch("/clients/check_claim", {
      method: "POST",
      headers: { "X-CSRF-Token": token },
      body: formData,
    })
      .then((res) => {
        if (res.status.toString().startsWith("4")) {
          this.goToErrorModal();
          return;
        }
        this.gotoLocationModal();
      })
      .catch((err) => {
        this.goToErrorModal();
        handleError(err, this.identifier);
      });
  }
}
