import { Controller } from "@hotwired/stimulus";

const ACCOUNT_TYPES = {
  PERSONAL: 'personal',
  ORGANIZATION: 'organization'
}

export default class extends Controller {

  static targets = ['personalLabel', 'organizationLabel'];

  connect(){
    this.accountType = this.element.getAttribute('data-account-type');
  }

  handleChangeAccountType(e) {
    this.accountType = ACCOUNT_TYPES[e.target.value.toUpperCase()];
    if(this.accountType === ACCOUNT_TYPES.PERSONAL) {
      this.personalLabelTarget.classList.remove('regular-text');
      this.personalLabelTarget.classList.add('regular-bold-text');
      this.organizationLabelTarget.classList.remove('regular-bold-text');
      this.organizationLabelTarget.classList.add('regular-text');
    } else {
      this.organizationLabelTarget.classList.remove('regular-text');
      this.organizationLabelTarget.classList.add('regular-bold-text');
      this.personalLabelTarget.classList.remove('regular-bold-text');
      this.personalLabelTarget.classList.add('regular-text');
    }
  }
}
