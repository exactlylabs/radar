import { Controller } from "@hotwired/stimulus"
import handleError from "./error_handler_controller";
import { emitCustomEvent } from "../eventsEmitter";

export default class extends Controller {
  static targets = [
    "formCheckBoxInput",
    "selectAllFormCheckBoxInput"
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
    const multiRowActionsId = "multi-row-actions";
    const rowAmountSelectedSpan = "row-amount-selected-span";
    const amount = this.formCheckBoxInputTargets.length;
    if (amount >= 1) {
      document.getElementById(multiRowActionsId).classList.remove('invisible');
      document.getElementById(rowAmountSelectedSpan).innerText = `${amount} selected`;
    } else {
      document.getElementById(multiRowActionsId).classList.add('invisible');
    }
  }

  deselectAll() {
    if (this.hasSelectAllFormCheckBoxInputTarget && this.selectAllFormCheckBoxInputTarget.checked) {
      this.selectAllFormCheckBoxInputTarget.checked = false;
      this.selectAllFormCheckBoxInputTarget.removeAttribute('checked');
    }
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
      document.getElementById(multiRowActionsId).classList.remove('invisible');
      document.getElementById(rowAmountSelectedSpan).innerText = `${amount} selected`;
    } else {
      document.getElementById(multiRowActionsId).classList.add('invisible');
    }
  }

  clearSelection() {
    document.getElementById("multi-row-actions").classList.add('invisible');
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

  bulkDeleteMembers(e) {
    e.stopPropagation();
    e.preventDefault();
    const idsLength = this.getIds().length;
    const userConfirmation = confirm(`Are you sure you want to delete ${idsLength > 1 ? `these ${idsLength} members` : 'this member'}?`);
    if (!userConfirmation) return;
    emitCustomEvent('closeMultiRowMenu');
    const url = e.target.getAttribute('data-url');
    this.runCustomMembersBulkDelete(url, this.clearSelection);
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

  runCustomMembersBulkDelete(url, thenFunction = undefined) {
    const ids = this.getIds('check-box-user-', '-');
    const types = this.getRowTypes();
    const usersToDelete = [];
    const invitesToDelete = [];
    types.forEach((type, index) => {
      if(type === 'UsersAccount') usersToDelete.push(ids[index]);
      else invitesToDelete.push(ids[index]);
    });
    const token = document.getElementsByName("csrf-token")[0].content;
    let formData = new FormData();
    formData.append("users_ids", JSON.stringify(usersToDelete));
    formData.append("invites_ids", JSON.stringify(invitesToDelete));
    fetch(url, {
      method: "DELETE",
      redirect: "follow",
      headers: { "X-CSRF-Token": token },
      body: formData,
    })
      .then(response => {
        if(response.redirected) {
          window.location.href = response.url;
        } else {
          this.deselectAll();
          return response.text();
        }
      })
      .then(html => {
        Turbo.renderStreamMessage(html);
        if (thenFunction) thenFunction();
      })
      .catch((err) => {
        handleError(err, this.identifier);
      });
  }

  getIds(customPrefix = undefined, customExtraDelimiter = undefined) {
    const prefix = customPrefix ?? "check-box-";
    
    const ids = this
    .formCheckBoxInputTargets
    .filter((input) => input.checked)
    .map((input) => input.id.split(prefix)[1]);
    
    return !!customExtraDelimiter ? 
      ids.map((id) => id.split(customExtraDelimiter)[0]) : 
      ids;
  }

  getRowTypes() {
    return this
      .formCheckBoxInputTargets
      .filter((input) => input.checked)
      .map((input) => input.getAttribute('data-row-type'));
  }
}
