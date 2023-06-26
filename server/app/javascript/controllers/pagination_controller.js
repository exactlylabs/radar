import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  connect() {
    this.page = this.getParam('page', 1);
    this.pageSize = this.getParam('page_size', 10);
  }

  getParam(name, defaultValue) {
    const currentHref = window.location.href;
    const url = new URL(currentHref);
    let possibleValue = url.searchParams.get(name);
    if(possibleValue) possibleValue = parseInt(possibleValue);
    else possibleValue = defaultValue;
    return possibleValue;
  }

  handleChangePage(e) {
    this.changePage(e.target.value);
  }

  handleChangePageSize(e) {
    this.changePageSize(e.target.value);
  }

  changePage(newPage) {
    if (newPage == this.page) return;
    const currentHref = window.location.href;
    const url = new URL(currentHref);
    url.searchParams.set('page', newPage);
    window.location.href = url;
  }

  changePageSize(newPageSize) {
    if(newPageSize == this.pageSize) return;
    const currentHref = window.location.href;
    const url = new URL(currentHref);
    url.searchParams.set('page_size', newPageSize);
    url.searchParams.set('page', 1);
    window.location.href = url;
  }

  previousPage() {
    if(this.page == 1) return;
    this.changePage(this.page - 1);
  }

  nextPage() {
    this.changePage(this.page + 1);
  }
}