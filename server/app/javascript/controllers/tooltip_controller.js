import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  connect(){}

  showAccountsTooltip(e) {
    const targetTooltip = document.getElementById(e.target.dataset.tooltipId);
    if (targetTooltip) targetTooltip.classList.remove("invisible");
  }

  hideAccountsTooltip(e) {
    const targetTooltip = document.getElementById(e.target.dataset.tooltipId);
    if (targetTooltip) targetTooltip.classList.add("invisible");
  }

}