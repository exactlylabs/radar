import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  
  connect(){
    this.spinner = `<div class="spinner-border spinner-border-sm text-light m-auto" role="status"></div>`;
    this.baseContent = this.element.cloneNode(true);
    this.baseWidth = this.element.offsetWidth;
    this.baseHeight = this.element.offsetHeight;
    this.isLoading = false;
  }
  
  replaceContent(e) {
    if(this.isLoading) {
      this.element.innerHTML = this.baseContent.innerHTML;
      this.element.classList.remove('custom-button--disabled');
    } else {
      this.element.classList.add('custom-button--disabled');
      this.element.innerHTML = this.spinner;
      this.element.style.minWidth = `${this.baseWidth}px`;
      this.element.style.minHeight = `${this.baseHeight}px`;
    }
    this.isLoading = !this.isLoading;
  }
}