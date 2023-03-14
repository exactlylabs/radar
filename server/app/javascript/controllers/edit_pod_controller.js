import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static targets = [
    "accountsSelect",
    "updatePodButton",
    "warningTitle",
    "warningText",
    "warningContent",
    "step0Content",
  ];

  connect() {}

  hideModal() {
    $(this.element).modal("hide");
  }

  handleSubmitStart(e) {
    this.hideModal();
    $("#edit_pod_modal").modal("show");
    document
      .querySelector("#loading-container-edit")
      .classList.remove("d-none");
    $("#client-locations-dropdown-edit").select2({
      dropdownParent: $("#edit_pod_modal"),
    });
  }

  handleNewLocationFromClientModal(e) {
    /*
      TODO: this was already here, will open a ticket
      to revisit this, don't want to break anything not related
      to this particular task.
     */
    if (e.detail.success) {
      document.querySelector("#loading-container-edit").classList.add("d-none");
      document
        .querySelector("#location-created-snackbar-edit")
        .classList.remove("d-none");
    }
  }

  onAccountsSelectChange(e) {
    const currentSelectedAccountId = this.accountsSelectTarget.value;
    if (currentSelectedAccountId) {
      this.updatePodButtonTarget.classList.remove("disabled");
      fetch(`/locations/account/${currentSelectedAccountId}`)
        .then((res) => {
          if (res.ok) return res.json();
          else throw new Error(res.statusText);
        })
        .then((res) => {
          const locationsDropdownSelector = $(
            "#client-locations-dropdown-edit"
          );
          // empty current locations dropdown
          locationsDropdownSelector.empty();
          // populate with new locations received
          const placeholderOption = document.createElement('option');
          const emptyOption = document.createElement('option');
          emptyOption.innerText = '\xA0';
          locationsDropdownSelector.append(placeholderOption);
          locationsDropdownSelector.append(emptyOption);
          res.forEach((location) => {
            const currentLocationOption = new Option(
              location.text,
              location.id,
              false,
              false
            );
            locationsDropdownSelector.append(currentLocationOption);
          });
          // clear default selection
          locationsDropdownSelector.val(null);
        })
        .catch((err) => console.error(err));
    } else {
      this.updatePodButtonTarget.classList.add("disabled");
    }
  }

  submit(e) {
    const currentSelectedAccountId = this.accountsSelectTarget.value;
    let currentSelectedAccountName;
    let initialAccountSelectedName;
    let initialAccountSelectedId;
    // Cannot do something like find/filter as this is not an Array, but
    // an HTMLCollection
    this.accountsSelectTarget.children.forEach((option) => {
      if (option.getAttribute("selected") === "selected") {
        initialAccountSelectedId = option.value;
        initialAccountSelectedName = option.text;
      } else if (option.value === currentSelectedAccountId) {
        currentSelectedAccountName = option.text;
      }
    });
    // If selected account has not changed => regular submission
    // else => extra step modal as a warning
    if (currentSelectedAccountId !== initialAccountSelectedId) {
      e.preventDefault();
      e.stopPropagation();
      this.warningContentTarget.style.display = "block";
      this.step0ContentTarget.style.display = "none";
      this.warningTitleTarget.innerText = `Move Pod to ${currentSelectedAccountName}`;
      this.warningTextTarget.innerText = `If you continue this Pod will no longer be available to anyone in ${initialAccountSelectedName}.`;
    }
  }
}
