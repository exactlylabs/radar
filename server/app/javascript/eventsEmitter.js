import { AlertTypes } from "./alerts";

let timeoutId;

export function emitCustomEvent(key, options = null) {
  const event = new CustomEvent(key, options);
  // Always fire alerts immediately, otherwise wait for Turbo to render new components
  if (!!(options?.detail?.type) && Object.values(AlertTypes).includes(options.detail.type)) {
    window.dispatchEvent(event);
  } else {
    if(timeoutId) clearTimeout(timeoutId);
    timeoutId = setTimeout(() => window.dispatchEvent(event), 10); // need minimal delay to allow Turbo to render new components
  }
}