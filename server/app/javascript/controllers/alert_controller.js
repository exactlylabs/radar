import { Controller } from "@hotwired/stimulus"

const ALERT_TYPES = {
  ERROR: 'error',
  SUCCESS: 'success',
  ACCOUNT_SWITCH: 'account_switch'
}

export default class extends Controller {

  static targets = ["placeholderAlert", "notice", "errorIcon", "successIcon"];

  connect() {
    setTimeout(this.removeOpening.bind(this), 500);
    setTimeout(this.closeAlert.bind(this) , 5000);
  }

  removeOpening() {
    this.element.classList.remove('opening');
  }

  closeAlert() {
    this.element.classList.add('closing');
    setTimeout(() => { this.element.classList.add('invisible'); }, 1000);
  }

  renderAlert(e) {
    if(this.hasPlaceholderAlertTarget) {
      const { alertType, message } = e.detail;
      this.placeholderAlertTarget.setAttribute('data-alert-type', alertType);
      this.noticeTarget.innerText = message;
      if (alertType === ALERT_TYPES.ERROR) {
        this.successIconTarget.classList.add('invisible');
        this.errorIconTarget.classList.remove('invisible');
      } else if (alertType === ALERT_TYPES.SUCCESS) {
        this.errorIconTarget.classList.add('invisible');
        this.successIconTarget.classList.remove('invisible');
      }
      this.placeholderAlertTarget.classList.remove('invisible');
      this.placeholderAlertTarget.classList.add('opening');
    }
  }
}