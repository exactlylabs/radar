import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";

export default class extends Controller {
  static targets = [
    "releaseGroupValueSelect",
    "releaseGroupMessage",
    "releaseGroupOption",
    "formCheckBoxInput"
  ];

  getIds() {
    const prefix = "check-box-";
    return this.formCheckBoxInputTargets.filter((input) => input.checked).map((input) => input.id.split(prefix)[1]);
  }

  updateMessage() {
    const selectFind = this.releaseGroupOptionTargets.find(o => o.value === this.releaseGroupValueSelectTarget.value);
    if(!selectFind) return;
    const selectLabel = selectFind.label;
    const amount = this.formCheckBoxInputTargets.filter(input => input.checked).length;
    this.releaseGroupMessageTarget.innerText = `${amount} Pod${amount > 1 ? 's' : ''} will be assigned to ${selectLabel}`;
  }

  onSelectChange(e) {
    this.updateMessage();
  }

  onCheckBoxChange(e) {
    this.updateMessage();
  }

  onSubmit(e) {
    e.stopPropagation();
    e.preventDefault();
    const ids = this.getIds();
    const selectedTestIds = JSON.stringify(ids);
    const token = document.getElementsByName("csrf-token")[0].content;
    const updateGroupId = this.releaseGroupValueSelectTarget.value;
    let formData = new FormData();
    formData.append("ids", selectedTestIds);
    formData.append("update_group_id", updateGroupId);
    fetch('/clients/bulk_update_release_group', {
      method: "POST",
      redirect: "follow",
      headers: { "X-CSRF-Token": token },
      body: formData,
    })
      .then (response => response.text())
      .then(html => Turbo.renderStreamMessage(html))
      .catch((err) => {
        handleError(err, this.identifier);
      })
      .finally(() => { $('#bulk_change_release_group').modal('hide'); })
  }

}