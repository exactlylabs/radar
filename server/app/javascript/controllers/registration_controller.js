import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";

const steps = {
  'email': 0,
  'password': 1,
  'profile': 2
};

export default class extends Controller {
  static targets = [
    "firstNameInput",
    "lastNameInput",
    "emailInput",
    "passwordInput",
    "passwordCheckInput",
    "termsInput",
    "continueButton",
    "continueButtonLoading",
    "userAvatarInput",
    "dropzone",
    "avatarPreview",
    "cameraIcon",
    "avatarContinueButton",
    "personalBox",
    "organizationBox",
    "continueToNameButton",
    "accountNameInput",
    "finishButton",
    "accountNameTitle",
    "accountNameSubtitle",
    "accountNameLabel",
    "finishButtonLoading",
    "errorText",
    "emailErrorText",
    "generalErrorText",
    "continueButtonSpinner",
    "duplicatedEmailAlert",
    "alert",
    "emailStep",
    "passwordStep",
    "profileStep",
    "continueButton",
    "privacyPolicy",
    "accountIdInput",
    "passwordChangeForm"
  ];

  connect() {}

  initialize() {
    // Using underscore to comply with Ruby style
    // Initializing with values if they are present (invite case)
    this.registrationData = {
      step: steps.email,
      first_name: null,
      last_name: null,
      email: null,
      password: null,
      terms: "on",
      account_name: null,
      account_type: null,
      avatar: null,
    };
  }

  handleFileZoneClicked() {
    this.userAvatarInputTarget.click();
  }

  handleFileUpload(e) {
    const avatar = this.userAvatarInputTarget.files[0];
    this.registrationData.avatar = avatar;
    const url = URL.createObjectURL(avatar);
    this.avatarPreviewTarget.src = url;
    this.avatarPreviewTarget.classList.remove("invisible");
    this.cameraIconTarget.classList.add('invisible');
  }

  handleFileDrop(e) {
    e.preventDefault();
    const dataTransfer = e.dataTransfer;
    const files = dataTransfer.files;
    const avatar = files[0];
    this.registrationData.avatar = avatar;
    this.userAvatarInputTarget.files = files;
    const url = URL.createObjectURL(avatar);
    this.avatarPreviewTarget.src = url;
    this.avatarPreviewTarget.classList.remove("invisible");
    this.cameraIconTarget.classList.add('invisible');
  }

  // Required to prevent defaults for drag-drop to work:
  // https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/Drag_operations#specifying_drop_targets
  preventDefault(e) {
    e.preventDefault();
  }

  finishRegistrationWithInvite() {
    this.continueButtonTarget.style.display = 'none';
    this.finishButtonLoadingTarget.style.display = 'inline-block';
    const csrfToken = document.getElementsByName("csrf-token")[0].content;
    let formData = new FormData();
    formData.append("user[first_name]", this.firstNameInputTarget.value);
    formData.append("user[last_name]", this.lastNameInputTarget.value);
    formData.append("user[email]", this.registrationData.email);
    formData.append("user[terms]", "on");
    formData.append("user[password]", this.passwordInputTarget.value);
    const accountToken = window.location.href.split("?token=")[1];
    formData.append("token", accountToken);
    fetch("/users/register_from_invite", {
      method: "POST",
      redirect: "follow",
      headers: { "X-CSRF-Token": csrfToken },
      body: formData,
    })
      .then((res) => {
        if (res.redirected) {
          window.location.href = res.url;
        } else if(res.status >= 400) {
          return res.json();
        }
      })
      .then(res => {
        if(!res) return;
        if(res.error) this.errorTextTarget.innerText = res.error;
        else this.errorTextTarget.innerText = 'There has been an unexpected error. Please try again later.';
      })
      .catch((err) => {
        this.errorTextTarget.innerText = 'There has been an unexpected error. Please try again later.';
        handleError(err, this.identifier);
      })
      .finally(() => {
        this.continueButtonTarget.style.display = 'inline-block';
        this.finishButtonLoadingTarget.style.display = 'none';
      })
  }

  finishRegistration(isInvite = false) {
    this.clearAlerts();
    this.continueButtonTarget.classList.add('invisible');
    this.continueButtonSpinnerTarget.classList.remove('invisible');
    const token = document.getElementsByName("csrf-token")[0].content;
    const formData = new FormData();
    formData.append("user[first_name]", this.registrationData.first_name);
    formData.append("user[last_name]", this.registrationData.last_name);
    formData.append("user[email]", this.registrationData.email);
    formData.append("user[terms]", this.registrationData.terms);
    formData.append("user[password]", this.registrationData.password);
    if (this.registrationData.avatar) formData.append("user[avatar]", this.registrationData.avatar);
    if (isInvite) {
      const accountToken = window.location.href.split("?token=")[1];
      formData.append("token", accountToken);
      const accountId = this.accountIdInputTarget.value;
      formData.append("account[id]", accountId);
    }
    const signUpUrl = isInvite ? "/users/register_from_invite" : "/users/register";
    fetch(signUpUrl, {
      method: "POST",
      redirect: "follow",
      headers: { "X-CSRF-Token": token },
      body: formData,
    })
      .then((res) => {
        // If res is trying to redirect ==> registration success, follow redirect
        // Else error message through JSON body
        if (res.redirected) {
          window.location.href = res.url;
        } else {
          return res.json();
        }
      })
      .then((res) => {
        if(!!res && res.error) {
          const responseErrorKey = Object.keys(res.error)[0];
          const responseErrorValue = res.error[responseErrorKey][0];
          const errorMessage = `${responseErrorKey} ${responseErrorValue}.`;
          this.showGenericError(errorMessage);
        }
      })
      .catch((err) => {
        this.showGenericError("There has been an unexpected error. Please try again later.");
        handleError(err, this.identifier)
      })
      .finally(() => {
        this.continueButtonTarget.classList.remove('invisible');
        this.continueButtonSpinnerTarget.classList.add('invisible');
      });
  }

  saveAvatarAndContinue() {
    this.goToStep2();
  }

  saveAccountTypeAndContinue() {
    this.goToStep3(this.registrationData.account_type);
  }

  selectType(type) {
    this.registrationData = {
      ...this.registrationData,
      account_type: type,
    };
  }

  selectPersonal() {
    const classList = this.personalBoxTarget.classList;
    const otherClassList = this.organizationBoxTarget.classList;
    if (otherClassList.contains("selected")) {
      otherClassList.remove("selected");
    }
    classList.add("selected");
    this.continueToNameButtonTarget.classList.remove("custom-button--disabled");
    this.continueToNameButtonTarget.classList.remove("disabled");
    this.selectType("personal");
  }

  selectOrganization() {
    const classList = this.organizationBoxTarget.classList;
    const otherClassList = this.personalBoxTarget.classList;
    if (otherClassList.contains("selected")) {
      otherClassList.remove("selected");
    }
    classList.add("selected");
    this.continueToNameButtonTarget.classList.remove("custom-button--disabled");
    this.continueToNameButtonTarget.classList.remove("disabled");
    this.selectType("organization");
  }

  clearTypes() {
    this.organizationBoxTarget.classList.remove("selected");
    this.personalBoxTarget.classList.remove("selected");
    this.continueToNameButtonTarget.classList.add("custom-button--disabled");
    this.continueToNameButtonTarget.classList.add("disabled");
  }

  clearAccountName() {
    this.accountNameInputTarget.value = null;
  }

  goToStep1() {
    this.step0WrapperTarget.style.display = "none";
    this.step1WrapperTarget.style.display = "flex";
  }

  goToStep2() {
    this.step1WrapperTarget.style.display = "none";
    this.step2WrapperTarget.style.display = "flex";
    this.clearTypes();
  }

  goToStep3(type) {
    this.step2WrapperTarget.style.display = "none";
    this.step3WrapperTarget.style.display = "flex";
    this.clearAccountName();
    this.accountNameInputTarget.focus();
    if (type === "personal") {
      this.accountNameLabelTarget.innerText = "Name";
      this.accountNameInputTarget.placeholder = "E.g.: John's Home";
      this.accountNameSubtitleTarget.innerText =
        "Assign a name to your place so you can invite others to it as well.";
      this.accountNameTitleTarget.innerText = "Give your account a name";
    } else {
      this.accountNameLabelTarget.innerText = "Organization Name";
      this.accountNameInputTarget.placeholder = "E.g.: ACME Inc.";
      this.accountNameSubtitleTarget.innerText =
        "Tell us your organization so you can invite others to join.";
      this.accountNameTitleTarget.innerText = "What’s your organization?";
    }
  }

  backToStep0() {
    this.step0WrapperTarget.style.display = "block";
    this.step1WrapperTarget.style.display = "none";
  }

  backToStep1() {
    this.step1WrapperTarget.style.display = "flex";
    this.step2WrapperTarget.style.display = "none";
  }

  backToStep2() {
    this.step2WrapperTarget.style.display = "flex";
    this.step3WrapperTarget.style.display = "none";
    this.errorTextTarget.innerText = null;
  }

  showEmailError(errorBody) {
    const statusCode = errorBody.status;
    const message = errorBody.msg;
    if (!!statusCode && statusCode === 422) {
      this.showDuplicateEmailError();
    } else {
      this.showGenericError(message);
    }
  }

  checkPasswordChange(e) {
    if(!this.validatePasswordFields()) return;
    this.continueButtonTarget.classList.add('invisible');
    this.continueButtonSpinnerTarget.classList.remove('invisible');
    this.passwordChangeFormTarget.submit();
  }

  checkPassword() {
    this.clearAlerts();
    if(!this.validatePasswordFields()) return;
    this.goToProfileStep();
  }

  validatePasswordFields() {
    if (!this.passwordComplies()) {
      this.showGenericError("Password must be 8 characters long and contain symbols and numbers");
      return false ;
    }
    if (!this.passwordsMatch()) {
      this.showGenericError("Passwords don't match");
      return false;
    }
    return true;
  }

  passwordComplies() {
    const password = this.passwordInputTarget.value;
    return password.length >= 8 && /\d/.test(password) && /[!@#$%^&*]/.test(password);
  }

  passwordsMatch() {
    const password = this.passwordInputTarget.value;
    const passwordConfirmation = this.passwordCheckInputTarget.value;
    return password === passwordConfirmation;
  }

  goToProfileStep() {
    this.clearAlerts();
    this.registrationData.step = steps.profile;
    this.registrationData.password = this.passwordInputTarget.value;
    this.passwordStepTarget.classList.add('invisible');
    this.profileStepTarget.classList.remove('invisible');
    this.firstNameInputTarget.focus();
  }

  goToPasswordStep() {
    this.clearAlerts();
    this.registrationData.step = steps.password;
    this.privacyPolicyTarget.classList.add('invisible');
    this.registrationData.email = this.emailInputTarget.value;
    this.emailStepTarget.classList.add('invisible');
    this.passwordStepTarget.classList.remove('invisible');
    this.passwordInputTarget.focus();
  }

  checkEnter(e) {
    if(e.key === 'Enter') {
      this.continue(e);
    }
  }

  continue(e) {
    e.preventDefault();
    e.stopPropagation();
    if(this.registrationData.step === steps.email) {
      this.checkEmail();
      return;
    } else if (this.registrationData.step === steps.password) {
      this.checkPassword();
      return;
    } else {
      this.checkProfile();
      return;
    }
  }

  checkProfile() {
    this.clearAlerts();
    const firstName = this.firstNameInputTarget.value;
    const lastName = this.lastNameInputTarget.value;
    if(!firstName || !lastName) {
      this.showGenericError("First and last name are required");
      return;
    }
    this.registrationData.first_name = firstName;
    this.registrationData.last_name = lastName;
    this.finishRegistration(this.continueButtonTarget.getAttribute('data-is-invite') === 'true');
  }

  checkEmail() {
    this.clearAlerts();
    if(!this.checkValidEmail()) return;
    this.continueButtonTarget.classList.add('invisible');
    this.continueButtonSpinnerTarget.classList.remove('invisible');
    const token = document.getElementsByName("csrf-token")[0].content;
    const email = this.emailInputTarget.value;
    const formData = new FormData();
    formData.append("user[email]", email);
    fetch('/users/check_email_uniqueness', {
      method: "POST",
      headers: { "X-CSRF-Token": token },
      body: formData,
    })
      .then((res) => res.json())
      .then((json) => {
        if (json.status !== 200) {
          this.showEmailError(json);
        } else {
          this.goToPasswordStep();
        }
      })
      .catch((err) => handleError(err, this.identifier))
      .finally(() => {
        this.continueButtonTarget.classList.remove('invisible');
        this.continueButtonSpinnerTarget.classList.add('invisible');
      });  
  }

  checkValidEmail() {
    const email = this.emailInputTarget.value;
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      this.showGenericError('The email address you entered is not valid.');
      return false;
    }
    return true;
  }

  showDuplicateEmailError() { 
    this.duplicatedEmailAlertTarget.classList.remove('invisible');
  }

  showGenericError(message) {
    this.alertTarget.classList.remove('invisible');
    this.alertTarget.innerText = message;
  }

  clearAlerts() {
    if(!!this.duplicatedEmailAlertTarget) this.duplicatedEmailAlertTarget.classList.add('invisible');
    this.alertTarget.classList.add('invisible');
  }
}
