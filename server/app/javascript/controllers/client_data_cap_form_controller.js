import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["dataCapValueInput"];

  connect() {}

  onSwitchChange(e) {
    const isSwitchOn = e.target.checked;
    const inputTarget = this.dataCapValueInputTarget;
    if(isSwitchOn) {
      inputTarget.removeAttribute('readonly');
      inputTarget.classList.remove('text-muted');
    } else {
      inputTarget.setAttribute('readonly', 'true');
      inputTarget.classList.add('text-muted');
    }
  }

}