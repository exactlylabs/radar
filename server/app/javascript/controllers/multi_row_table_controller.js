import { Controller } from "@hotwired/stimulus"
import handleError from "./error_handler_controller";
import { emitCustomEvent } from "../eventsEmitter";

export default class extends Controller {
  static targets = [
    "formCheckBoxInput",
    "selectAllFormCheckBoxInput",
    "testMovingCheckbox",
    "networkAccountSelectedSelect",
    "hiddenNetworkIds"
  ]

  connect() {
    this.token = document.getElementsByName("csrf-token")[0].content;
  }

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
    const multiRowActionsId = "multi-row-actions";
    document.getElementById(multiRowActionsId).classList.add('invisible');
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
    emitCustomEvent('closeMultiRowMenu');
    const ids = this.getIds();
    window.open(`/clients/bulk_pdf_labels.pdf?ids=${ids}`, '_blank').focus();
  }

  bulkRunTests(e) {
    e.stopPropagation();
    e.preventDefault();
    emitCustomEvent('closeMultiRowMenu');
    const url = "/clients/bulk_run_tests";
    this.runBulkRequest(url, "POST");
  }

  bulkDeletes(e) {
    e.stopPropagation();
    e.preventDefault();
    const idsLength = this.getIds().length;
    const userConfirmation = confirm(`Are you sure you want to delete ${idsLength > 1 ? `these ${idsLength} of pods` : 'this pod'}?`);
    if(!userConfirmation) return;
    emitCustomEvent('closeMultiRowMenu');
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

  bulkDeleteNetworks(e) {
    e.stopPropagation();
    e.preventDefault();
    const idsLength = this.getIds().length;
    const userConfirmation = confirm(`Are you sure you want to delete ${idsLength > 1 ? `these ${idsLength} networks` : 'this network'}?`);
    if (!userConfirmation) return;
    emitCustomEvent('closeMultiRowMenu');
    const url = e.target.getAttribute('data-url');
    this.runCustomNetworksBulkDelete(url, this.clearSelection);
  }

  runBulkRequest(url, method, thenFunction = undefined) {
    const ids = this.getIds();
    const selectedTestIds = JSON.stringify(ids);
    let formData = new FormData();
    formData.append("ids", selectedTestIds);
    fetch(url, {
      method: method,
      redirect: "follow",
      headers: { "X-CSRF-Token": this.token },
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

  runCustomNetworksBulkDelete(url, thenFunction = undefined) {
    const networksToDelete = this.getIds('network-', '-');
    const token = document.getElementsByName("csrf-token")[0].content;
    let formData = new FormData();
    formData.append("ids", JSON.stringify(networksToDelete));
    fetch(url, {
      method: "DELETE",
      redirect: "follow",
      headers: { "X-CSRF-Token": token },
      body: formData,
    })
      .then(response => {
        if (response.redirected) {
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

  handleBulkMoveNetworks(e) {
    e.preventDefault();
    e.stopPropagation();
    const networksToDelete = this.getIds('network-', '-');
    const baseUrl = window.location.origin;
    const url = new URL(`${baseUrl}${e.target.getAttribute('data-url')}`);
    url.searchParams.append('ids', JSON.stringify(networksToDelete));
    fetch(url, {
      method: "GET",
      headers: { "X-CSRF-Token": this.token },
    })
      .then(response => {
        if (response.ok) return response.text();
        else throw new Error(`There was an error moving networks: ${response.statusText}`);
      })
      .then(html => {
        emitCustomEvent('closeMultiRowMenu');
        Turbo.renderStreamMessage(html);
      })
      .catch((err) => { handleError(err, this.identifier); });
  }

  bulkMoveNetworks(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const ids = JSON.stringify(
      this.hiddenNetworkIdsTarget
      .getAttribute('data-network-ids')
      .replace(/\[/g, '')
      .replace(/\]/g, '')
      .split(',')
    );
    const wantsToMoveTests = this.testMovingCheckboxTarget.checked;
    const networkAccountSelected = this.networkAccountSelectedSelectTarget.value;
    let formData = new FormData();
    formData.append("ids", ids);
    formData.append("account_id", networkAccountSelected);
    formData.append("wants_to_move_tests", wantsToMoveTests);
    fetch('/locations/bulk_move_networks', {
      method: "POST",
      headers: { "X-CSRF-Token": token },
      body: formData,
    })
      .then(response => {
        if (response.ok) return response.text();
        else throw new Error(`Oops! There has been an error moving your network(s). Please try again later.`);
      })
      .then(html => {
        emitCustomEvent('closeCustomModal');
        this.deselectAll();
        Turbo.renderStreamMessage(html);
      })
      .catch((err) => {
        handleError(err, this.identifier);
      });
  }

  handleBulkRemoveFromNetworks(e) {
    e.preventDefault();
    e.stopPropagation();
    const networksToRemove = this.getIds();
    const baseUrl = window.location.origin;
    const url = new URL(`${baseUrl}${e.target.getAttribute('data-url')}`);
    url.searchParams.append('ids', JSON.stringify(networksToRemove));
    fetch(url, {
      method: "GET",
      headers: { "X-CSRF-Token": this.token },
    })
      .then(response => {
        if (response.ok) return response.text();
        else throw new Error(`Oops! There has been an error moving your pods. Please try again later.`);
      })
      .then(html => {
        emitCustomEvent('closeMultiRowMenu');
        Turbo.renderStreamMessage(html);
      })
      .catch((err) => { handleError(err, this.identifier); });
  }

  bulkRemoveFromNetwork(e) {
    e.stopPropagation();
    e.preventDefault();
    emitCustomEvent('closeMultiRowMenu');
    const url = "/clients/bulk_remove_from_network";
    this.runBulkRequest(url, "POST");
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
