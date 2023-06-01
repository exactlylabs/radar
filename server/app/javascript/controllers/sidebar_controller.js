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
    'searchInput'
  ]

  connect() {
    this.isNarrow = false;
  }

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
  }

  closeProfileMenu() {
    this.profileMenuToggleTarget.setAttribute('data-menu-state', 'closed');
    this.profileMenuToggleTarget.classList.remove('sidebar--profile-menu-toggle-open');
    this.profileDataPopoverTarget.classList.add('invisible');
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
    optionsMenuElement.style.top = (box.y - 185) + 'px';
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
  }

  closeAccountsMenu() {
    this.accountOptionsMenuTargets.forEach(t => t.classList.add('invisible'));
    this.accountsMenuTarget.classList.add('invisible');
  }

  toggleAccountsMenu(e) {
    if (this.accountsMenuTarget.classList.contains('invisible')) {
      this.openAccountsMenu();
    } else {
      this.closeAccountsMenu();
    }
  }

  handleToggleSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    if(this.isNarrow) {
      this.defaultSidebarTarget.classList.remove('invisible');
      this.searchSidebarTarget.classList.add('invisible');
    } else {
      if(this.hasAccountsMenuTarget) this.closeAccountsMenu();
      this.defaultSidebarTarget.classList.add('invisible');
      this.searchSidebarTarget.classList.remove('invisible');
    }
    this.isNarrow = !this.isNarrow;
  }

  closeSearchIfOpen() {
    if(!this.isNarrow) return;
    this.resetPanel();
    this.defaultSidebarTarget.classList.remove('invisible');
    this.searchSidebarTarget.classList.add('invisible');
    this.isNarrow = false;
  }

  resetPanel() {
    if (this.hasSearchInputTarget) {
      this.searchInputTarget.value = '';
      emitCustomEvent('debouncedSearch');
    }
  }
}