import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";

export default class extends Controller {
  static targets = ["menuIcon", "allAccountsIcon"];

  connect() {
    KTMenu.createInstances();
  }

  selectAllAccounts(e) {
    // prevent <i> or <a> from switching account on click
    if (e.target.localName === "i" || e.target.localName === "a") {
      return false;
    }
    const cookieArray = document.cookie.split(";");
    let currentAccount;
    cookieArray.forEach((cookie) => {
      if (cookie.trim().includes("radar_current_account_id")) {
        currentAccount = cookie.split("=")[1];
      }
    });
    if (!currentAccount || currentAccount === -1) {
      window.location.href = "/dashboard";
    } else {
      const token = document.getElementsByName("csrf-token")[0].content;
      fetch(`/accounts/all_accounts`, {
        method: "POST",
        headers: { "X-CSRF-Token": token },
      }).then((res) => {
        if (res.ok) {
          window.location.href = "/dashboard";
        } else {
          handleError(res);
        }
      });
    }
  }

  selectAccount(e) {
    // prevent <i> or <a> from switching account on click
    if (e.target.localName === "i" || e.target.localName === "a") {
      return false;
    }
    const selectedAccountId = e.target.id.split("@")[1];
    const cookieArray = document.cookie.split(";");
    let currentAccount;
    cookieArray.forEach((cookie) => {
      if (cookie.trim().includes("radar_current_account_id")) {
        currentAccount = cookie.split("=")[1];
      }
    });
    if (currentAccount && currentAccount === selectedAccountId) {
      window.location.href = "/dashboard";
    } else {
      const token = document.getElementsByName("csrf-token")[0].content;
      fetch(`/accounts/switch?id=${selectedAccountId}`, {
        method: "POST",
        headers: { "X-CSRF-Token": token },
      }).then((res) => {
        if (res.ok) {
          window.location.href = "/dashboard";
        } else {
          handleError(res);
        }
      });
    }
  }

  showMoreOptionsIcon(e) {
    const accountId = e.target.id.split("@")[1];
    const menuIcon = this.getSpecificIcon(accountId);
    if(menuIcon) menuIcon.style.display = "block";
  }

  hideMoreOptionsIcon(e) {
    const accountId = e.target.id.split("@")[1];
    const menuIcon = this.getSpecificIcon(accountId);
    if(menuIcon) {
      menuIcon.style.display = "none";
      menuIcon.classList.remove("selected");
    }
  }

  getSpecificIcon(id) {
    return this.menuIconTargets.find(
      (target) => target.id === `sidebar--menu-icon@${id}`
    );
  }

  setMenuIconAsSelected(e) {
    const accountId = e.target.id.split("@")[1];
    const menuIcon = this.getSpecificIcon(accountId);
    if(menuIcon) menuIcon.classList.add("selected");
  }

  primaryAllAccounts() {
    this.allAccountsIconTarget.classList.remove('svg-icon-muted');
    this.allAccountsIconTarget.classList.add('svg-icon-primary');
  }

  primaryOffAllAccounts() {
    if(!this.allAccountsIconTarget.classList.contains('all-accounts--selected')) {
      this.allAccountsIconTarget.classList.remove('svg-icon-primary');
      this.allAccountsIconTarget.classList.add('svg-icon-muted');
    }
  }
}
