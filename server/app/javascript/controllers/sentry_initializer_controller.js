import { Controller } from "@hotwired/stimulus";
import * as Sentry from "@sentry/browser";

/*
  The sole purpose of this controller is to dispatch a setUser
  method on Sentry, once the page has rendered, having access to
  the hidden div containing user data which isn't accessible in
  application.js.
 */
export default class SentryInitializerController extends Controller {
  connect() {
    const userElement = document.querySelector("#user_id_hidden");
    Sentry.setUser({
      id: userElement.getAttribute("data-id"),
      email: userElement.getAttribute("data-email"),
    });
  }
}
