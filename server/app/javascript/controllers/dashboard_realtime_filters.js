import RealtimeFiltersController from './realtime_filters_controller';
import {emitCustomEvent} from "../eventsEmitter";

export default class extends RealtimeFiltersController {
  
  static targets = ['loadingOverlay', 'spinner', 'widget', 'dynamicCompareByContainer', 'modalFilters'];
  
  connect(){
    super.connect();
    this.loadingStates = new Map();
    this.widgetTargets.forEach(widget => {
      this.loadingStates.set(widget.id, undefined);
    });
  }
  
  locationsMapFetchHandler() {
    setTimeout(() => {emitCustomEvent('renderLocationsMap');}, 200);
  }
  
  selectFilter(e, source = undefined) {
    super.selectFilter(e);
    if(!source) this.fetchAllWidgets();
  }
  
  selectManualFilter(e) {
    super.selectFilter(e);
  }
  
  selectMultiFilter(e) {
    super.selectMultiFilter(e);
    this.fetchAllWidgets();
  }
  
  fetchAllWidgets(customSearchParams = null) {
    if(customSearchParams) this.searchParams = customSearchParams;
    this.spinnerTarget.style.display = 'block';
    this.loadingOverlayTarget.style.opacity = .5;
    const url = new URL(window.location);
    url.search = this.searchParams.toString();
    window.history.pushState({}, '', url);
    this.widgetTargets.forEach(widget => {
      const widgetUrl = new URL(widget.src);
      widgetUrl.search = this.searchParams.toString();
      widget.src = widgetUrl;
      if(this.loadingStates.get(widget.id) === undefined) return;
      this.loadingStates.set(widget.id, true);
    });
  }
  
  remoteFetchAllWidgets(e) {
    const { searchParams, filterTargets } = e.detail;
    this.updateAllFiltersFromSearchParams(searchParams, filterTargets);
    this.updateAllFiltersFromSearchParams(searchParams, this.filterTargets);
    this.fetchAllWidgets(searchParams);
    this.setDefaultActiveValuesForFilters();
  }
  
  setDefaultActiveValuesForFilters() {
    const keySet = new Set();
    this.filterTargets.forEach(filter => {
      if(filter.dataset.key === 'days') return;
      keySet.add(filter.dataset.key);
    });
    keySet.forEach(key => {
      if(!this.searchParams.has(key)) {
        const defaultOption = document.querySelector(`[data-key="${key}"][data-value="all"]`);
        if(defaultOption) {
          this.setAsActive(defaultOption.dataset.baseMenuId, key, 'all');
          this.updateBaseButton(defaultOption, null);
        }
      }
    });
  }
  
  updateAllFiltersFromSearchParams(searchParams, collection = this.filterTargets) {
    if(!searchParams || searchParams.size === 0) {
      this.updateAllFiltersToDefaultLabel(collection);
      return;
    }
    collection.forEach(filter => {
      const key = filter.dataset.key;
      const value = filter.dataset.value;
      const baseMenuId = filter.dataset.baseMenuId;
      if(key === 'days') return;
      if(searchParams.has(key) && searchParams.get(key) === value) {
        this.setAsActive(filter.dataset.baseMenuId, key, value);
        this.updateBaseButton(filter, filter.dataset.label);
      } else {
        this.setAsInactive(baseMenuId, key, value);
      }
    });
  }
  
  updateAllFiltersToDefaultLabel(collection = this.filterTargets) {
    collection.forEach(filter => {
      if(filter.dataset.key === 'days') return;
      this.updateBaseButton(filter, null);
      if(filter.dataset.value === 'all') {
        this.setAsActive(filter.dataset.baseMenuId, filter.dataset.key, filter.dataset.value);
      } else {
        this.setAsInactive(filter.dataset.baseMenuId, filter.dataset.key, filter.dataset.value);
      }
    });
  }
  
  onWidgetSubmitEnd(e) {
    const widgetId = e.target.id;
    this.loadingStates.set(widgetId, false);
    if (Array.from(this.loadingStates.values()).filter(loading => loading === true).length === 0) {
      this.spinnerTarget.style.display = 'none';
      this.loadingOverlayTarget.style.opacity = 1;
    }
  }
  
  toggleDynamicContent(e) {
    this.dynamicCompareByContainerTarget.dataset.currentCompareBy = e.target.dataset.value;
  }
}