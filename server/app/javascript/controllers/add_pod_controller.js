import { Controller } from "@hotwired/stimulus";

const POD_ID_LENGTH = 12;
const POD_SECRET_LENGTH = 11;

export default class extends Controller {
  static targets = ['create-pod-modal', 'podIdInput', 'podSecretInput', 'podSecretModalBody'];

  connect() {}

  getDesiredLength(className) {
    return className === 'podIdInput' ? POD_ID_LENGTH : POD_SECRET_LENGTH;
  }

  getButtonId(className) {
    return className === 'podIdInput' ? 'nextButton' : 'finalButton';
  }

  async insertFromPaste(e) {
    const data = await e.clipboardData.getData('text');
    const className = e.srcElement.className;
    const inputs = document.querySelectorAll(`.${className}`);
    let i;
    // checking for both lengths just in case data is wrong and has more characters than possible inputs
    for(i = 0 ; i < data.length && i < inputs.length ; i++) {
      inputs[i].value = data[i];
    }
    inputs[i - 1].focus();
    this.toggleButtonState(className);
    return;
  }

  checkBackspace(e) {
    const element = e.srcElement;
    if(e.key === 'Backspace' && element.value.length === 0) {
      element.previousElementSibling && element.previousElementSibling.focus();
      return;
    }
  }

  switchInput(e) {
    if(e.inputType === 'deleteContentBackward' || e.inputType === 'insertFromPaste') return;
    if(e.type === 'paste') return this.insertFromPaste(e);
    const element = e.srcElement;
    if (e.data.length == element.maxLength) {
      element.nextElementSibling && element.nextElementSibling.focus();
    }
    const desiredLength = this.getDesiredLength(element.className);
    const buttonId = this.getButtonId(element.className);
    this.toggleButtonState(element.className, buttonId, desiredLength);
  }

  isComplete(className) {
    const inputs = document.getElementsByClassName(className);
    let count = 0;
    inputs.forEach(input => {
      if(input.value !== '') count++;
    });
    return count === this.getDesiredLength(className);
  }

  toggleButtonState(className) {
    const buttonId = this.getButtonId(className);
    const desiredLength = this.getDesiredLength(className);
    const nextButtonClassList = document.querySelector(`#${buttonId}`).classList;
    if(this.isComplete(className)) {
      className !== 'podIdInput' && this.fillHiddenInput(className);
      nextButtonClassList.remove('disabled');
    } else {
      nextButtonClassList.add('disabled');
    }
  }

  savePodIdAndContinue() {
    /*
    if(this.hasPodIdInputTarget) {
      console.log('has');
    } else {
      console.log('does not have')
    }*/ // DIDNT WORK WITH TARGETS
    document.querySelector('#podSecretModalBody').style.display = 'block';
    document.querySelector('#podSecretModalFooter').style.display = 'flex';
    document.querySelector('#podIdModalBody').style.display = 'none';
    document.querySelector('#podIdModalFooter').style.display = 'none';
    document.querySelector('.podSecretInput').focus();
    this.fillHiddenInput('podIdInput');
    document.querySelector('#podId').innerText = document.querySelector('#id').value;
  }

  fillHiddenInput(className) {
    const inputs = document.getElementsByClassName(className);
    let value = '';
    inputs.forEach(input => value += input.value);
    document.querySelector(className === 'podIdInput' ? '#id' : '#secret').value = value;
  }

  hideModal() {
    $(this.element).modal('hide');
  }

  submit(e) {
    const postPath = e.srcElement.attributes[0].nodeValue;
    if (e.detail.success ) {
      if (postPath === '/clients/check_claim')
        this.gotoLocationModal();
      else
        this.hideModal();
    }
  }

  restart() {
    document.querySelector('#podIdModalBody').style.display = 'block';
    document.querySelector('#podIdModalFooter').style.display = 'flex';
    document.querySelector('#podErrorModalBody').style.display = 'none';
    document.querySelector('#podErrorModalFooter').style.display = 'none';
  }

  gotoLocationModal() {
    document.querySelector('#podLocationModalBody').style.display = 'block';
    document.querySelector('#podLocationModalFooter').style.display = 'flex';
    document.querySelector('#podSecretModalBody').style.display = 'none';
    document.querySelector('#podSecretModalFooter').style.display = 'none';
    document.querySelector('#clientIdInput').innerText = document.querySelector('#podId').innerText;
    document.querySelector('#id_final').value = document.querySelector('#id').value;
    document.querySelector('#secret_final').value = document.querySelector('#secret').value;
  }

  handleSubmitStart(e) {
    this.hideModal();
    $('#add_pod_modal_wizard').modal('show');
    document.querySelector('#loading-container').classList.remove('d-none');
  }

  handleNewLocationFromClientModal(e) {
    if(e.detail.success) {
      document.querySelector('#loading-container').classList.add('d-none');
      document.querySelector('#location-created-snackbar').classList.remove('d-none');
    }
  }
}