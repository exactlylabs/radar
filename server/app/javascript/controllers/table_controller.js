import { Controller } from "@hotwired/stimulus";

export default class extends Controller {

  connect() {}

  goToDetails(e) {
    const url = e.target.getAttribute("data-url");
    window.location.href = url;
  }

  sortBy(e) {
    const currentTarget = e.target;
    const value = currentTarget.dataset.value;

    const currentUrl = window.location.href;
    const url = new URL(currentUrl);

    url.searchParams.set("sort_by", value);
    const currentOrderBy = url.searchParams.get("order");

    if(!currentOrderBy) {
      url.searchParams.set("order", "desc");
    } else if(currentOrderBy === "desc") {
      url.searchParams.set("order", "asc");
    } else {
      url.searchParams.delete("order");
      url.searchParams.delete("sort_by");
    }
    url.searchParams.set("page", 1);
    window.location.href = url;
  }
}