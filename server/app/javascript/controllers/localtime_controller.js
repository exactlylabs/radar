import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    let unparsedTime = this.element.innerHTML;
    let rawTime = Date.parse(unparsedTime);
    if (isNaN(rawTime)) {
      return;
    }

    let localTime = new Date(rawTime);
    let f = new Intl.DateTimeFormat('en', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
    let localTimeString = f.format(localTime);
    this.element.innerHTML = localTimeString;
  }
}
