import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  static targets = ["accountsMenuButton", "downAngle", "rightAngle", "smallDivider", "fullSizeDivider"];

  connect() {
    this.drawer = new KTDrawer(this.element);
  }

  handleMouseEnter() {
    this.smallDividerTarget.style.display = 'none';
    this.fullSizeDividerTarget.style.display = 'block';
  }

  handleMouseLeave() {
    if(this.hasAccountsMenuButtonTarget &&
      this.accountsMenuButtonTarget.classList.contains('accounts-collapse-open')) {
      this.accountsMenuButtonTarget.click();
    }
    this.smallDividerTarget.style.display = 'block';
    this.fullSizeDividerTarget.style.display = 'none';
  }

  toggleMenu() {
    this.accountsMenuButtonTarget.classList.toggle('accounts-collapse-open');
    if(this.accountsMenuButtonTarget.classList.contains('accounts-collapse-open')) {
      this.downAngleTarget.style.display = 'block';
      this.rightAngleTarget.style.display = 'none';
    } else {
      this.downAngleTarget.style.display = 'none';
      this.rightAngleTarget.style.display = 'block';
    }
  }
}
