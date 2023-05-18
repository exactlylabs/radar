import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    blanks: String,
    dropdownParent: String,
    customTheme: String,
    customMatcher: String,
    allowClear: String,
  };

  connect() {
    var options = {
      dir: document.body.getAttribute("direction"),
    };

    if (this.blanksValue && this.blanksValue === 'true') {
      options.allowClear = true;
    }

    if(this.customThemeValue) {
      if(this.customThemeValue === 'custom-move-pod') options.templateResult = this.customMovePodTemplate;
    }

    if(this.customMatcherValue) {
      if(this.customMatcherValue === 'custom-pod-matcher') options.matcher = this.customPodSearchMatcher
    }

    // This allows select2 to work properly inside modals
    if (this.dropdownParentValue) {
      options.dropdownParent = `#${this.dropdownParentValue}`
    }

    if (this.allowClearValue) {
      options.allowClear = this.allowClearValue === 'true';
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

  customMovePodTemplate(state) {
    if (!state.id) return state.text;
    const podName = state.text.replace(/[\t\n\r]/gm, '');
    var $state = $(
      '<div class="add-pod--custom-move-option-container">' +
        `<span class="add-pod--custom-move-option-pod-name">${podName}</span>` + 
        `<span class="add-pod--custom-move-option-pod-id">${state.id}</span>` +
      '</div>'
    );
    return $state;
  }

  customPodSearchMatcher(params, data) {
    if(!params.term?.trim()) return data;
    if (typeof data.text === 'undefined') return null;

    const term = params.term.trim().toLowerCase();
    const podName = data.text.trim().toLowerCase();
    const podId = data.id.trim().toLowerCase();
    return (podName.indexOf(term) > -1 || podId.indexOf(term) > -1) ? data : null;
  }
}
