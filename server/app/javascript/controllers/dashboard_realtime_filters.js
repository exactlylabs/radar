import RealtimeFiltersController from './realtime_filters_controller';

export default class extends RealtimeFiltersController {
  
  static targets = ['loadingOverlay', 'spinner', 'widget', 'dynamicCompareByContainer'];
  
  connect(){
    super.connect();
    this.loadingStates = new Map();
    this.widgetTargets.forEach(widget => {
      this.loadingStates.set(widget.id, undefined);
    });
  }
  
  selectFilter(e) {
    super.selectFilter(e);
    this.fetchAllWidgets();
  }
  
  selectMultiFilter(e) {
    super.selectMultiFilter(e);
    this.fetchAllWidgets();
  }
  
  fetchAllWidgets() {
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