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

    // Custom data attribute to be able to remove searchbar from select2 application-wide
    // Reference on how to remove searchbar: https://select2.org/searching#single-select
    if(this.element.getAttribute('data-remove-searchbar') === 'true') {
      options.minimumResultsForSearch = Infinity;
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
