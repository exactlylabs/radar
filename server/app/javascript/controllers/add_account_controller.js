import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";

export default class extends Controller {
  static targets = [
    "personalBox",
    "organizationBox",
    "continueToNameButton",
    "step0",
    "step1",
    "stepError",
    "step0Footer",
    "step1Footer",
    "accountNameLabel",
    "accountNameInput",
    "finishButton",
    "finishButtonLoading",
  ];

  connect() {}

  initialize() {
    // Using underscore to comply with Ruby style
    this.newAccountData = {
      account_type: null,
      account_name: null,
    };
  }

  saveAccountTypeAndContinue() {
    this.goToNameStep(this.newAccountData.account_type);
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

  selectType(type) {
    this.newAccountData = {
      ...this.newAccountData,
      account_type: type,
    };
  }

  clearTypes() {
    this.organizationBoxTarget.classList.remove("selected");
    this.personalBoxTarget.classList.remove("selected");
  }

  clearAccountName() {
    this.accountNameInputTarget.value = null;
  }

  goToNameStep(type) {
    this.step0Target.style.display = "none";
    this.step1Target.style.display = "flex";
    this.step0FooterTarget.style.display = "none";
    this.step1FooterTarget.style.display = "flex";
    this.accountNameInputTarget.focus();
    this.clearAccountName();
    if (type === "personal") {
      this.accountNameLabelTarget.innerText = "Name";
      this.accountNameInputTarget.placeholder = "E.g.: John's Home";
    } else {
      this.accountNameLabelTarget.innerText = "Organization Name";
      this.accountNameInputTarget.placeholder = "E.g.: ACME Inc.";
    }
  }

  goToTypeStep() {
    this.clearAccountName();
    this.step0Target.style.display = "flex";
    this.step1Target.style.display = "none";
    this.step0FooterTarget.style.display = "flex";
    this.step1FooterTarget.style.display = "none";
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

  closeModalAndSetNewCookie() {
    this.clearAccountName();
    this.clearTypes();
    $(this.element).modal("hide");
    window.location.href = "/dashboard";
  }

  showErrorModal() {
    this.clearAccountName();
    this.clearTypes();
    this.step1Target.style.display = "none";
    this.stepErrorTarget.style.display = "flex";
    this.step1FooterTarget.style.display = "none";
  }

  submitNewAccount() {
    const token = document.getElementsByName("csrf-token")[0].content;
    const accountName = this.accountNameInputTarget.value;
    const formData = new FormData();
    formData.append("account[name]", accountName);
    formData.append("account[account_type]", this.newAccountData.account_type);
    this.finishButtonTarget.style.display = "none";
    this.finishButtonLoadingTarget.style.display = "block";
    fetch("/accounts", {
      method: "POST",
      headers: { "X-CSRF-Token": token },
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "ok") this.closeModalAndSetNewCookie();
        else throw new Error(`There was an error creating an account: ${res.msg}`);
      })
      .catch((err) => {
        this.showErrorModal();
        handleError(err, this.identifier);
      })
      .finally(() => {
        this.finishButtonTarget.style.display = "block";
        this.finishButtonLoadingTarget.style.display = "none";
      });
  }
}
