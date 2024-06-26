import DashboardRealtimeFilters from "./dashboard_realtime_filters";
import {emitCustomEvent} from "../eventsEmitter";

export default class extends DashboardRealtimeFilters {
  
  static targets = ['modalContent', 'filter'];
  
  connect() {
    super.connect();
  }
  
  modalContentTargetConnected() {
    this.updateAllFiltersFromSearchParams(this.searchParams, this.filterTargets);
  }
  
  selectFilter(e) {
    super.selectFilter(e, 'all-filters');
  }
  
  applyFilters(e) {
    emitCustomEvent('remoteFetchAllWidgets', { detail: { searchParams: this.searchParams, filterTargets: this.filterTargets } })
  }
  
  clearFilters(e) {
    emitCustomEvent('remoteFetchAllWidgets', { detail: { searchParams: null, filterTargets: this.filterTargets } });
  }
}