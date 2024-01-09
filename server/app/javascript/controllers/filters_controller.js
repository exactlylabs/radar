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
    this.closeFiltersMenu();
    this.element.dataset.isCalendarOpen = 'true';
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
  }

  closeFiltersMenu() {
    this.menu.classList.add("invisible");
  }
}
