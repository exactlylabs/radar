import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  
  connect() {
    const menuId = this.element.getAttribute("data-menu-id");
    const menu = document.getElementById(menuId);
    if(menu) {
      this.positionedOutsideOfParent = false;
      this.menu = menu;
      // By cloning the menu and appending it straight into the body, we prevent any
      // weird issues where a parent of the menu has properties like transform from creating
      // a new coordinate system, breaking all absolute positioning.
      if(this.menu.dataset.appendToBody === 'true') {
        this.positionedOutsideOfParent = true;
        this.cloneMenuAndAppendToBody();
      }
    }
    const anchorId = this.element.getAttribute("data-anchor-id");
    const anchor = document.getElementById(anchorId);
    if(anchor) this.anchor = anchor;
    // Bind once so the same function reference can be removed again. `fn.bind(this)` returns a
    // new function every time, so removeEventListener with a fresh bind never matched and every
    // open leaked another capture-phase click listener on the document.
    this.boundCloseFiltersMenu = this.closeFiltersMenu.bind(this);
    this.boundCloseMenuIfClickedOutside = this.closeMenuIfClickedOutside.bind(this);
    window.addEventListener('resize', this.boundCloseFiltersMenu);
  }

  disconnect() {
    window.removeEventListener('resize', this.boundCloseFiltersMenu);
    document.removeEventListener("click", this.boundCloseMenuIfClickedOutside, { capture: true });
  }
  
  cloneMenuAndAppendToBody() {
    const clonedMenu = this.menu.cloneNode(true);
    clonedMenu.classList.add("invisible");
    clonedMenu.classList.add("filters-menu-clone");
    document.body.appendChild(clonedMenu);
    this.menu.remove();
    this.menu = clonedMenu;
  }

  toggleFiltersMenu(e) {
    if(this.element.dataset.isCalendarOpen === 'true') return;
    // Only a click on the toggle button opens/closes the menu; clicks inside the menu itself
    // (option rows, search inputs) must not toggle it. The button's children count as the
    // button: its label is usually a <span>/<svg> and its caret an <img>, so checking
    // `e.target.tagName === 'BUTTON'` ignored almost every real click on the label.
    if(e && !e.target.closest('button')) return;
    if(this.menu) {
      if (this.menu.classList.contains("invisible")) {
        this.openFiltersMenu();
      } else {
        this.closeFiltersMenu();
      }
    }
  }
  
  openCalendar(e) {
    e.preventDefault();
    e.stopPropagation();
    this.closeFiltersMenu();
    this.element.dataset.isCalendarOpen = 'true';
    const datePicker = document.getElementById(e.target.getAttribute('data-calendar-id'));
    datePicker.removeAttribute('hidden');
  }

  closeMenuIfClickedOutside(event) {
    if(!this.element.contains(event.target) && !this.menu.contains(event.target)) {
      document.removeEventListener("click", this.boundCloseMenuIfClickedOutside, { capture: true });
      this.closeFiltersMenu();
    }
  }

  openFiltersMenu() {
    if(this.positionedOutsideOfParent) this.positionMenuRelativeToAnchor();
    document.addEventListener("click", this.boundCloseMenuIfClickedOutside, { capture: true });
    this.menu.classList.remove("invisible");
    this.shiftHorizontallyIfMenuIsOffScreen();
    this.clipMenuIfOffScreenVertically();
  }

  closeFiltersMenu() {
    this.menu.classList.add("invisible");
  }
  
  shiftHorizontallyIfMenuIsOffScreen() {
    const menuRect = this.menu.getBoundingClientRect();
    const rightEdge = menuRect.right;
    const windowWidth = window.innerWidth;
    if(rightEdge > windowWidth) {
      this.menu.style.maxWidth = `${menuRect.width - (rightEdge - windowWidth)}px`;
    }
  }
  
  clipMenuIfOffScreenVertically() {
    const menuRect = this.menu.getBoundingClientRect();
    const bottomEdge = menuRect.bottom;
    const windowHeight = window.innerHeight;
    if(bottomEdge > windowHeight) {
      this.menu.style.maxHeight = `${menuRect.height - (bottomEdge - windowHeight)}px`;
    }
  }
  
  positionMenuRelativeToAnchor() {
    const anchorRect = this.anchor.getBoundingClientRect();
    this.menu.style.top = `calc(${anchorRect.bottom}px + .5rem)`;
    this.menu.style.left = `${anchorRect.left}px`;
    this.menu.style.minWidth = `${anchorRect.width}px`;
  }
}
