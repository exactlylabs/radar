import { Controller } from "@hotwired/stimulus";
import { validatePasswordFields } from '../password';

export default class extends Controller {
  
  static targets = [
    "newPassword",
    "newPasswordCheck",
    "clientSideErrorAlert",
    "formSubmitButton"
  ]
  
  connect() {}

  checkSubmit(e) {
    e.preventDefault();

    this.hideGenericError();

    const validatePasswordsRes = validatePasswordFields(this.newPasswordTarget, this.newPasswordCheckTarget);
    if (validatePasswordsRes) {
      this.showGenericError(validatePasswordsRes);
      return;
    }
    
    this.formSubmitButtonTarget.click();
  }

  hideGenericError() {
    this.clientSideErrorAlertTarget.classList.add('invisible');
  }

  showGenericError(message) {
    this.clientSideErrorAlertTarget.innerText = message;
    this.clientSideErrorAlertTarget.classList.remove('invisible');
  }
}
