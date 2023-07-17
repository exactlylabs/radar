import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";
import { emitCustomEvent } from "../eventsEmitter";
import { AlertTypes } from "./alert_controller";

const STEPS = {
  ACCOUNT_TYPE: 0,
  ACCOUNT_NAME: 1,
  SHARE: 2,
  FINAL: 3,
}

const ACCOUNT_TYPES = {
  PERSONAL: "personal",
  ORGANIZATION: "organization",
}

const selectedRowClass = "accounts--account-type-row-container-active";
const noAccountsSharedMessage = "Your account won't be shared with anyone else."

export default class extends Controller {
  static targets = [
    "personalAccountRow",
    "organizationAccountRow",
    "continueToNameButton",
    "continueToShareButton",
    "step0",
    "step1",
    "step2",
    "stepError",
    "accountNameLabel",
    "accountNameInput",
    "createAccountButton",
    "createAccountButtonLoading",
    "personalRadio",
    "organizationRadio",
    "shareTitle",
    "shareSubtitle",
    "shareOption",
    "accessText"
  ];

  connect() {}

  initialize() {
    this.currentStep = STEPS.ACCOUNT_TYPE;
    // Using underscore to comply with Ruby style
    this.newAccountData = {
      account_type: ACCOUNT_TYPES.PERSONAL,
      account_name: '',
      shared_to_accounts_ids: [],
    };
  }

  handleAccountTypeClick(e) {
    const selectedType = e.target.getAttribute("data-account-type");
    if (selectedType === this.newAccountData.account_type) return;
    if (selectedType === ACCOUNT_TYPES.PERSONAL) this.selectPersonal();
    else this.selectOrganization();
  }

  selectPersonal() {
    this.newAccountData.account_type = ACCOUNT_TYPES.PERSONAL;
    this.personalRadioTarget.setAttribute('checked', 'true');
    this.organizationRadioTarget.removeAttribute('checked');
    this.swapClasses(this.personalAccountRowTarget, this.organizationAccountRowTarget);
  }

  selectOrganization() {
    this.newAccountData.account_type = ACCOUNT_TYPES.ORGANIZATION;
    this.organizationRadioTarget.setAttribute('checked', 'true'); 
    this.personalRadioTarget.removeAttribute('checked');
    this.swapClasses(this.organizationAccountRowTarget, this.personalAccountRowTarget);
  }

  swapClasses(current, other) {
    const classList = current.classList;
    const otherClassList = other.classList;
    if (otherClassList.contains(selectedRowClass)) {
      otherClassList.remove(selectedRowClass);
    }
    classList.add(selectedRowClass);
  }

  clearAccountName() {
    this.accountNameInputTarget.value = null;
  }

  goToNameStep() {
    this.clearAccountName();
    this.accountNameInputTarget.focus();
    if (this.newAccountData.account_type === ACCOUNT_TYPES.PERSONAL) {
      this.accountNameLabelTarget.innerText = "Account Name";
      this.accountNameInputTarget.placeholder = "E.g.: John's Home";
    } else {
      this.accountNameLabelTarget.innerText = "Organization Name";
      this.accountNameInputTarget.placeholder = "E.g.: ACME Inc.";
    }
    this.step0Target.classList.add('invisible');
    this.step1Target.classList.remove('invisible');
  }

  goToTypeStep() {
    this.clearAccountName();
    this.step0Target.classList.remove('invisible');
    this.step1Target.classList.add('invisible');
  }

  goToShareStep() {
    this.step1Target.classList.add('invisible');
    this.shareTitleTarget.innerText = `Share ${this.newAccountData.account_name} with existing accounts`;
    this.shareSubtitleTarget.innerText = `${this.newAccountData.account_name} can be shared with everyone from other existing accounts.`;
    this.step2Target.classList.remove('invisible');
  }

  goToNameStepFromShare() {
    this.step1Target.classList.remove('invisible');
    this.step2Target.classList.add('invisible');
  }

  handleAccountNameChange(e) {
    if (
      e.target.value !== null &&
      e.target.value !== undefined &&
      e.target.value !== ""
    ) {
      this.continueToShareButtonTarget.classList.remove("custom-button--disabled");
      this.continueToShareButtonTarget.classList.remove("disabled");
    } else {
      this.continueToShareButtonTarget.classList.add("custom-button--disabled");
      this.continueToShareButtonTarget.classList.add("disabled");
    }
    this.newAccountData.account_name = e.target.value ?? null;
  }

  showErrorModal() {
    this.clearAccountName();
    this.clearTypes();
    this.step1Target.style.display = "none";
    this.stepErrorTarget.style.display = "flex";
    this.step1FooterTarget.style.display = "none";
  }

  handleSharedToAccountSelect() {
    const sharedAccountsNames = [];
    this.newAccountData.shared_to_accounts_ids = [];
    this.shareOptionTargets
      .filter(option => option.selected)
      .forEach(option => {
        sharedAccountsNames.push(option.label);
        this.newAccountData.shared_to_accounts_ids.push(parseInt(option.value));
      });
    if(sharedAccountsNames.length === 0) {
      this.accessTextTarget.innerText = noAccountsSharedMessage;
    } else {
      let accountNamesString = sharedAccountsNames.join(', ');
      if (sharedAccountsNames.length > 1) {
        accountNamesString = accountNamesString.split('');
        accountNamesString.splice(accountNamesString.lastIndexOf(','), 1, ' and');
        accountNamesString = accountNamesString.join('');
      }
      this.accessTextTarget.innerText = `Everyone at ${accountNamesString} will be able to access ${this.newAccountData.account_name}.`;
    }
  }

  createAccount() {
    const token = document.getElementsByName("csrf-token")[0].content;
    const formData = new FormData();
    formData.append("account[name]", this.newAccountData.account_name);
    formData.append("account[account_type]", this.newAccountData.account_type);
    formData.append("shared_to_accounts_ids", JSON.stringify(this.newAccountData.shared_to_accounts_ids));
    this.createAccountButtonTarget.classList.add('invisible');
    this.createAccountButtonLoadingTarget.classList.remove('invisible');
    fetch("/accounts", {
      method: "POST",
      headers: { "X-CSRF-Token": token },
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.status === "ok") { window.location.href = "/dashboard?new_account=true" }
        else throw new Error(`There was an error creating an account: ${res.msg}`);
      })
      .catch((err) => {
        emitCustomEvent('renderAlert', {
          detail: {
            message: err.message,
            type: AlertTypes.ERROR
          }
        });
        handleError(err, this.identifier);
      })
      .finally(() => {
        this.createAccountButtonTarget.classList.remove('invisible');
        this.createAccountButtonLoadingTarget.classList.add('invisible');
      });
  }
}
