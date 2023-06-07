import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  connect() {
    setTimeout(this.closeAlert.bind(this) , 5000);
  }

  closeAlert() {
    this.element.classList.add('closing');
    setTimeout(() => { this.element.classList.add('invisible'); }, 1000);
  }

}