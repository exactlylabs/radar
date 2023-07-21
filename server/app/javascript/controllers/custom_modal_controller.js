import { Controller } from "@hotwired/stimulus";
import { emitCustomEvent } from '../eventsEmitter';
import { AlertTypes } from "../alerts";

const ModalTypes = {
  HEADLESS: 'headless',
  FULL: 'full'
}

export default class extends Controller {
  
  connect() {
    this.modalType = this.element.getAttribute('data-modal-type');
    this.modalElement = document.getElementById(this.getModalId());
    window.addEventListener('keydown', this.listenForEscapeKey.bind(this));
    setTimeout(() => {
      this.modalElement.classList.remove('opening');
    }, 800);
  }

  listenForEscapeKey(e) {
    if(e.key === 'Escape') {
      this.closeModal();
      window.removeEventListener('keydown', this.listenForEscapeKey.bind(this));
    }
  }

  getModalId() {
    switch(this.modalType) {
      case ModalTypes.HEADLESS:
        return 'headless-modal';
      case ModalTypes.FULL:
      default:
        return 'full-modal';
    }
  }

  closeModal() {
    this.modalElement.classList.add('closing');
    setTimeout(() => {
      this.modalElement.classList.remove('closing');
      this.element.classList.add('invisible');
    }, 250)
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

    const possibleTurboFrameToClear = this.element.getAttribute('data-clear-turbo-id');
    if (!!possibleTurboFrameToClear && !shouldKeepModal) this.clearTurboReferences(possibleTurboFrameToClear);

    if (e.detail.success && !shouldKeepModal) {
      this.closeModal();
    } else if(!e.detail.success) {
      const { statusText } = e.detail.fetchResponse.response;
      emitCustomEvent('renderAlert', {
        detail: {
          message: statusText,
          type: AlertTypes.ERROR
        }
      });
    }
  }
}
