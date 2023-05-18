import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "dataCapValueInput",
    "monthlyResetValueSelect",
    "monthlyResetDayValueSelect",
    "resetDayInputGroup",
    "formRowContainer",
    "dataCapWarning",
    "dataCapWarningText",
    "testFrequencyText"
  ];

  connect() {}

  disableComponents() {
    const inputTarget = this.dataCapValueInputTarget;
    const resetValueSelect = this.monthlyResetValueSelectTarget;
    const resetDayValueSelect = this.monthlyResetDayValueSelectTarget;
    const resetDayInputGroup = this.resetDayInputGroupTarget;
    const formRows = this.formRowContainerTargets;
    inputTarget.setAttribute('readonly', 'true');
    inputTarget.classList.add('text-muted');
    resetDayInputGroup.style.display = 'none';
    resetValueSelect.classList.add('select2-custom-disable');
    resetDayValueSelect.classList.add('select2-custom-disable');
    formRows.forEach(fr => fr.classList.add('form-custom-opaque'));
    resetValueSelect.setAttribute('aria-disabled', 'true');
    resetValueSelect.setAttribute('disabled', 'true');
    resetDayValueSelect.setAttribute('aria-disabled', 'true');
    resetDayValueSelect.setAttribute('disabled', 'true');
    this.hideWarning();
  }
  
  enableComponents() {
    const inputTarget = this.dataCapValueInputTarget;
    const resetValueSelect = this.monthlyResetValueSelectTarget;
    const resetDayValueSelect = this.monthlyResetDayValueSelectTarget;
    const resetDayInputGroup = this.resetDayInputGroupTarget;
    const formRows = this.formRowContainerTargets;
    inputTarget.removeAttribute('readonly');
    inputTarget.classList.remove('text-muted');
    if(resetValueSelect.value === 2) resetDayInputGroup.style.display = 'block';
    formRows.forEach(fr => fr.classList.remove('form-custom-opaque'));
    resetValueSelect.removeAttribute('aria-disabled');
    resetValueSelect.removeAttribute('disabled');
    resetDayValueSelect.removeAttribute('aria-disabled');
    resetDayValueSelect.removeAttribute('disabled');
  }
  
  onSwitchChange(e) {
    const isSwitchOn = e.target.checked;
    if(isSwitchOn) {
      this.enableComponents();
    } else {
      this.disableComponents();
    }
  }
  
  displayWarning(realCurrentUsage) {
    this.dataCapWarningTarget.style.display = 'flex';
    this.dataCapWarningTextTarget.innerText = `Current month usage (${realCurrentUsage} MB) is over the entered data cap. No more tests will be run this monthly cycle.`;
  }
  
  hideWarning() {
    this.dataCapWarningTarget.style.display = 'none';
  }
  
  onInputChange(e) {
    const value = parseInt(e.target.value);
    if(isNaN(value)) return;
    const currentUsage = parseInt(this.dataCapValueInputTarget.getAttribute('data-client-average-usage'));
    if(value <= currentUsage) {
      this.displayWarning(currentUsage);
    } else {
      this.hideWarning();
    }
  }
  
  showDaysSelect() {
    this.resetDayInputGroupTarget.style.display = 'block';
  }
  
  hideDaysSelect() {
    this.resetDayInputGroupTarget.style.display = 'none';
  }
  
  updateFrequencyText(valueSelected) {
    let text;
    if(valueSelected === 1) {
      text = 'Data usage will be reset on the first day of each month.';
    } else if(valueSelected === -1) {
      text = 'Data usage will be reset on the last day of each month.';
    } else {
      const daySelected = parseInt(this.monthlyResetDayValueSelectTarget.value);
      if(daySelected === 1) text = 'Data usage will be reset on the first day of each month.';
      else text = `Data usage will be reset every month on day ${daySelected}.`;
    }
    this.testFrequencyTextTarget.innerText = text;
  }
  
  onSelectChange(e) {
    const value = parseInt(e.target.value);
    if(value === 2) {
      this.showDaysSelect();
    } else {
      this.hideDaysSelect();
    }
    this.updateFrequencyText(value);
  }
  
  onDaySelectChange(e) {
    this.updateFrequencyText(parseInt(e.target.value));
  }

}