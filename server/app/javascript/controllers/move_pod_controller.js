import {Controller} from "@hotwired/stimulus";
import handleError from './error_handler_controller';

export default class extends Controller {

  static targets = [
    "podSelectContainer",
    "searchInput",
    "emptyPodSelectedMessage",
    "podSelectedMessage",
    "podSelectedMessageText",
    "podIdHiddenInput",
    "podSelectOption",
    "warningBanner",
    "continueButton"
  ];

  connect() {
    this.token = document.querySelector('meta[name="csrf-token"]').content;
    this.currentAccountName = this.element.getAttribute("data-current-account-name");
  }

  toggleSelect(e) {
    const target = e.target;
    if (target.dataset.open === undefined || target.dataset.open === null) return;
    if (this.podSelectContainerTarget.hasAttribute('hidden')) {
      this.podSelectContainerTarget.removeAttribute('hidden');
    } else {
      this.podSelectContainerTarget.setAttribute('hidden', 'hidden');
    }
  }

  search(e) {
    e.preventDefault();
    const query = e.target.value;
    if (!query || query === '') {
      this.podSelectOptionTargets.forEach(option => {
        option.removeAttribute('hidden', 'hidden');
      });
    } else {
      this.podSelectOptionTargets.forEach(option => {
        const optionId = option.dataset.podId;
        if (optionId.includes(query)) {
          option.removeAttribute('hidden', 'hidden');
        } else {
          option.setAttribute('hidden', 'hidden');
        }
      });
    }
  }

  selectPod(e) {
    const podId = e.target.dataset.podId;
    const accountName = e.target.dataset.podAccount;
    const networkName = e.target.dataset.podLocation;
    this.podIdHiddenInputTarget.value = podId;
    this.podSelectedMessageTarget.removeAttribute('hidden');
    this.podSelectedMessageTextTarget.innerText = podId;
    this.emptyPodSelectedMessageTarget.setAttribute('hidden', 'hidden');
    this.podSelectContainerTarget.setAttribute('hidden', 'hidden');
    if (this.hasWarningBannerTarget) {
      this.displayWarningBanner(accountName, networkName);
    }

  }

  displayWarningBanner(accountName, networkName) {
    let moveTo = `${accountName}`
    if (!!networkName) {
      moveTo = `${accountName} (${networkName})`
    }
    console.log(moveTo)
    this.warningBannerTarget.innerText = `This pod currently belongs to ${moveTo}. If you continue, it will be moved to ${this.currentAccountName}.`
    this.warningBannerTarget.removeAttribute('hidden');
  }
}