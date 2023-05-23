import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";

export default class extends Controller {
  static targets = [
    "signInSubmitButton",
    "emailInput",
    "passwordInput",
    "errorMessage",
  ];

  connect() {}

  handleSignInLoading() {
    this.element.innerHTML = `<div class="spinner-border spinner-border-sm text-light m-auto" role="status"></div>`;
    this.element.classList.add('custom-button--disabled');
    this.element.classList.add('disabled');
  }

  finishSignInFromInvite() {
    const token = document.getElementsByName("csrf-token")[0].content;
    const accountToken = window.location.href.split("?token=")[1];
    let formData = new FormData();
    formData.append("user[email]", this.emailInputTarget.value);
    formData.append("user[password]", this.passwordInputTarget.value);
    formData.append("token", accountToken);
    fetch("/users/sign_in_from_invite", {
      method: "POST",
      redirect: "follow",
      headers: { "X-CSRF-Token": token },
      body: formData,
    })
      .then((res) => {
        if (res.redirected) {
          window.location.href = res.url;
        } else if (res.status === 422) {
          this.errorMessageTarget.innerText = "Invalid email or password.";
        } else if (res.status === 500) {
          throw new Error(`Error in sign in process from invite, user email: ${this.emailInputTarget.value}`);
        }
      })
      .catch((err) => {
        this.errorMessageTarget.innerText =
          "There was an unexpected error. Please try again later.";
        handleError(err, this.identifier);
      });
  }
}
