import { Controller } from "@hotwired/stimulus";

export default class PasswordRevealController extends Controller {
  static targets = [
    "eyeSlashIcon",
    "eyeIcon",
    "eyeSlashIconConfirmation",
    "eyeIconConfirmation",
    "passwordConfirmationInput",
    "passwordInput",
  ];

  connect() {}

  // Doing the visibility control programmatically as the
  // default template component usage was sometimes broken
  // or did not work when 2 instances of the visibility tool
  // where in screen at the same time.
  toggleVisibility(e) {
    e.preventDefault();
    e.stopPropagation();
    // Might be overkill, but it seemed a bit cleaner to split
    // into 2 diff methods, although they do the same thing.
    if (e.target.classList.contains("password-confirmation")) {
      this.togglePasswordConfirmationVisibility(e);
    } else {
      this.togglePasswordVisibility(e);
    }
  }

  togglePasswordConfirmationVisibility(e) {
    this.eyeSlashIconConfirmationTarget.classList.toggle("d-none");
    this.eyeIconConfirmationTarget.classList.toggle("d-none");
    if (
      e.target.getAttribute("data-password-reveal-target") ===
      "eyeSlashIconConfirmation"
    ) {
      this.passwordConfirmationInputTarget.setAttribute("type", "text");
    } else {
      this.passwordConfirmationInputTarget.setAttribute("type", "password");
    }
  }

  togglePasswordVisibility(e) {
    this.eyeSlashIconTarget.classList.toggle("d-none");
    this.eyeIconTarget.classList.toggle("d-none");
    if (
      e.target.getAttribute("data-password-reveal-target") === "eyeSlashIcon"
    ) {
      this.passwordInputTarget.setAttribute("type", "text");
    } else {
      this.passwordInputTarget.setAttribute("type", "password");
    }
  }
}
