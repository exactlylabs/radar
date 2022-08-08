import { Application } from "@hotwired/stimulus";
import "@hotwired/turbo-rails";
import * as Sentry from "@sentry/browser";

const application = Application.start();

// based on sentry.rb file config
Sentry.init({
  dsn: "https://824cb73d4b5149459eb889296687f94f@o1197382.ingest.sentry.io/6320151",
  tracesSampleRate: 0.0,
  environment: "production",
});

// Set Sentry tag for current account id if present in cookies
const cookieArray = document.cookie.split(";");
let currentAccountId;
cookieArray.forEach((cookie) => {
  if (cookie.trim().includes("radar_current_account_id")) {
    currentAccountId = cookie.split("=")[1];
  }
});
if (currentAccountId) {
  Sentry.setContext("account", { id: currentAccountId });
}

// Configure Stimulus development experience
application.debug = false;
window.Stimulus = application;

export { application };
