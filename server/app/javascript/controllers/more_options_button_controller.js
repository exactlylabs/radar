import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  connect() {
    this.currentMenuOpen = null;
  }

  toggleMenu(e) {
    const menuPrefix = 'more-options-menu-';
    const buttonPrefix = 'options-button-';
    const buttonId = e.currentTarget.id;
    const rowIndex = buttonId.split(buttonPrefix)[1];
    const menuId = menuPrefix + rowIndex;
    const menu = document.getElementById(menuId);
    if(menu.id === this.currentMenuOpen?.id) {
      this.closeMenu(menu);
    } else {
      this.openMenu(menu);
    }
  }

  openMenu(menuElement) {
    this.currentMenuOpen = menuElement;
    menuElement.classList.remove('invisible');
    document.addEventListener('click', this.checkClickOutsideMenu.bind(this), { capture: true });
  }

  checkClickOutsideMenu(e) {
    if(!this.currentMenuOpen) {
      document.removeEventListener('click', this.checkClickOutsideMenu.bind(this));
      return;
    }
    this.closeMenu(this.currentMenuOpen);
  }

  closeMenu(menuElement) {
    menuElement.classList.add('invisible');
    //document.removeEventListener('click', this.checkClickOutsideMenu.bind(this));
    this.currentMenuOpen = null;
  }

}