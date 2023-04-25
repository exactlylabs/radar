import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "menuIcon",
    "openCategoriesModalButton",
    "searchInput",
    "hiddenHexInput",
    "colorBall"
  ];

  static values = {
    hex: String
  }

  connect() {
    KTMenu.createInstances();
  }

  fetchBaseModal() {
    document.querySelector("#manage-categories-button-ref").click();
  }

  closeBaseModal() {
    $("#categories_modal_ref").modal("hide");
  }

  closeDeleteModal() {
    $("#delete_category_modal_ref").modal("hide");
  }

  handleSubmitDelete() {
    this.closeDeleteModal();
    this.fetchBaseModal();
  }

  focusInput() {
    this.searchInputTarget.classList.add('category--search-container-focus');
  }

  blurInput() {
    this.searchInputTarget.classList.remove('category--search-container-focus');
  }

  pickColor(e) {
    const attributeKey = 'data-categories-hex-value';
    const selectedColor = e.target.getAttribute(attributeKey);
    this.hiddenHexInputTarget.value = selectedColor;
    this.colorBallTargets.forEach(elem => {
      if(elem.getAttribute(attributeKey) === selectedColor) {
        elem.classList.add('category--marker-selected');
      } else {
        elem.classList.remove('category--marker-selected');
      }
    });
  }
}