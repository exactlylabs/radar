import { Controller } from "@hotwired/stimulus"
import handleError from "./error_handler_controller";

export default class extends Controller {
  static targets = [
    "formCheckBoxInput",
  ]

  connect() {}

  onSelectAll(e) {
    if(!e.target.checked) {
      this.deselectAll();
    } else {
      this.selectAll();
    }
  }

  selectAll() {
    this.formCheckBoxInputTargets.forEach((input) => {
      input.checked = true;
      input.setAttribute('checked', 'true');
    });
    // const multiRowActionsId = "multi-row-actions";
    // const rowAmountSelectedSpan = "row-amount-selected-span";
    // const amount = this.formCheckBoxInputTargets.length;
    // if (amount >= 1) {
    //   document.getElementById(multiRowActionsId).style.display = "block";
    //   document.getElementById(rowAmountSelectedSpan).innerText = `${amount} selected`;
    // } else {
    //   document.getElementById(multiRowActionsId).style.display = "none";
    // }
  }

  deselectAll() {
    this.formCheckBoxInputTargets.forEach((input) => {
      input.checked = false;
      input.removeAttribute('checked');
    });
  }

  onCheckBoxChange(e) {
    const multiRowActionsId = "multi-row-actions";
    const rowAmountSelectedSpan = "row-amount-selected-span";

    if(e.target.checked) {
      e.target.setAttribute('checked', 'true');
    } else {
      e.target.removeAttribute('checked');
    }

    const amount = this.formCheckBoxInputTargets.filter((input) => input.checked).length;

    if(amount >= 1) {
      document.getElementById(multiRowActionsId).style.display = "block";
      document.getElementById(rowAmountSelectedSpan).innerText = `${amount} selected`;
    } else {
      document.getElementById(multiRowActionsId).style.display = "none";
    }
  }

  clearSelection() {
    document.getElementById("multi-row-actions").style.display = "none";
  }

  bulkPdfLabels(e) {
    e.stopPropagation();
    e.preventDefault();
    const ids = this.getIds();
    window.open(`/clients/bulk_pdf_labels.pdf?ids=${ids}`, '_blank').focus();
  }

  bulkRunTests(e) {
    e.stopPropagation();
    e.preventDefault();
    const url = "/clients/bulk_run_tests";
    this.runBulkRequest(url, "POST");
  }

  bulkDeletes(e) {
    e.stopPropagation();
    e.preventDefault();
    const idsLength = this.getIds().length;
    const userConfirmation = confirm(`Are you sure you want to delete ${idsLength > 1 ? `these ${idsLength} of pods` : 'this pod'}?`);
    if(!userConfirmation) return;
    const url = "/clients/bulk_delete";
    this.runBulkRequest(url, "DELETE", this.clearSelection);
  }

  runBulkRequest(url, method, thenFunction = undefined) {
    const ids = this.getIds();
    const selectedTestIds = JSON.stringify(ids);
    const token = document.getElementsByName("csrf-token")[0].content;
    let formData = new FormData();
    formData.append("ids", selectedTestIds);
    fetch(url, {
      method: method,
      redirect: "follow",
      headers: { "X-CSRF-Token": token },
      body: formData,
    })
    .then (response => response.text())
    .then(html => {
      Turbo.renderStreamMessage(html);
      if(thenFunction) thenFunction();
    })
    .catch((err) => {
      handleError(err, this.identifier);
    });
  }

  getIds() {
    const prefix = "check-box-";
    return this.formCheckBoxInputTargets.filter((input) => input.checked).map((input) => input.id.split(prefix)[1]);
  }
}
