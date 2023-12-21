import { Controller } from "@hotwired/stimulus";

const STATE_TABS = {
  MICHIGAN: 'michigan',
  WEST_VIRGINIA: 'west-virginia',
  ALASKA: 'alaska',
  TEXAS: 'texas'
}

export default class extends Controller {
  
  static targets = ['tabContent'];
  
  connect() {
    this.currentTab = STATE_TABS.MICHIGAN;
  }
  
  handleClickTab(e) {
    const tab = e.target.dataset.tabId;
    if(tab === this.currentTab) return;
    const previousTab = document.querySelector(`[data-tab-id="${this.currentTab}"]`);
    previousTab.dataset.selected = 'false';
    e.target.dataset.selected = 'true';
    this.currentTab = tab;
    this.tabContentTargets.forEach(tabContent => {
      tabContent.dataset.visible = tabContent.id === tab ? 'true' : 'false';
    });
  }
}