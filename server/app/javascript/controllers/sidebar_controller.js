import { Controller } from "@hotwired/stimulus";
import { emitCustomEvent } from "../eventsEmitter";

export default class extends Controller {

  static targets = [
    'profileMenuToggle',
    'profileDataPopover',
    'profileMenuContainer',
    'accountOptionsMenu',
    'accountsMenu',
    'defaultSidebar',
    'searchSidebar',
    'searchInput',
    'clearInput',
    'accountsFilter',
    'accountFilterContainer',
    'allAccountsIconImage',
    'searchPanel',
    'sidebarItem'
  ]

  connect() {}

  getItemElements(itemId) {
    const icon = document.getElementById(`${itemId}-icon`);
    const activeIcon = document.getElementById(`${itemId}-icon-active`);
    const text = document.getElementById(`${itemId}-text`);
    return {icon, activeIcon, text};
  }

  handleItemHover(e) {
    const element = e.target;
    if(element.href === location.href) return;

    element.classList.add('sidebar--item-active');
    const itemId = element.getAttribute('data-item-id');
    const { icon, activeIcon, text } = this.getItemElements(itemId);
    icon.classList.add('invisible');
    activeIcon.classList.remove('invisible');
    text.classList.add('sidebar-item--text-active');
  }

  handleItemHoverOff(e) {
    const element = e.target;
    if (element.href === location.href) return;
    
    element.classList.remove('sidebar--item-active');
    const itemId = element.getAttribute('data-item-id');
    const { icon, activeIcon, text } = this.getItemElements(itemId);
    icon.classList.remove('invisible');
    activeIcon.classList.add('invisible');
    text.classList.remove('sidebar-item--text-active');  
  }

  openProfileMenu() {
    this.profileMenuToggleTarget.setAttribute('data-menu-state', 'open');
    this.profileMenuToggleTarget.classList.add('sidebar--profile-menu-toggle-open');
    this.profileDataPopoverTarget.classList.remove('invisible');
    document.addEventListener('click', this.closeProfileMenuOnClick.bind(this), {capture: true});
  }

  closeProfileMenu() {
    this.profileMenuToggleTarget.setAttribute('data-menu-state', 'closed');
    this.profileMenuToggleTarget.classList.remove('sidebar--profile-menu-toggle-open');
    this.profileDataPopoverTarget.classList.add('invisible');
  }

  closeProfileMenuOnClick(e) {
    const clickTarget = e.target;
    const popoverElement = document.getElementById('sidebar--profile-popover-regular');
    if(popoverElement && !popoverElement.classList.contains('invisible') && !popoverElement.contains(clickTarget)) {
      this.closeProfileMenu();
    }
  }

  toggleProfileMenu() {
    const currentState = this.profileMenuToggleTarget.getAttribute('data-menu-state');
    if(currentState === 'closed') this.openProfileMenu();
    else this.closeProfileMenu();
  }

  hoverAccount(e) {
    e.target.classList.add('sidebar--account-item-container-active');
    const accountId = this.getAccountId(e.target);
    if (accountId === '-1') return;
    
    const isShared = e.target.getAttribute('data-is-shared') === 'true';
    const iconId = `sidebar--account-item-options-icon${isShared ? '-shared' : ''}@${accountId}`;
    const iconElement = document.getElementById(iconId);
    if(iconElement) iconElement.classList.remove('invisible');
  }

  blurAccount(e) {
    const element = e.target;
    if (element.getAttribute('data-is-active') !== 'true')
      element.classList.remove('sidebar--account-item-container-active');
    
    const accountId = this.getAccountId(element);
    if(accountId === '-1') return;

    const isShared = element.getAttribute('data-is-shared') === 'true';
    const optionsMenuId = `sidebar--account-item-options-menu${isShared ? '-shared' : ''}@${accountId}`;
    const optionsMenu = document.getElementById(optionsMenuId);
    if (optionsMenu && !optionsMenu.classList.contains('invisible')) return;
    
    const iconId = `sidebar--account-item-options-icon${isShared ? '-shared' : ''}@${accountId}`;
    const iconElement = document.getElementById(iconId);
    if (iconElement) iconElement.classList.add('invisible');
  }

  getAccountId(target) {
    return target.id.split('@')[1];
  }

  closeAnyOtherMenu(elementToOpen) {
    this.accountOptionsMenuTargets.forEach(om => {
      if (!om.classList.contains('invisible') && this.getAccountId(elementToOpen) !== this.getAccountId(om)) {
        om.classList.add('invisible');
      }
    });
  }

  closeMenusOnScroll() {
    this.accountOptionsMenuTargets.forEach(om => {
      if (!om.classList.contains('invisible')) {
        om.classList.add('invisible');
      }
    });
  }

  /**
   * Need to control submenu position manually because of the way the sidebar is built,
   * mainly related to overflow and scrolling.
   * @param {HTMLElement} optionsMenuElement
   */
  openOptionsMenu(wrapperElement, optionsMenuElement) {
    optionsMenuElement.classList.remove('invisible');
    const box = wrapperElement.getBoundingClientRect();
    optionsMenuElement.style.top = (box.y - 200) + 'px';
    optionsMenuElement.style.left = wrapperElement.offsetLeft + wrapperElement.offsetWidth + 'px';
  }

  toggleOptionsMenu(e) {
    e.stopPropagation();
    const element = e.target;
    const accountId = this.getAccountId(element);
    const isShared = element.id.includes('-shared');
    const optionsMenuId = `sidebar--account-item-options-menu${isShared ? '-shared' : ''}@${accountId}`;
    const optionsMenuElement = document.getElementById(optionsMenuId);
    if (optionsMenuElement) {
      this.closeAnyOtherMenu(optionsMenuElement);
      if (optionsMenuElement.classList.contains('invisible')) {
        const wrapper = document.getElementById(`sidebar--account-container${isShared ? '-shared' : ''}@${accountId}`);
        this.openOptionsMenu(wrapper, optionsMenuElement);
      } else {
        optionsMenuElement.classList.add('invisible');
      }
    }
  }

  openAccountsMenu() {
    this.accountsMenuTarget.classList.remove('invisible');
    document.addEventListener('click', this.closeAccountMenuIfClickOutside.bind(this), { capture: true });
  }

  closeAccountsMenu() {
    this.accountOptionsMenuTargets.forEach(t => t.classList.add('invisible'));
    this.accountsMenuTarget.classList.add('invisible');
  }

  closeAccountMenuIfClickOutside(e) {
    const clickTarget = e.target;
    const menuElement = document.getElementById('sidebar--accounts-container-default');
    if(menuElement && !menuElement.classList.contains('invisible') && !menuElement.contains(clickTarget)) {
      this.closeAccountsMenu();
    }
  }

  toggleAccountsMenu(e) {
    if (this.accountsMenuTarget.classList.contains('invisible')) {
      this.openAccountsMenu();
    } else {
      this.closeAccountsMenu();
    }
  }

  closeMenuIfClickOutside(e) {
    const clickTarget = e.target;
    const menuElement = document.getElementById('sidebar--open-search-panel');
    if(menuElement && !menuElement.classList.contains('invisible') && !menuElement.contains(clickTarget)) {
      this.closeSearchIfOpen();
      document.removeEventListener('click', this.closeMenuIfClickOutside.bind(this));
    }
  }

  handleToggleSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    if(this.isNarrow) return;
    document.addEventListener('click', this.closeMenuIfClickOutside.bind(this), { capture: true });
    if(this.hasAccountsMenuTarget) this.closeAccountsMenu();
    if(this.hasAccountsFilterTarget) this.closeAccountsFilter();
    this.defaultSidebarTarget.classList.add('default-closing');
    this.sidebarItemTargets.forEach(t => t.classList.add('closing'));
    this.searchSidebarTarget.classList.remove('invisible');
    this.searchPanelTarget.classList.add('opening');
    setTimeout(() => {
      this.defaultSidebarTarget.classList.remove('default-closing');
      this.defaultSidebarTarget.classList.add('invisible');
    }, 250);
    setTimeout(() => {
      this.searchPanelTarget.classList.remove('opening');
    }, 500);
    this.isNarrow = true;
  }

  closeSearchIfOpen() {
    if(!this.isNarrow) return;
    this.resetPanel();
    this.searchPanelTarget.classList.add('closing');
    setTimeout(() => {
      this.defaultSidebarTarget.classList.add('default-opening');
      this.defaultSidebarTarget.classList.remove('invisible');
    }, 50);
    setTimeout(() => {
      this.searchPanelTarget.classList.remove('closing');
      this.searchSidebarTarget.classList.add('invisible');
    }, 300);
    setTimeout(() => {
      this.defaultSidebarTarget.classList.remove('default-opening');
    }, 450);
    this.isNarrow = false;
  }

  resetPanel() {
    if (this.hasSearchInputTarget) {
      this.searchInputTarget.value = '';
      emitCustomEvent('debouncedSearch');
      this.closeAccountsFilter();
    }
  }

  toggleClear() {
    if (this.hasSearchInputTarget && this.searchInputTarget.value.length > 0) {
      this.showClear();
    } else {
      this.hideClear();
    }
  }

  showClear() {
    this.clearInputTarget.classList.remove('invisible');
  }

  hideClear() {
    this.clearInputTarget.classList.add('invisible');
  }

  clearInput() {
    this.searchInputTarget.value = '';
    this.searchInputTarget.focus();
    emitCustomEvent('debouncedSearch');
    this.hideClear();
  }

  toggleAccountsFilter() {
    this.accountsFilterTarget.classList.toggle('invisible');
    document.addEventListener('click', this.closeAccountsFilterIfClickOutside.bind(this), { capture: true });
  }

  closeAccountsFilter() {
    this.accountsFilterTarget.classList.add('invisible');
    document.removeEventListener('click', this.closeAccountsFilterIfClickOutside.bind(this));
  }

  closeAccountsFilterIfClickOutside(e) {
    const clickTarget = e.target;
    if (this.hasAccountsFilterTarget && !this.accountsFilterTarget.classList.contains('invisible') && !this.accountsFilterTarget.contains(clickTarget)) {
      this.closeAccountsFilter();
    }
  }

  selectAccountFilter(e) {
    const selectedAccountName = e.detail.accountName;
    if(selectedAccountName !== 'All accounts') {
      this.allAccountsIconImageTarget.classList.add('invisible');
      if (this.accountFilterContainerTarget.childElementCount == 3) this.accountFilterContainerTarget.removeChild(this.accountFilterContainerTarget.firstChild);
      const div = document.createElement('div');
      const newSpan = `<div class="sidebar--account-filter-letter sidebar-item--text-static">${selectedAccountName[0].toUpperCase()}</div>`
      div.innerHTML = newSpan.trim();
      const newItem = div.firstChild;
      this.accountFilterContainerTarget.prepend(newItem);
    } else {
      this.allAccountsIconImageTarget.classList.remove('invisible');
      if (this.accountFilterContainerTarget.childElementCount == 3) this.accountFilterContainerTarget.removeChild(this.accountFilterContainerTarget.firstChild);
    }
    this.closeAccountsFilter();
  }
}
