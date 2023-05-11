import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  connect() {}

  closeAlert() {
    this.element.classList.add('invisible');
  }

}