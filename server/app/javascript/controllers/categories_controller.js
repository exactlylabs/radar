import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = ["menuIcon", "openCategoriesModalButton"];

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
}