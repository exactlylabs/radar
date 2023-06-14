import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ['banner'];
  
  connect() {}

  closeBanner() {
    if(this.hasBannerTarget) {
      this.bannerTarget.classList.add('invisible');
    }
  }
}