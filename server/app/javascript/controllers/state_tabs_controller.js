import { Controller } from "@hotwired/stimulus";

const STATE_TABS = {
  MICHIGAN: 'michigan',
  WEST_VIRGINIA: 'west-virginia',
  ALASKA: 'alaska',
  TEXAS: 'texas'
}

const targetIds = {
  'AK_Northwest_Arctic-1': 'Northwest Arctic Borough',
  'AK_North_Slope-6': 'North Slope Borough',
  'AK_Nome-6': 'Nome Census Area',
  'AK_Dillingham-3': 'Dillingham Census Area',
  'AK_Aleutians_West-2': 'Aleutians West Census Area',
  'AK_Bristol_Bay-1': 'Bristol Bay Borough',
  'c48151': 'Fischer',
  'c48207': 'Haskell',
  'c48253': 'Jones',
  'c48279': 'Lamb',
  'c48107': 'Crosby',
  'c48335': 'Mitchell',
  'c54085': 'Ritchie',
  'c54013': 'Calhoun',
  'c54087': 'Roane',
  'c54035': 'Jackson',
  'c54039': 'Kanawha',
  'c54067': 'Nicholas',
  'c54015': 'Clay',
  'Montmorency_County': 'Montmorency',
  'Oscoda_County': 'Oscoda',
  'Missaukee_County': 'Missaukee',
  'Manistee_County': 'Manistee',
  'Osceola_County': 'Osceola',
  'Gladwin_County': 'Gladwin'
};

export default class extends Controller {
  
  static targets = ['tabContent'];
  
  connect() {
    this.currentTab = STATE_TABS.MICHIGAN;
    this.isShowingTooltip = false;
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
  
  handleMouseOverState(e) {
    let targetId = e.target.id;
    if(!targetId && e.target.tagName === 'path') {
      targetId = e.target.parentElement.id;
    }
    if(!targetId) return;
    if(!Object.keys(targetIds).includes(targetId)) return;
    const target = document.getElementById(targetId);
    if(target.hasAttribute('fill-opacity')) target.setAttribute('fill-opacity', '1.0');
    else if(target.hasAttribute('opacity')) target.setAttribute('opacity', '1.0');
    this.showTooltip(e, target);
  }
  
  handleMouseOutState(e) {
    let targetId = e.target.id;
    if(!targetId && e.target.tagName === 'path') {
      targetId = e.target.parentElement.id;
    }
    if(!targetId) return;
    if(!Object.keys(targetIds).includes(targetId)) return;
    const target = document.getElementById(targetId);
    if(target.hasAttribute('fill-opacity')) target.setAttribute('fill-opacity', '0.6');
    else if(target.hasAttribute('opacity')) target.setAttribute('opacity', '0.6');
    this.hideTooltip();
  }
  
  showTooltip(event, target) {
    this.isShowingTooltip = true;
    const tooltip = document.getElementById('state-tooltip');
    const tooltipRect = tooltip.getBoundingClientRect();
    const cursorY = event.clientY;
    const cursorX = event.clientX;
    tooltip.innerText = targetIds[target.id];
    tooltip.style.top = `${cursorY - tooltipRect.height - 16}px`;
    tooltip.style.left = `${(cursorX - (tooltipRect.width / 2).toFixed(0))}px`;
    tooltip.removeAttribute('hidden');
  }
  
  hideTooltip() {
    this.isShowingTooltip = false;
    const tooltip = document.getElementById('state-tooltip');
    tooltip.setAttribute('hidden', 'hidden');
  }
}