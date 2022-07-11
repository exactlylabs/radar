import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["firstNameInput", "lastNameInput", "emailInput", "passwordInput",
    "passwordCheckInput", "termsInput", "continueButton",
    "personalBox", "organizationBox", "continueToNameButton",
    "accountNameInput", "finishButton", "accountNameTitle", "accountNameSubtitle", "accountNameLabel",
    "step0Wrapper", "step1Wrapper", "step2Wrapper", "step3Wrapper"]

  connect() {}

  initialize() {
    this.registrationData = {
      firstName: null,
      lastName: null,
      email: null,
      password: null,
      accountName: null,
      accountType: null,
      avatar: null,
    };
  }

  anyInputIsIncomplete() {
    const firstNameValueIsNull = !this.firstNameInputTarget.value || this.firstNameInputTarget.value === '';
    const lastNameValueIsNull = !this.lastNameInputTarget.value || this.firstNameInputTarget.value === '';
    const emailValueIsNull = !this.emailInputTarget.value || this.firstNameInputTarget.value === '';
    const passwordValueIsNull = !this.passwordInputTarget.value || this.firstNameInputTarget.value === '';
    const passwordCheckValueIsNull = !this.passwordCheckInputTarget.value || this.firstNameInputTarget.value === '';
    const termsIsUnchecked = !this.termsInputTarget.checked;
    return firstNameValueIsNull || lastNameValueIsNull ||
           emailValueIsNull || passwordValueIsNull ||
           passwordCheckValueIsNull || termsIsUnchecked;
  }

  handleInputChange(e) {
    if(this.anyInputIsIncomplete()) {
      this.continueButtonTarget.classList.add('disabled');
    } else {
      this.continueButtonTarget.classList.remove('disabled');
    }
  }

  handleAccountNameChange(e) {
    if(e.target.value !== null && e.target.value !== undefined && e.target.value !== '') {
      this.finishButtonTarget.classList.remove('disabled');
    } else {
      this.finishButtonTarget.classList.add('disabled');
    }
  }

  handleContinue() {
    this.registrationData = {
      ...this.registrationData,
      firstName: this.firstNameInputTarget.value,
      lastName: this.lastNameInputTarget.value,
      email: this.emailInputTarget.value,
      password: this.passwordInputTarget.value,
    }
    // TODO: once avatars are supported, change to goToStep1
    this.goToStep2();
  }

  finishRegistration() {
    const token = document.getElementsByName('csrf-token')[0].content;
    const accountName = this.accountNameInputTarget.value;
    this.registrationData = {
      ...this.registrationData,
      accountName,
    };
    fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': token,
      },
      body: JSON.stringify(this.registrationData)
    })
      .then(res => console.log(res))
      .catch(err => console.error(err));
  }

  saveAvatarAndContinue() {
    // TODO: process image saving
    // process()
    this.goToStep2();
  }

  saveAccountTypeAndContinue() {
    this.goToStep3(this.registrationData.accountType);
  }

  selectType(type) {
    this.registrationData = {
      ...this.registrationData,
      accountType: type,
    }
  }

  selectPersonal() {
    const classList = this.personalBoxTarget.classList;
    const otherClassList = this.organizationBoxTarget.classList;
    if(classList.contains('selected')) {
      classList.remove('selected');
      this.continueToNameButtonTarget.classList.add('disabled');
      this.selectType(null);
    } else {
      if(otherClassList.contains('selected')) {
        otherClassList.remove('selected');
      }
      classList.add('selected');
      this.continueToNameButtonTarget.classList.remove('disabled');
      this.selectType('personal');
    }
  }

  selectOrganization() {
    const classList = this.organizationBoxTarget.classList;
    const otherClassList = this.personalBoxTarget.classList;
    if(classList.contains('selected')) {
      classList.remove('selected');
      this.continueToNameButtonTarget.classList.add('disabled');
      this.selectType(null);
    } else {
      if(otherClassList.contains('selected')) {
        otherClassList.remove('selected');
      }
      classList.add('selected');
      this.continueToNameButtonTarget.classList.remove('disabled');
      this.selectType('organization');
    }
  }

  clearTypes() {
    this.organizationBoxTarget.classList.remove('selected');
    this.personalBoxTarget.classList.remove('selected');
  }

  clearAccountName() {
    this.accountNameInputTarget.value = null;
  }

  goToStep1() {
    this.step0WrapperTarget.style.display = 'none';
    this.step1WrapperTarget.style.display = 'flex';
  }

  goToStep2() {
    // TODO: once avatars are supported, change to step1WrapperTarget
    this.step0WrapperTarget.style.display = 'none';
    this.step2WrapperTarget.style.display = 'flex';
    this.clearTypes();
  }

  goToStep3(type) {
    this.step2WrapperTarget.style.display = 'none';
    this.step3WrapperTarget.style.display = 'flex';
    this.clearAccountName();
    if(type === 'personal') {
      this.accountNameLabelTarget.innerText = 'Name';
      this.accountNameInputTarget.placeholder = "E.g.: John's Home";
      this.accountNameSubtitleTarget.innerText = 'Assign a name to your place so you can invite others to it as well.';
      this.accountNameTitleTarget.innerText = 'Give your account a name';
    } else {
      this.accountNameLabelTarget.innerText = 'Organization Name';
      this.accountNameInputTarget.placeholder = "E.g.: ACME Inc.";
      this.accountNameSubtitleTarget.innerText = 'Tell us your organization so you can invite others to join.';
      this.accountNameTitleTarget.innerText = 'What’s your organization?';
    }
  }

  // TODO: once avatars are supported change to step1
  backToStep0() {
    this.step0WrapperTarget.style.display = 'block';
    this.step2WrapperTarget.style.display = 'none';
  }

  backToStep1() {
    this.step1WrapperTarget.style.display = 'flex';
    this.step2WrapperTarget.style.display = 'none';
  }

  backToStep2() {
    this.step2WrapperTarget.style.display = 'flex';
    this.step3WrapperTarget.style.display = 'none';
  }
}