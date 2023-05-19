import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "accountsMenuButton",
    "downAngle",
    "rightAngle",
    "smallDivider",
    "fullSizeDivider",
    "accountsCollapse",
  ];

  handleMouseEnter() {
    this.smallDividerTarget.style.display = "none";
    this.fullSizeDividerTarget.style.display = "block";
  }

  toggleMenu() {
    const accountsButtonClassList = this.accountsMenuButtonTarget.classList;
    if (accountsButtonClassList.contains("accounts-collapse-open")) {
      accountsButtonClassList.remove("accounts-collapse-open");
      this.downAngleTarget.style.display = "none";
      this.rightAngleTarget.style.display = "block";
    } else {
      accountsButtonClassList.add("accounts-collapse-open");
      this.downAngleTarget.style.display = "block";
      this.rightAngleTarget.style.display = "none";
    }
  }

  closeMenu() {
    this.accountsMenuButtonTarget.classList.remove("accounts-collapse-open");
    this.downAngleTarget.style.display = "none";
    this.rightAngleTarget.style.display = "block";
    this.accountsCollapseTarget.classList.remove("show");
    this.smallDividerTarget.style.display = "block";
    this.fullSizeDividerTarget.style.display = "none";
  }
}
