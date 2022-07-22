import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    this.drawer = new KTDrawer(this.element);
  }
}
