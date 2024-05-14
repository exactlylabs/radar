import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  
  static targets = ['baseButton', 'filter', 'dynamicCompareByContainer', 'filterOption'];
  
  connect() {
    this.searchParams = new URLSearchParams(window.location.search);
    this.allItems = new Map();
    this.filterTargets.forEach(filter => {
      if(!this.allItems.has(filter.dataset.key)) {
        this.allItems.set(filter.dataset.key, new Map());
      }
      this.allItems.get(filter.dataset.key).set(filter.dataset.value, filter.dataset.label);
      if(this.searchParams.has(filter.dataset.key) && this.searchParams.get(filter.dataset.key) === filter.dataset.value) {
        this.setAsActive(filter.dataset.key, filter.dataset.value);
      }
    });
  }
  
  selectFilter(e) {
    const selectedFilterTarget = e.target;
    const key = selectedFilterTarget.dataset.key;
    const value = selectedFilterTarget.dataset.value;
    const label = selectedFilterTarget.dataset.label;
    if(value === 'all') {
      this.searchParams.delete(key);
      this.updateBaseButton(selectedFilterTarget, null);
    } else {
      this.searchParams.set(key, value);
      this.updateBaseButton(selectedFilterTarget, label);
    }
    this.setAsActive(key, value);
    this.removeOverriddenKeys(selectedFilterTarget.dataset.overridenKeys);
  }
  
  selectMultiFilter(e) {
    e.preventDefault();
    const selectedFilterTarget = e.target;
    const key = selectedFilterTarget.dataset.key;
    const value = selectedFilterTarget.dataset.value;
    let label = '';
    if(value === 'all') {
      this.searchParams.delete(key);
      this.updateBaseButton(selectedFilterTarget, null);
    } else if (this.searchParams.has(key)) {
      const values = this.searchParams.getAll(key);
      if (values.includes(value)) {
        this.searchParams.delete(key, value);
        const currentValues = this.searchParams.getAll(key);
        if(currentValues.length === 0) {
          label = this.baseButtonTarget.dataset.defaultLabel;
        } else if(currentValues.length === 1) {
          label = this.allItems.get(key).get(currentValues[0]);
        } else {
          label = `${(currentValues.length)} ${selectedFilterTarget.dataset.multiLabel}`;
        }
      } else {
        this.searchParams.append(key, value);
        label = `${(values.length + 1)} ${selectedFilterTarget.dataset.multiLabel}`;
      }
    } else {
      this.searchParams.set(key, value);
      label = this.allItems.get(key).get(value);
    }
    this.updateBaseButton(selectedFilterTarget, label);
    this.removeOverriddenKeys(selectedFilterTarget.dataset.overridenKeys);
  }
  
  removeOverriddenKeys(overriddenKeys) {
    if(overriddenKeys !== '' && overriddenKeys.length > 0) {
      overriddenKeys.split(',').map(s => s.trim()).forEach(key => {
        this.searchParams.delete(key);
      });
    }
  }
  
  updateBaseButton(selectedOption, text) {
    let baseButton = document.getElementById(selectedOption.dataset.baseButtonId);
    if(baseButton) {
      const caret = Array.from(baseButton.childNodes).find(node => node.tagName === 'IMG');
      baseButton.innerText = text ?? baseButton.dataset.defaultLabel;
      baseButton.appendChild(caret);
    }
  }
  
  setAsActive(key, value) {
    const element = document.querySelector(`[data-key="${key}"][data-value="${value}"]`);
    const others = document.querySelectorAll(`[data-key="${key}"]:not([data-value="${value}"])`);
    if(element) {
      element.classList.add('active');
    }
    others.forEach(other => {
      other.classList.remove('active');
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