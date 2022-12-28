import { Controller } from "@hotwired/stimulus";

const Periodicity = {
  0: "per hour",
  1: "per day",
  2: "per week",
  3: "per month"
}

export default class extends Controller {
  static targets = [
    "schedulingValueInput",
    "schedulingValueSelect",
    "podPeriodicityString"
  ];

  connect() {}

  onSwitchChange(e) {
    const isSwitchOn = e.target.checked;
    const inputTarget = this.schedulingValueInputTarget;
    const selectTarget = this.schedulingValueSelectTarget;
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



  onInputChange(e) {
    let newInputValue = e.target.value;
    if(!newInputValue) {
      this.schedulingValueInputTarget.value = 1;
      newInputValue = 1
    }
    const currentSelectValue = Periodicity[parseInt(this.schedulingValueSelectTarget.value)];
    this.podPeriodicityStringTarget.innerText = `Tests are set to run ${newInputValue} ${parseInt(newInputValue) === 1 ? 'time' : 'times'} ${currentSelectValue}.`;
  }

  onSelectChange(e) {
    const newSelectValue = e.target.value;
    const currentInputValue = this.schedulingValueInputTarget.value;
    this.podPeriodicityStringTarget.innerText = `Tests are set to run ${currentInputValue} ${parseInt(currentInputValue) === 1 ? 'time' : 'times'} ${Periodicity[parseInt(newSelectValue)]}.`;
  }

}