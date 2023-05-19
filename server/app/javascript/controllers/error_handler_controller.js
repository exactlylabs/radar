import * as Sentry from "@sentry/browser";

/*
  The idea behind this method is to centralize error handling via Sentry for
  exceptions thrown inside Controllers.
  Basic usage example:
    ...
    .catch(err => handleError(err, this.identifier)
    ...
  Where this.identifier is a method helper provided by Stimulus:
  https://stimulus.hotwired.dev/reference/controllers#:~:text=identifier%2C%20via%20the%20this.identifier%20property
  Other context data is set globally prior to this execution.
 */
export default function handleError(error, controllerName) {
  Sentry.setContext("controller", { name: controllerName });
  Sentry.captureException(error);
}
