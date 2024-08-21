import { Controller } from '@hotwired/stimulus';
import handleError from "./error_handler_controller";

export default class extends Controller {
  
  PAGE_SIZE = 10;
  
  connect() {
    this.element.addEventListener('scroll', this.handleScroll.bind(this));
    this.nextPage = parseInt(this.element.dataset.nextPage) || 1;
    this.totalCount = parseInt(this.element.dataset.totalCount);
    if(isNaN(this.totalCount)) {
      this.totalCount = 0;
    }
    this.loadingTimeout = null;
    this.outageType = new URLSearchParams(window.location.search).get('outage_type');
  }
  
  handleScroll() {
    if(this.loadingTimeout) return;
    if(((this.element.scrollTop + this.element.parentNode.clientHeight) / (this.element.scrollHeight) > 0.75) && this.totalCount > 0) {
      this.loadMore();
    }
  }
  
  setOutageType(e) {
    this.outageType = e.detail.outageType;
    this.element.scrollTo({top: 0, behavior: 'smooth'});
  }
  
  loadMore() {
    if(this.totalCount > 0 && (this.nextPage * this.PAGE_SIZE) >= this.totalCount) {
      return;
    }
    this.loadingTimeout = setTimeout(() => {this.loadingTimeout = null;}, 500);
    const url = new URL(this.element.dataset.url);
    url.searchParams.set('page', this.nextPage);
    if(!!this.outageType) {
      url.searchParams.set('outage_type', this.outageType);
    }
    if(!url.searchParams.has('page_size')) {
      url.searchParams.set('page_size', this.PAGE_SIZE.toString());
    }
    fetch(url)
      .then(response => response.text())
      .then(html => {
        Turbo.renderStreamMessage(html);
        this.nextPage++;
      })
      .catch(error => {
        handleError(error, this.identifier);
      });
  }
}