import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
  }

  hideModal() {
    $(this.element).modal('hide');
  }

  showModal() {
    $(this.element).modal('show');
  }

  /**
   * This method is strictly for redirecting to home
   * after account deletion, which had to be handled this
   * way because of the request being triggered from a turbo
   * frame, and not being able to redirect from actual controller.
   * @param e: FormSubmission event
   */
  redirectHomeOnSuccess(e) {
    if(e.detail.success) {
      window.location.href = "/dashboard";
    }
  }

  clearTurboReferences(elementToClearId) {
    const turboFrame = document.getElementById(elementToClearId);
    if (turboFrame) {
      turboFrame.innerHTML = null;
    }
  }

  submit(e) {
    const search = e.detail.formSubmission.fetchRequest.url.search;
    const shouldKeepModal = search.includes('keep_in_view');
    if (e.detail.success && !shouldKeepModal) {
      this.hideModal();
    }
    const possibleTurboFrameToClear = this.element.getAttribute('data-clear-turbo-id');
    if (!!possibleTurboFrameToClear) this.clearTurboReferences(possibleTurboFrameToClear);
  }
}
