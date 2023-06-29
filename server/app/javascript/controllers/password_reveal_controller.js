import { Controller } from "@hotwired/stimulus";

const EYE_SLASH_ICON_SUFFIX = '_eye_slash_icon';
const EYE_ICON_SUFFIX = '_eye_icon';

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

  newToggleVisibility(e) {
    e.preventDefault();
    e.stopPropagation();
    const inputRefId = e.target.dataset.inputRef;
    const inputRef = document.getElementById(inputRefId);
    const eyeIconRef = document.getElementById(`${inputRefId}${EYE_ICON_SUFFIX}`);
    const eyeSlashIconRef = document.getElementById(`${inputRefId}${EYE_SLASH_ICON_SUFFIX}`);
    if(inputRef && eyeIconRef && eyeSlashIconRef) {
      const hasToBeVisible = eyeIconRef.classList.contains('invisible');
      this.handleVisibility(inputRef, eyeIconRef, eyeSlashIconRef, hasToBeVisible);
    }
  }

  handleVisibility(input, eyeIcon, eyeSlashIcon, hasToBeVisible) {
    input.setAttribute("type", hasToBeVisible ? "text" : "password");
    if(hasToBeVisible) {
      eyeIcon.classList.remove('invisible');
      eyeSlashIcon.classList.add('invisible');
    } else {
      eyeIcon.classList.add('invisible');
      eyeSlashIcon.classList.remove('invisible');
    }
  }

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
    this.eyeSlashIconConfirmationTarget.classList.toggle("invisible");
    this.eyeIconConfirmationTarget.classList.toggle("invisible");
    if (this.eyeIconConfirmationTarget.classList.contains('invisible')) {
      this.passwordConfirmationInputTarget.setAttribute("type", "text");
    } else {
      this.passwordConfirmationInputTarget.setAttribute("type", "password");
    }
  }

  togglePasswordVisibility(e) {
    this.eyeSlashIconTarget.classList.toggle("invisible");
    this.eyeIconTarget.classList.toggle("invisible");
    if (this.eyeIconTarget.classList.contains('invisible')) {
      this.passwordInputTarget.setAttribute("type", "text");
    } else {
      this.passwordInputTarget.setAttribute("type", "password");
    }
  }
}
