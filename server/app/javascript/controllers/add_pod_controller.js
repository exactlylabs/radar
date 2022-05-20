import { Controller } from "@hotwired/stimulus";

const POD_ID_LENGTH = 12;
const POD_SECRET_LENGTH = 11;

export default class extends Controller {
  static targets = ['create-pod-modal', 'podIdInput', 'podSecretInput', 'podSecretModalBody'];

  connect() {

  }

  switchInput(e) {
    const element = e.originalTarget;
    if (element.value.length == e.originalTarget.maxLength) {
      element.nextElementSibling && element.nextElementSibling.focus();
    }
    const desiredLength = element.className === 'podIdInput' ? POD_ID_LENGTH : POD_SECRET_LENGTH;
    const buttonId = element.className === 'podIdInput' ? 'nextButton' : 'finalButton';
    this.toggleButtonState(element.className, buttonId, desiredLength);
  }

  isComplete(className, desiredLength) {
    const inputs = document.getElementsByClassName(className);
    let count = 0;
    inputs.forEach(input => {
      if(input.value !== '') count++;
    });
    console.log(count, desiredLength);
    return count === desiredLength;
  }

  toggleButtonState(className, buttonId, desiredLength) {
    const nextButtonClassList = document.querySelector(`#${buttonId}`).classList;
    if(this.isComplete(className, desiredLength)) {
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
    const inputs = document.getElementsByClassName('podIdInput');
    let podId = '';
    inputs.forEach(input => podId += input.value);
    document.querySelector('#podSecretModalBody').style.display = 'block';
    document.querySelector('#podSecretModalFooter').style.display = 'flex';
    document.querySelector('#podIdModalBody').style.display = 'none';
    document.querySelector('#podIdModalFooter').style.display = 'none';
    document.querySelector('#podId').innerText = podId;
  }

  savePodSecretAndContinue() {
    const podId = document.querySelector('#podId').innerText;
    let podSecret = '';
    const inputs = document.getElementsByClassName('podSecretInput');
    inputs.forEach(input => podSecret += input.value);
    fetch('/clients/validate', {
      method: 'POST',
      body: {
        id: podId,
        secret: podSecret
      },
      headers: {
        'Content-type': 'application/json'
      }
    })
      .then(res => console.log('All ok!'))
      .catch(err => console.error('Error', err));
  }

}