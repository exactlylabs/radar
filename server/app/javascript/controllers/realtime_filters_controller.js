import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  
  static targets = ['filter', 'filterOption'];
  
  connect() {
    this.searchParams = new URLSearchParams(window.location.search);
    this.allItems = new Map();
    this.filterTargets.forEach(filter => {
      if(!this.allItems.has(filter.dataset.key)) {
        this.allItems.set(filter.dataset.key, new Map());
      }
      this.allItems.get(filter.dataset.key).set(filter.dataset.value, filter.dataset.label);
      if(this.searchParams.has(filter.dataset.key) && this.searchParams.get(filter.dataset.key) === filter.dataset.value) {
        this.setAsActive(filter.dataset.baseMenuId, filter.dataset.key, filter.dataset.value);
      }
    });
  }
  
  selectFilter(e) {
    const selectedFilterTarget = e.target;
    const key = selectedFilterTarget.dataset.key;
    const value = selectedFilterTarget.dataset.value;
    const label = selectedFilterTarget.dataset.label;
    const baseMenuId = selectedFilterTarget.dataset.baseMenuId;
    if(value === 'all') {
      this.searchParams.delete(key);
      this.updateBaseButton(selectedFilterTarget, null);
    } else {
      this.searchParams.set(key, value);
      this.updateBaseButton(selectedFilterTarget, label);
    }
    this.setAsActive(baseMenuId, key, value);
    this.removeOverriddenKeys(selectedFilterTarget.dataset.overriddenKeys);
  }
  
  selectMultiFilter(e) {
    const selectedFilterTarget = e.target;
    const key = selectedFilterTarget.dataset.key;
    const value = selectedFilterTarget.dataset.value;
    const baseMenuId = selectedFilterTarget.dataset.baseMenuId;
    let label = '';
    const defaultOption = document.querySelector(`[data-key="${key}"][data-value="all"]`);
    if(defaultOption) {
      if(value === 'all') this.setAsActive(baseMenuId, key, value);
      else this.setAsInactive(baseMenuId, key, 'all');
    }
    if(value === 'all') {
      this.searchParams.delete(key);
      label = null;
      this.setAsActive(baseMenuId, key, value);
    } else if (this.searchParams.has(key)) {
      const values = this.searchParams.getAll(key);
      if (values.includes(value)) {
        this.searchParams.delete(key, value);
        const currentLength = values.length - 1;
        if(currentLength === 0) {
          let baseButton = document.getElementById(selectedFilterTarget.dataset.baseButtonId);
          label = baseButton.dataset.defaultLabel;
        } else if(currentLength === 1) {
          label = this.allItems.get(key).get(this.searchParams.getAll(key)[0]);
        } else {
          label = `${(currentLength)} ${selectedFilterTarget.dataset.multiLabel}`;
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
    this.removeOverriddenKeys(selectedFilterTarget.dataset.overriddenKeys);
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
      const childNodes = Array.from(baseButton.childNodes);
      const calendarIcon = childNodes.find(node => node.tagName === 'svg');
      const caret = childNodes.find(node => node.tagName === 'IMG');
      baseButton.innerText = text ?? baseButton.dataset.defaultLabel;
      if(calendarIcon) baseButton.prepend(calendarIcon);
      if(caret) baseButton.appendChild(caret);
    }
  }
  
  setAsActive(baseMenuId, key, value) {
    const element = document.querySelector(`#${baseMenuId} > button[data-key="${key}"][data-value="${value}"]`);
    const others = document.querySelectorAll(`#${baseMenuId} > button[data-key="${key}"]:not([data-value="${value}"])`);
    if(element) element.classList.add('active');
    others.forEach(other => {
      other.classList.remove('active');
      if(other.checked) other.checked = false;
    });
  }
  
  setAsInactive(baseMenuId, key, value) {
    const element = document.querySelector(`#${baseMenuId} > button[data-key="${key}"][data-value="${value}"]`);
    if(element) element.classList.remove('active');
  }
}