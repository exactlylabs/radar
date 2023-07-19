import { Controller } from "@hotwired/stimulus";
import { emitCustomEvent } from "../eventsEmitter";
import { AlertTypes } from "./alert_controller";

export default class extends Controller {
  connect() {
    window.addEventListener('keydown', this.handleKeydown.bind(this));
    this.token = document.getElementsByName("csrf-token")[0].content;
  }

  handleKeydown(e) {
    if(e.target !== document.body) return; // Only apply shortcut if not typing in an input or any other regular keyboard interaction
    if (e.shiftKey && e.key === 'N') {
      e.preventDefault();
      fetch('/feature_flags/networks/toggle', {
        method: 'PUT',
        headers: { "X-CSRF-Token": this.token },
      })
      .then(res => {
        if (res.ok) {
          emitCustomEvent('renderAlert', {
            detail: {
              message: 'Networks feature flag toggled successfully. Refreshing...',
              type: AlertTypes.SUCCESS
            }
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          throw new Error('Networks toggle failed');
        }
      })
      .catch(err => {

      })
    }
  }
}
