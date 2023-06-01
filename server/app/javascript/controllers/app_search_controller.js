import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  static targets = [
    'searchInput',
    'spinner'
  ];

  connect() {
    this.debounceTimeoutId = null;
  }

  debouncedSearch() {
    clearTimeout(this.debounceTimeoutId);
    this.debounceTimeoutId = setTimeout(this.search.bind(this), 500);
  }

  search() {
    const query = this.searchInputTarget.value;
    this.showSpinner();
    const token = document.querySelector('meta[name="csrf-token"]').content;
    fetch(`/search?q=${query}`, {
      method: 'GET',
      headers: {
        'X-CSRF-Token': token,
      }
    })
      .then(response => response.text())
      .then(html => Turbo.renderStreamMessage(html))
      .catch((err) => handleError(err, this.identifier))
      .finally(() => this.hideSpinner());
  }

  showSpinner() {
    this.spinnerTarget.classList.remove('invisible');
  }

  hideSpinner() {
    this.spinnerTarget.classList.add('invisible');
  }
}
