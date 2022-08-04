import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "firstNameInput",
    "lastNameInput",
    "emailInput",
    "passwordInput",
    "passwordCheckInput",
    "termsInput",
    "continueButton",
    "userAvatarInput",
    "dropzone",
    "avatarPreview",
    "plusIcon",
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
    "step0Wrapper",
    "step1Wrapper",
    "step2Wrapper",
    "step3Wrapper",
    "errorText",
  ];

  connect() {}

  initialize() {
    // Using underscore to comply with Ruby style
    // Initializing with values if they are present (invite case)
    this.registrationData = {
      first_name: document.getElementById("first_name").value ?? null,
      last_name: document.getElementById("last_name").value ?? null,
      email: document.getElementById("email")?.value ?? null,
      password: null,
      terms: "off",
      account_name: null,
      account_type: null,
      avatar: null,
    };
  }

  anyInputIsIncomplete() {
    const firstNameValueIsNull =
      !this.firstNameInputTarget.value ||
      this.firstNameInputTarget.value === "";
    const lastNameValueIsNull =
      !this.lastNameInputTarget.value || this.firstNameInputTarget.value === "";
    const emailValueIsNull =
      !this.emailInputTarget.value || this.firstNameInputTarget.value === "";
    const passwordValueIsNull =
      !this.passwordInputTarget.value || this.firstNameInputTarget.value === "";
    const passwordCheckValueIsNull =
      !this.passwordCheckInputTarget.value ||
      this.firstNameInputTarget.value === "";
    const termsIsUnchecked = !this.termsInputTarget.checked;
    return (
      firstNameValueIsNull ||
      lastNameValueIsNull ||
      emailValueIsNull ||
      passwordValueIsNull ||
      passwordCheckValueIsNull ||
      termsIsUnchecked
    );
  }

  handleInputChange(e) {
    if (this.anyInputIsIncomplete()) {
      this.continueButtonTarget.classList.add("disabled");
    } else {
      this.continueButtonTarget.classList.remove("disabled");
    }
  }

  handleAccountNameChange(e) {
    if (
      e.target.value !== null &&
      e.target.value !== undefined &&
      e.target.value !== ""
    ) {
      this.finishButtonTarget.classList.remove("disabled");
    } else {
      this.finishButtonTarget.classList.add("disabled");
    }
  }

  handleContinue() {
    this.registrationData = {
      ...this.registrationData,
      first_name: this.firstNameInputTarget.value,
      last_name: this.lastNameInputTarget.value,
      email: this.emailInputTarget.value,
      password: this.passwordInputTarget.value,
      terms: "on",
    };
    this.goToStep1();
  }

  handleFileZoneClicked() {
    this.userAvatarInputTarget.click();
  }

  handleFileUpload(e) {
    const avatar = this.userAvatarInputTarget.files[0];
    this.registrationData.avatar = avatar;
    const url = URL.createObjectURL(avatar);
    this.avatarPreviewTarget.src = url;
    this.avatarPreviewTarget.style.display = "block";
    this.plusIconTarget.style.display = "none";
  }

  finishRegistrationWithInvite() {
    const csrfToken = document.getElementsByName("csrf-token")[0].content;
    const accountToken = window.location.href.split("?token=")[1];
    let formData = new FormData();
    formData.append("user[first_name]", this.firstNameInputTarget.value);
    formData.append("user[last_name]", this.lastNameInputTarget.value);
    formData.append("user[email]", this.registrationData.email);
    formData.append("user[terms]", "on");
    formData.append("user[password]", this.passwordInputTarget.value);
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
        }
      })
      .catch((err) => console.error(err))
      .finally(() => {
        this.finishButtonTarget.style.display = "block";
        this.finishButtonLoadingTarget.style.display = "none";
      });
  }

  finishRegistration() {
    // clear error message if any
    this.errorTextTarget.innerText = null;
    const token = document.getElementsByName("csrf-token")[0].content;
    const accountName = this.accountNameInputTarget.value;
    const formData = new FormData();
    formData.append("user[first_name]", this.registrationData.first_name);
    formData.append("user[last_name]", this.registrationData.last_name);
    formData.append("user[email]", this.registrationData.email);
    formData.append("user[terms]", this.registrationData.terms);
    formData.append("user[password]", this.registrationData.password);
    if (this.registrationData.avatar)
      formData.append("user[avatar]", this.registrationData.avatar);
    formData.append("account[name]", accountName);
    formData.append(
      "account[account_type]",
      this.registrationData.account_type
    );
    this.finishButtonTarget.style.display = "none";
    this.finishButtonLoadingTarget.style.display = "block";
    fetch("/users/register", {
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
        const responseErrorKey = Object.keys(res.error)[0];
        const responseErrorValue = res.error[responseErrorKey][0];
        const errorMessage = `${responseErrorKey} ${responseErrorValue}.`;
        this.errorTextTarget.innerText = errorMessage;
      })
      .catch((err) => console.error(err))
      .finally(() => {
        this.finishButtonTarget.style.display = "block";
        this.finishButtonLoadingTarget.style.display = "none";
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
    this.continueToNameButtonTarget.classList.remove("disabled");
    this.selectType("organization");
  }

  clearTypes() {
    this.organizationBoxTarget.classList.remove("selected");
    this.personalBoxTarget.classList.remove("selected");
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
}
