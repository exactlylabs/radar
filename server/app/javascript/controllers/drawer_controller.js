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
    if(this.accountsMenuButtonTarget.classList.contains('accounts-collapse-open')) {
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

  selectAccount(e) {
    const selectedAccountId = e.target.id.split('@')[1];
    const cookieArray = document.cookie.split(';');
    let currentAccount;
    cookieArray.forEach(cookie => {
      if(cookie.trim().includes('radar_current_account_id')) {
        currentAccount = cookie.split('=')[1];
      }
    });
    if(currentAccount && currentAccount === selectedAccountId) return;
    document.cookie = `radar_current_account_id=${selectedAccountId}`;
    window.location.reload();
  }
}
