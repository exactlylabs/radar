import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["menuIcon"];

  connect() {
    KTMenu.createInstances();
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
    if (currentAccount && currentAccount === selectedAccountId) return;
    const token = document.getElementsByName("csrf-token")[0].content;
    fetch(`/accounts/switch?id=${selectedAccountId}`, {
      method: "POST",
      headers: { "X-CSRF-Token": token },
    }).then((res) => {
      if (res.ok) {
        window.location.reload();
      } else {
        // TODO: add Sentry logging once integrated
        console.error(res);
      }
    });
  }

  showMoreOptionsIcon(e) {
    const accountId = e.target.id.split("@")[1];
    const menuIcon = this.getSpecificIcon(accountId);
    menuIcon.style.display = "block";
  }

  hideMoreOptionsIcon(e) {
    const accountId = e.target.id.split("@")[1];
    const menuIcon = this.getSpecificIcon(accountId);
    menuIcon.style.display = "none";
    menuIcon.classList.remove("selected");
  }

  getSpecificIcon(id) {
    return this.menuIconTargets.find(
      (target) => target.id === `sidebar--menu-icon@${id}`
    );
  }

  setMenuIconAsSelected(e) {
    const accountId = e.target.id.split("@")[1];
    const menuIcon = this.getSpecificIcon(accountId);
    menuIcon.classList.add("selected");
  }
}
