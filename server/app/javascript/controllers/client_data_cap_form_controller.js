import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "dataCapValueInput",
    "dataCapValueSelect"
  ];

  connect() {}

  onSwitchChange(e) {
    const isSwitchOn = e.target.checked;
    const inputTarget = this.dataCapValueInputTarget;
    const selectTarget = this.dataCapValueSelectTarget;
    if(isSwitchOn) {
      inputTarget.removeAttribute('readonly');
      inputTarget.classList.remove('text-muted');
      selectTarget.removeAttribute('disabled');
    } else {
      inputTarget.setAttribute('readonly', 'true');
      inputTarget.classList.add('text-muted');
      selectTarget.setAttribute('disabled', '');
    }
  }

}