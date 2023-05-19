import { Controller } from "@hotwired/stimulus"

// Connects to data-controller="staging-clients"
export default class extends Controller {
  static targets = [ "message" ]
  
  handleClipboardClick(e) {
    navigator.clipboard.writeText(e.params["value"]);
    this.messageTarget.classList.add("fade-out")
  }

  messageTargetConnected(obj) {
    obj.classList.add("clipboard-message")
    obj.onanimationend = function handleFadeOutFinished(e) {
      e.target.classList.remove("fade-out")
    }
  }
}
