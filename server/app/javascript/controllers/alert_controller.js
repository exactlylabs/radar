import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

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

}