import { Controller } from "@hotwired/stimulus";
import { AlertTypes } from "../alerts";

const REMOVE_OPENING_TIMEOUT = 500;
const CLOSE_ALERT_TIMEOUT = 3000;
const MAKE_INVISIBLE_TIMEOUT = 500;

export default class extends Controller {
  static targets = [
    "alertMessage",
    "alertSuccessIcon",
    "alertErrorIcon"
  ];

  connect() {
    if (this.element.getAttribute('data-placeholder') == 'true') return;
    setTimeout(this.removeOpening.bind(this), REMOVE_OPENING_TIMEOUT);
    setTimeout(this.closeAlert.bind(this) , CLOSE_ALERT_TIMEOUT);
  }

  removeOpening() {
    this.element.classList.remove('opening');
  }

  closeAlert() {
    this.element.classList.add('closing');
    setTimeout(this.makeInvisible.bind(this), MAKE_INVISIBLE_TIMEOUT);
  }

  makeInvisible() {
    this.element.classList.add('invisible');
    this.element.classList.remove('closing');
  }
  
  renderAlert(e) {
    const { message, type } = e.detail;
    this.alertErrorIconTarget.classList.add('invisible');
    this.alertSuccessIconTarget.classList.add('invisible');
    if (type === AlertTypes.ERROR) {
      this.alertErrorIconTarget.classList.remove('invisible');
    } else if (type === AlertTypes.SUCCESS) {
      this.alertSuccessIconTarget.classList.remove('invisible');
    }
    this.element.setAttribute('data-alert-type', type);
    this.alertMessageTarget.innerText = message;
    this.element.classList.remove('invisible');
    this.element.classList.add('opening');
    setTimeout(this.removeOpening.bind(this), REMOVE_OPENING_TIMEOUT);
    setTimeout(this.closeAlert.bind(this), CLOSE_ALERT_TIMEOUT);
  }
}