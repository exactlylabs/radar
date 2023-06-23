import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  connect() {
    this.page = this.getParam('page', 1);
    this.pageSize = this.getParam('page_size', 10);
  }

  getParam(name, defaultValue) {
    let possibleValue = window.location.href.split(`${name}=`)[1]?.split('&')[0];
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
    let newPath = window.location.href;
    if (!newPath.includes('page=')) {
      if (!newPath.includes('?')) newPath += '?';
      newPath += `&page=${newPage}`;
    } else {
      newPath = newPath.replace(`page=${this.page}`, `page=${newPage}`);
    }
    window.location.href = newPath;
  }

  changePageSize(newPageSize) {
    if(newPageSize == this.pageSize) return;
    let newPath = window.location.href;
    if(!newPath.includes('page_size=')) {
      if(!newPath.includes('?')) newPath += '?';
      newPath += `&page_size=${newPageSize}`;
    } else {
      newPath = newPath.replace(`page_size=${this.pageSize}`, `page_size=${newPageSize}`);  
    }
    newPath = newPath.replace(`page=${this.page}`, `page=1`);
    window.location.href = newPath;
  }

  previousPage() {
    if(this.page == 1) return;
    this.changePage(this.page - 1);
  }

  nextPage() {
    this.changePage(this.page + 1);
  }
}