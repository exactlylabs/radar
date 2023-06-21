import { Controller } from "@hotwired/stimulus";
import { emitCustomEvent } from "../eventsEmitter";

export default class extends Controller {

  static targets = ["superUserToggle"];

  connect() {
    this.superUserDisabled = document.cookie.includes("radar_super_user_disabled=true");
    if (document.cookie.includes('radar_show_super_user_alert=true')) {
      document.cookie = "radar_show_super_user_alert=true;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;"; // delete cookie
      emitCustomEvent('renderAlert', {
        detail: {
          alertType: 'success',
          message: `Super User mode ${this.superUserDisabled ? 'disabled' : 'enabled'}.`
        }
      });
    }
  }

  handleToggleSuperUserStatus() {
    this.superUserDisabled = !this.superUserDisabled;
    document.cookie = "radar_show_super_user_alert=true;path=/";
    if (this.superUserDisabled) {
      document.cookie = "radar_super_user_disabled=true;path=/";
    } else {
      document.cookie = "radar_super_user_disabled=false;path=/";
    }
    window.location.reload();
  }
}