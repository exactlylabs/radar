import { Controller } from "@hotwired/stimulus";
import { emitCustomEvent } from "../eventsEmitter";

const SMALL_BREAKPOINT = 990;
const MID_BREAKPOINT = 1024;

export default class extends Controller {

  static targets = [
    'profileMenuToggle',
    'headerProfileMenuToggle',
    'profileDataPopover',
    'headerProfileDataPopover',
    'profileMenuContainer',
    'accountOptionsMenu',
    'accountsMenu',
    'defaultSidebar',
    'narrowSidebar',
    'searchSidebar',
    'searchInput',
    'clearInput',
    'accountsFilter',
    'accountFilterContainer',
    'allAccountsIconImage',
    'searchPanel',
    'sidebarItem',
    'underlay',
    'smallSidebarHeader'
  ]

  connect() {
    window.addEventListener('resize', this.handleResize.bind(this));
    this.isSmallScreen = window.innerWidth <= SMALL_BREAKPOINT;
    this.isMidScreen = window.innerWidth > SMALL_BREAKPOINT && window.innerWidth <= MID_BREAKPOINT;
    this.isBigScreen = !this.isSmallScreen && !this.isMidScreen;
    this.isSearchOpen = false;
    if(this.isSmallScreen) {
      this.defaultSidebarTarget.classList.add('invisible');
      this.profileMenuContainerTargets.forEach(e => e.classList.add('invisible'));
    } else if(this.isMidScreen) {
      this.defaultSidebarTarget.classList.add('invisible');
      this.searchSidebarTarget.classList.remove('invisible');
      this.narrowSidebarTarget.classList.remove('invisible');
      this.profileMenuContainerTargets.forEach(e => e.classList.remove('invisible'));
    } else {
      this.profileMenuContainerTargets.forEach(e => e.classList.remove('invisible'));
    }
  }

  handleResize() {
    const isPrevSmall = this.isSmallScreen;
    const isPrevMid = this.isMidScreen;
    const isPrevBig = this.isBigScreen;
    this.isSmallScreen = window.innerWidth <= SMALL_BREAKPOINT;
    this.isMidScreen = window.innerWidth > SMALL_BREAKPOINT && window.innerWidth <= MID_BREAKPOINT;
    this.isBigScreen = !this.isSmallScreen && !this.isMidScreen;
    
    // If the screen size didn't change, do nothing
    if(
      (isPrevSmall && this.isSmallScreen) || 
      (isPrevMid && this.isMidScreen) || 
      (isPrevBig && this.isBigScreen)) {
      return;
    }

    if(this.isSmallScreen) {
      this.isSearchOpen = false;
      this.defaultSidebarTarget.classList.add('invisible');
      this.profileMenuContainerTargets.forEach(e => e.classList.add('invisible'));
      this.narrowSidebarTarget.classList.add('invisible');
      this.searchSidebarTarget.classList.add('invisible');
    } else if (this.isMidScreen) {
      if(!this.isSearchOpen) {
        this.searchPanelTarget.classList.add('invisible');
      }
      this.searchSidebarTarget.classList.remove('invisible');
      this.narrowSidebarTarget.classList.remove('invisible');
      this.defaultSidebarTarget.classList.add('invisible');
      this.underlayTarget.classList.add('invisible');
      this.profileMenuContainerTargets.forEach(e => e.classList.remove('invisible'));
    } else {
      this.defaultSidebarTarget.classList.remove('invisible');
      this.searchSidebarTarget.classList.add('invisible');
      this.searchPanelTarget.classList.add('invisible');
      this.narrowSidebarTarget.classList.add('invisible');
      this.underlayTarget.classList.add('invisible');
      this.profileMenuContainerTargets.forEach(e => e.classList.remove('invisible'));
    }
  }

  openSmallSidebar() {
    this.underlayTarget.classList.remove('invisible');
    this.defaultSidebarTarget.classList.remove('invisible');
    this.defaultSidebarTarget.classList.add('default-opening');
    this.smallSidebarHeaderTarget.classList.add('default-opening');
    setTimeout(() => {
      this.defaultSidebarTarget.classList.remove('default-opening');
      this.smallSidebarHeaderTarget.classList.remove('default-opening');
    }, 450);
  }

  closeSmallSidebar() {
    this.defaultSidebarTarget.classList.add('default-closing');
    this.smallSidebarHeaderTarget.classList.add('default-closing');
    setTimeout(() => {
      this.underlayTarget.classList.add('invisible');
      this.defaultSidebarTarget.classList.add('invisible');
      this.defaultSidebarTarget.classList.remove('default-closing');
      this.smallSidebarHeaderTarget.classList.remove('default-closing');
    }, 300);
  }

  getItemElements(itemId) {
    const icon = document.getElementById(`${itemId}-icon`);
    const activeIcon = document.getElementById(`${itemId}-icon-active`);
    const text = document.getElementById(`${itemId}-text`);
    return {icon, activeIcon, text};
  }

  handleItemHover(e) {
    const element = e.target;
    const itemId = element.getAttribute('data-item-id');
    const { icon, activeIcon, text } = this.getItemElements(itemId);
    if (this.isMidScreen && !this.isSearchOpen) {
      const tooltipId = `${itemId}-tooltip`;
      const tooltip = document.getElementById(tooltipId);
      if (tooltip) {
        tooltip.classList.remove('invisible');
      }
    }

    if(element.href === location.href) return;

    element.classList.add('sidebar--item-active');
    
    
    icon.classList.add('invisible');
    activeIcon.classList.remove('invisible');
    text.classList.add('sidebar-item--text-active');
  }

  handleItemHoverOff(e) {
    const element = e.target;
    const itemId = element.getAttribute('data-item-id');
    const { icon, activeIcon, text } = this.getItemElements(itemId);
    if (this.isMidScreen) {
      const tooltipId = `${itemId}-tooltip`;
      const tooltip = document.getElementById(tooltipId);
      if (tooltip) {
        tooltip.classList.add('invisible');
      }
    }

    if (element.href === location.href) return;
    
    element.classList.remove('sidebar--item-active');
    
    icon.classList.remove('invisible');
    activeIcon.classList.add('invisible');
    text.classList.remove('sidebar-item--text-active');
  }

  handleAccountsItemHover(e) {
    if(!this.isMidScreen || this.isSearchOpen) return;
    const tooltip = document.getElementById('accounts-tooltip');
    if (tooltip) {
      tooltip.classList.remove('invisible');
    }
  }

  handleAccountsItemBlur(e) {
    if(!this.isMidScreen) return;
    const tooltip = document.getElementById('accounts-tooltip');
    if (tooltip) {
      tooltip.classList.add('invisible');
    }
  }

  openProfileMenu() {
    if(this.isMidScreen) {
      this.defaultSidebarTarget.classList.remove('invisible');
      this.narrowSidebarTarget.classList.add('invisible');
    }
    this.profileMenuToggleTarget.setAttribute('data-menu-state', 'open');
    this.profileMenuToggleTarget.classList.add('sidebar--profile-menu-toggle-open');
    this.profileDataPopoverTarget.classList.remove('invisible');
    document.addEventListener('click', this.closeProfileMenuOnClick.bind(this), {capture: true});
  }

  closeProfileMenu() {
    this.profileMenuToggleTarget.setAttribute('data-menu-state', 'closed');
    this.profileMenuToggleTarget.classList.remove('sidebar--profile-menu-toggle-open');
    this.profileDataPopoverTarget.classList.add('invisible');
    if (this.isMidScreen) {
      this.narrowSidebarTarget.classList.remove('invisible');
      this.defaultSidebarTarget.classList.add('invisible');
    }
  }

  closeProfileMenuOnClick(e) {
    const clickTarget = e.target;
    const popoverElement = document.getElementById('sidebar--profile-popover-regular');
    if(popoverElement && !popoverElement.classList.contains('invisible') && !popoverElement.contains(clickTarget)) {
      this.closeProfileMenu();
    }
  }

  closeHeaderProfileMenuOnClick(e) {
    const clickTarget = e.target;
    const popoverElement = document.getElementById('sidebar--profile-popover-header');
    if (popoverElement && !popoverElement.classList.contains('invisible') && !popoverElement.contains(clickTarget)) {
      this.closeHeaderProfileMenu();
    }
  }

  openHeaderProfileMenu() {
    this.headerProfileMenuToggleTarget.setAttribute('data-menu-state', 'open');
    this.headerProfileMenuToggleTarget.classList.add('sidebar--profile-menu-toggle-open');
    this.headerProfileDataPopoverTarget.classList.remove('invisible');
    document.addEventListener('click', this.closeHeaderProfileMenuOnClick.bind(this), { capture: true });
  }

  closeHeaderProfileMenu() {
    this.headerProfileMenuToggleTarget.setAttribute('data-menu-state', 'closed');
    this.headerProfileMenuToggleTarget.classList.remove('sidebar--profile-menu-toggle-open');
    this.headerProfileDataPopoverTarget.classList.add('invisible');
  }

  toggleHeaderProfileMenu(e) {
    const currentState = this.headerProfileMenuToggleTarget.getAttribute('data-menu-state');
    if(currentState === 'closed') this.openHeaderProfileMenu();
    else this.closeHeaderProfileMenu();
  }

  toggleProfileMenu(e) {
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
    if (this.isMidScreen) {
      this.narrowSidebarTarget.classList.add('invisible');
      this.defaultSidebarTarget.classList.remove('invisible');
    }
    document.addEventListener('click', this.closeAccountMenuIfClickOutside.bind(this), { capture: true });
  }

  closeAccountsMenu() {
    this.accountOptionsMenuTargets.forEach(t => t.classList.add('invisible'));
    this.accountsMenuTarget.classList.add('invisible');
    if (this.isMidScreen) {
      this.narrowSidebarTarget.classList.remove('invisible');
      this.defaultSidebarTarget.classList.add('invisible');
    }
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
    if(this.isSmallScreen) return;
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
    if(this.isSearchOpen) {
      this.closeSearchIfOpen();
    } else {
      this.openSearch();
    }
    this.isSearchOpen = !this.isSearchOpen;
  }

  openSearch() {
    if(this.isSearchOpen) return;
    if(this.isMidScreen) document.getElementById('search-tooltip').classList.add('invisible');
    document.addEventListener('click', this.closeMenuIfClickOutside.bind(this), { capture: true });
    if (this.hasAccountsMenuTarget) this.closeAccountsMenu();
    if (this.hasAccountsFilterTarget) this.closeAccountsFilter();
    if (this.isBigScreen) {
      this.defaultSidebarTarget.classList.add('default-closing');
    } else if (this.isSmallScreen) {
      this.defaultSidebarTarget.classList.add('invisible');
      this.narrowSidebarTarget.classList.add('invisible');
    }
    this.sidebarItemTargets.forEach(t => t.classList.add('closing'));
    this.searchSidebarTarget.classList.remove('invisible');
    this.searchPanelTarget.classList.remove('invisible');
    this.searchPanelTarget.classList.add('opening');
    setTimeout(() => {
      if (!this.isMidScreen) {
        this.defaultSidebarTarget.classList.remove('default-closing');
        this.defaultSidebarTarget.classList.add('invisible');
      }
      if(this.isBigScreen) this.narrowSidebarTarget.classList.remove('invisible');
    }, 250);
    setTimeout(() => {
      this.searchPanelTarget.classList.remove('opening');
    }, 500);
  }

  toggleSearchOnly() {
    const isSearchPanelClosed = this.searchPanelTarget.classList.contains('invisible');
    if(isSearchPanelClosed) this.openSearchOnly();
    else this.closeSearchOnly();
  }

  openSearchOnly() {
    this.searchPanelTarget.classList.remove('invisible');
    this.searchPanelTarget.classList.add('opening');
    setTimeout(() => {
      this.searchPanelTarget.classList.remove('opening');
    }, 500);
  }

  closeSearchOnly() {
    this.searchPanelTarget.classList.add('closing');
    setTimeout(() => {
      this.searchPanelTarget.classList.remove('closing');
      this.searchPanelTarget.classList.add('invisible');
    }, 300);
  }

  toggleSearchOnly() {
    const isSearchPanelClosed = this.searchPanelTarget.classList.contains('invisible');
    if(isSearchPanelClosed) this.openSearchOnly();
    else this.closeSearchOnly();
  }

  openSearchOnly() {
    this.searchPanelTarget.classList.remove('invisible');
    this.searchPanelTarget.classList.add('opening');
    setTimeout(() => {
      this.searchPanelTarget.classList.remove('opening');
    }, 500);
  }

  closeSearchOnly() {
    this.searchPanelTarget.classList.add('closing');
    setTimeout(() => {
      this.searchPanelTarget.classList.remove('closing');
      this.searchPanelTarget.classList.add('invisible');
    }, 300);
  }

  closeSearchIfOpen() {
    if(!this.isSearchOpen) return;
    this.resetPanel();    
    this.searchPanelTarget.classList.add('closing');
    if(!this.isMidScreen) {
      setTimeout(() => {
        this.defaultSidebarTarget.classList.add('default-opening');
        this.defaultSidebarTarget.classList.remove('invisible');
      }, 50);
      setTimeout(() => {
        this.defaultSidebarTarget.classList.remove('default-opening');
      }, 450);
    }
    setTimeout(() => {
      this.searchPanelTarget.classList.remove('closing');
      this.searchPanelTarget.classList.add('invisible');
      if(!this.isMidScreen) this.searchSidebarTarget.classList.add('invisible');
    }, 300);
  }

  closeFullSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    if(!this.isSearchOpen) {
      this.closeSmallSidebar();
      return;
    }
    this.resetPanel();
    this.isSearchOpen = !this.isSearchOpen;
    this.searchPanelTarget.classList.add('closing');
    setTimeout(() => {
      this.searchPanelTarget.classList.remove('closing');
      this.searchPanelTarget.classList.add('invisible');
      this.underlayTarget.classList.add('invisible');
    }, 300);
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
