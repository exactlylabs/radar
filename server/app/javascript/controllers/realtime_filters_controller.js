import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  
  static targets = ['baseButton', 'filter', 'dynamicCompareByContainer'];
  
  connect() {
    this.searchParams = new URLSearchParams(window.location.search);
  }
  
  selectFilter(e) {
    const selectedFilterTarget = e.target;
    const key = selectedFilterTarget.dataset.key;
    const value = selectedFilterTarget.dataset.value;
    this.searchParams.set(key, value);
    this.updateBaseButton(selectedFilterTarget);
    this.setAsActive(key, value);
  }
  
  selectMultiFilter(e) {
    e.preventDefault();
    const selectedFilterTarget = e.target;
    const key = selectedFilterTarget.dataset.key;
    const value = selectedFilterTarget.dataset.value;
    let label = '';
    if (this.searchParams.has(key)) {
      const values = this.searchParams.getAll(key);
      if (values.includes(value)) {
        this.searchParams.delete(key);
        const currentValues = this.searchParams.getAll(key);
        if(currentValues.length === 0) {
          label = this.baseButtonTarget.dataset.defaultLabel;
        } else if(currentValues.length === 1) {
          label = currentValues[0];
        } else {
          label = currentValues.length + this.baseButtonTarget.dataset.defaultLabel.split('All ')[1];
        }
      } else {
        this.searchParams.append(key, value);
        label = (values.length + 1) + this.baseButtonTarget.dataset.defaultLabel.split('All ')[1]; // maybe this can be a data attribute
      }
    } else {
      this.searchParams.set(key, value);
      label = value;
    }
    this.updateBaseButton(label);
  }
  
  updateBaseButton(selectedOption) {
    let baseButton = document.getElementById(selectedOption.dataset.baseButtonId);
    if(baseButton) {
      const caret = Array.from(baseButton.childNodes).find(node => node.tagName === 'IMG');
      baseButton.innerText = selectedOption.dataset.label;
      baseButton.appendChild(caret);
    }
  }
  
  setAsActive(key, value) {
    this.filterTargets.forEach(filter => {
      if(filter.dataset.key === key && filter.dataset.value === value) {
        filter.classList.add('active');
      } else {
        filter.classList.remove('active');
      }
    });
  }
  
  applyFilters(e) {
    e.preventDefault();
    const url = new URL(window.location.href);
    url.search = this.searchParams.toString();
    window.location.href = url.href;
  }
  
  toggleDynamicContent(e) {
    this.dynamicCompareByContainerTarget.dataset.currentCompareBy = e.target.dataset.value;
  }
}