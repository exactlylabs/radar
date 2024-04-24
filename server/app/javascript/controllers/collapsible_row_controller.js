import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  
  handleClick() {
    this.element.dataset.isOpen = this.element.dataset.isOpen === 'true' ? 'false' : 'true';
  }
  
}