import { Controller } from "@hotwired/stimulus";
import { AlertTypes } from "../alerts";

export default class extends Controller {
  static targets = [
    "alertMessage",
    "alertSuccessIcon",
    "alertErrorIcon"
  ];

  connect() {
    if (this.element.getAttribute('data-placeholder') == 'true') return;
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
    const { message, type } = e.detail;
    if (type === AlertTypes.ERROR) {
      this.alertErrorIconTarget.classList.remove('invisible');
    } else if (type === AlertTypes.SUCCESS) {
      this.alertSuccessIconTarget.classList.remove('invisible');
    }
    this.element.setAttribute('data-alert-type', type);
    this.alertMessageTarget.innerText = message;
    this.element.classList.add('opening');
    this.element.classList.remove('invisible');
    setTimeout(this.removeOpening.bind(this), 500);
    setTimeout(this.closeAlert.bind(this), 5000);
  }
}