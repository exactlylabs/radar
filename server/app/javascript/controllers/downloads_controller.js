import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [
    "progressCard",
    "progressCardBar",
    "downloadCompleteCard",
    "downloadErrorCard"
  ]
  
  connect(){
    this.timeoutId = null;
  }

  disconnect() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  showProgressCard(e) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    const { progress } = e.detail;
    // signal for error
    if(progress < 0) {
      this.progressCardTarget.classList.add("invisible");
      this.downloadErrorCardTarget.classList.remove("invisible");
      setTimeout(() => {
        this.downloadErrorCardTarget.classList.add("closing");
        setTimeout(() => {
          this.downloadErrorCardTarget.classList.add("invisible");
        }, 300);
      }, 3000);

    } else if(progress === 100) {
      this.progressCardTarget.classList.add("invisible");
      this.downloadCompleteCardTarget.classList.remove("invisible");
      setTimeout(() => {
        this.downloadCompleteCardTarget.classList.add("closing");
        setTimeout(() => {
          this.downloadCompleteCardTarget.classList.add("invisible");
        }, 300);
      }, 3000);
    } else {
      if (this.progressCardTarget.classList.contains("invisible")) {
        this.progressCardTarget.classList.remove("invisible");
        this.progressCardTarget.classList.add("opening");
        setTimeout(() => {
          this.progressCardTarget.classList.remove("opening");
        }, 500);
      }
      this.progressCardBarTarget.style.width = `${e.detail.progress}%`;
      this.timeoutId = setTimeout(() => {
        this.progressCardBarTarget.classList.add("closing");
        setTimeout(() => {
          this.progressCardTarget.classList.add("invisible");
        }, 500);
      }, 3000);
    }
  }
}