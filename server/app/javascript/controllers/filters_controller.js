import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  
  connect() {
    const menuId = this.element.getAttribute("data-menu-id");
    const menu = document.getElementById(menuId);
    if(menu) this.menu = menu;
  }

  toggleFiltersMenu() {
    if(this.element.dataset.isCalendarOpen === 'true') return;
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
    if (this.menu && 
      !this.menu.classList.contains("invisible") &&
      !this.menu.contains(event.target)
    ) {
      document.removeEventListener("click", this.closeMenuIfClickedOutside.bind(this));
      this.closeFiltersMenu();
    }
  }

  openFiltersMenu() {
    this.menu.classList.remove("invisible");
    document.addEventListener("click", this.closeMenuIfClickedOutside.bind(this), { capture: true });
    this.shiftHorizontallyIfMenuIsOffScreen();
  }

  closeFiltersMenu() {
    this.menu.classList.add("invisible");
  }
  
  shiftHorizontallyIfMenuIsOffScreen() {
    const menuRect = this.menu.getBoundingClientRect();
    const rightEdge = menuRect.right;
    const windowWidth = window.innerWidth;
    if(rightEdge > windowWidth) {
      const shiftAmount = rightEdge - windowWidth + 10;
      this.menu.style.left = `${menuRect.left - shiftAmount}px`;
      this.menu.style.right = 'unset';
    }
    
    const leftEdge = menuRect.left;
    if(leftEdge < 0) {
      this.menu.style.left = '0';
      this.menu.style.right = 'unset';
    }
    
    const startingPixel = this.element.getBoundingClientRect().left;
    const menuWidth = this.menu.offsetWidth;
    const menuEndPixel = startingPixel + menuWidth;
    
    if(menuEndPixel > windowWidth) {
      this.menu.style.maxWidth = `${windowWidth - startingPixel}px`;
    }
  }
}
