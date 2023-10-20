import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "submitButton",
    "roleInput",
    "roleContainer"
  ];

  connect() {}

  initialize() {
    this.userData = {
      firstName: null,
      lastName: null,
      email: null,
    };
  }

  setData(name, value) {
    let objectKey;
    switch (name) {
      case "invite[first_name]":
        objectKey = "firstName";
        break;
      case "invite[last_name]":
        objectKey = "lastName";
        break;
      case "invite[email]":
        objectKey = "email";
        break;
    }
    this.userData[objectKey] = value;
  }

  handleInputChange(e) {
    this.setData(e.target.name, e.target.value);
    if (
      !!this.userData.firstName &&
      !!this.userData.lastName &&
      !!this.userData.email
    ) {
      this.enableButton()
    } else {
      this.disableButton()
    }
  }

  fieldsAreIncomplete() {
    return !this.userData.firstName || !this.userData.lastName || !this.userData.email;
  }

  handleKeydown(e) {
    if(e.key === 'Enter' && this.fieldsAreIncomplete()) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
  
  handleEmailChange(e) {
    this.userData.email = e.target.value;
    if(this.userData.email !== null && this.userData.email !== "") {
      this.enableButton();
    } else {
      this.disableButton();
    }
  }
  
  enableButton() {
    this.submitButtonTarget.classList.remove("disabled");
    this.submitButtonTarget.classList.remove("custom-button--disabled");
    this.submitButtonTarget.setAttribute('type', 'submit');
  }
  
  disableButton() {
    this.submitButtonTarget.classList.add("disabled");
    this.submitButtonTarget.classList.add("custom-button--disabled");
    this.submitButtonTarget.setAttribute('type', 'button');
  }
  
  pickRole(e) {
    const pickedRole = e.target;
    const pickedValue = pickedRole.dataset.value;
    this.roleInputTargets.forEach(t => {
      t.checked = t.value === pickedValue;
    });
    this.roleContainerTargets.forEach(t => {
      t.dataset.selected = t.dataset.value === pickedValue;
    })
  }
}
