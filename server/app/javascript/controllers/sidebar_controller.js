import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  static targets = [
    'profileMenuToggle',
    'profileMenuOption',
    'profileMenuContainer'
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
    this.profileMenuContainerTarget.style.height = '9rem';
    this.profileMenuToggleTarget.setAttribute('data-menu-state', 'open');
    this.profileMenuToggleTarget.classList.add('sidebar--profile-menu-toggle-open');
    const caret = document.getElementById('sidebar--profile-menu-caret');
    caret.style.transform = 'rotate(180deg)';
    this.profileMenuOptionTargets.forEach(o => o.classList.remove('invisible'))
  }

  closeProfileMenu() {
    this.profileMenuContainerTarget.style.height = '3rem';
    this.profileMenuToggleTarget.setAttribute('data-menu-state', 'closed');
    this.profileMenuToggleTarget.classList.remove('sidebar--profile-menu-toggle-open');
    const caret = document.getElementById('sidebar--profile-menu-caret');
    caret.style.transform = 'none';
    this.profileMenuOptionTargets.forEach(o => o.classList.add('invisible'))
  }

  toggleProfileMenu() {
    const currentState = this.profileMenuToggleTarget.getAttribute('data-menu-state');
    if(currentState === 'closed') this.openProfileMenu();
    else this.closeProfileMenu();
  }
}