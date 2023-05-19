let timeoutId;

export function emitCustomEvent(key, options = null) {
  const event = new CustomEvent(key, options);
  if(timeoutId) clearTimeout(timeoutId);
  timeoutId = setTimeout(() => window.dispatchEvent(event), 10); // need minimal delay to allow Turbo to render new components
}