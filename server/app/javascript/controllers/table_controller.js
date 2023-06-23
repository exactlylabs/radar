import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  connect() {}

  goToDetails(e) {
    const url = e.target.getAttribute("data-url");
    window.location.href = url;
  }
}