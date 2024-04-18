import { Controller } from "@hotwired/stimulus";

const TABS = {
  OVERVIEW: 'overview',
  DASHBOARD: 'dashboard',
}

export default class extends Controller {
  static targets = ["tab", "overview", "dashboard"];

  connect() {
    this.currentTab = TABS.OVERVIEW;
  }
  
  switchTab(e) {
    const selectedTab = e.currentTarget.getAttribute('data-content');
    if(selectedTab === this.currentTab) return;
    this.currentTab = selectedTab;
    this.showContent();
  }
  
  showContent() {
    const overviewTabButton = this.tabTargets.find(tab => tab.getAttribute('data-content') === TABS.OVERVIEW);
    const dashboardTabButton = this.tabTargets.find(tab => tab.getAttribute('data-content') === TABS.DASHBOARD);
    switch(this.currentTab) {
      case TABS.OVERVIEW:
        this.overviewTarget.removeAttribute('hidden');
        this.dashboardTarget.setAttribute('hidden', 'hidden');
        overviewTabButton.setAttribute('data-selected', 'true');
        dashboardTabButton.removeAttribute('data-selected');
        break;
      case TABS.DASHBOARD:
        this.dashboardTarget.removeAttribute('hidden');
        this.overviewTarget.setAttribute('hidden', 'hidden');
        overviewTabButton.removeAttribute('data-selected');
        dashboardTabButton.setAttribute('data-selected', 'true');
        break;
    }
  }
}