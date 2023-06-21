import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  static targets = ["placeholderAlert", "notice"];

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
      this.placeholderAlertTarget.classList.remove('invisible');
      this.placeholderAlertTarget.classList.add('opening');
    }
  }
}