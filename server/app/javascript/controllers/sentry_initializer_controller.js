import { Controller } from "@hotwired/stimulus";
import * as Sentry from "@sentry/browser";

/*
  The sole purpose of this controller is to dispatch a setUser
  method on Sentry, once the page has rendered, having access to
  the hidden div containing user data which isn't accessible in
  application.js.
 */
export default class SentryInitializerController extends Controller {

  static targets = [
    "hiddenUserIdInput"
  ];

  connect() {
    if(this.isProduction) {
      const userElement = document.querySelector("#user_id_hidden");
      Sentry.setUser({
        id: userElement.getAttribute("data-id"),
        email: userElement.getAttribute("data-email"),
      });
    }
  }

  switchAccount(e) {
    if(this.isProduction) {
      const selectedAccountId = e.target.id.split("@")[1];
      if (selectedAccountId) {
        Sentry.setContext("account", {id: selectedAccountId});
      }
    }
  }

  clearUserContext() {
    if(this.isProduction) {
      const userElement = this.hiddenUserIdInputTarget;
      userElement.setAttribute("data-id", null);
      userElement.setAttribute("data-email", null);
      Sentry.setUser(null);
    }
  }

  get isProduction() {
    return document.head.querySelector("meta[name=rails_env]").content === "production"
  }
}
