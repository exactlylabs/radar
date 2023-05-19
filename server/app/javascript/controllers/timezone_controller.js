import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  
  /**
   * By using this controller, we can identify user's timezone with more precision than native Rails Time API
   * This is intended to be used specifically in tooltips for all of our tables which include time-related columns.
   */
  connect() {
    /**
     * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/resolvedOptions#:~:text=as%20default%20values.-,timeZone,-The%20value%20provided
     * Intl.DateTimeFormat().resolvedOptions().timeZone returns users' browser timezone value.
     * An example of possible output: America/Buenos_Aires
     * An example of possible output: UTC
     */
    let tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if(!!tz) {
      tz = tz.replaceAll('_', ' ');
      tz = tz.replaceAll('/', ', ');
      this.element.setAttribute('title', tz);
      this.element.setAttribute('data-bs-original-title', tz);
    }
  }
}
