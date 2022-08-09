import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    blanks: String,
  };

  connect() {
    var options = {
      dir: document.body.getAttribute("direction"),
    };

    if (this.blanksValue) {
      options.allowClear = true;
    }

    $(this.element).select2(options);
    $(this.element).on("select2:select", function () {
      let event = new Event("select2-select", { bubbles: true }); // fire a native event
      this.dispatchEvent(event);
    });
    $(this.element).on("select2:clear", function () {
      let event = new Event("select2-clear", { bubbles: true }); // fire a native event
      this.dispatchEvent(event);
    });
  }
}
