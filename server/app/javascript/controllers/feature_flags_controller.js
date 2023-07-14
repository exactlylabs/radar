import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";

export default class extends Controller {

  connect(){}

  togglePublic(e) {
    const currentInput = e.target;
    const selectId = currentInput.dataset.selectId;
    const select = document.getElementById(selectId);
    if(select) {
      if (currentInput.checked) {
        select.classList.add('invisible');
      } else {
        select.classList.remove('invisible');
      }
    }
  }
}