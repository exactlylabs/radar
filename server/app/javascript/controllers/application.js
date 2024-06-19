import { Application } from "@hotwired/stimulus";
import "@hotwired/turbo-rails";

const application = Application.start();

// Configure Stimulus development experience
application.debug = process.env.NODE_ENV === 'development' || false;
window.Stimulus = application;

// handle abort errors
document.addEventListener("turbo:before-fetch-request", (event) => {
  const { fetchOptions } = event.detail;
  fetchOptions.signal.addEventListener("abort", (abortEvent) => {
    // prevent console error from being thrown
    abortEvent.preventDefault();
    event.preventDefault();
    event.stopImmediatePropagation();
  });
});

export { application };
