import {Controller} from "@hotwired/stimulus";
import {emitCustomEvent} from "../eventsEmitter";
import handleError from "./error_handler_controller";

export default class extends Controller {
  static targets = [
      "menuIcon",
      "openCategoriesModalButton",
      "searchInput",
      "hiddenHexInput",
      "colorBall",
      "categoryCheckbox",
      "selectClickableContainer",
      "hiddenCategoriesInput",
      "colorPicker",
      "currentPickedColor",
      "colorPickerCaret",
      "accountCategoriesPicker",
      "firstAccountId"
  ];

  static values = {
      hex: String,
  }

  connect() {
      this.token = document.getElementsByName("csrf-token")[0].content;
      KTMenu.createInstances();
      this.categories = [];
      this.accountId = this.hasFirstAccountIdTarget ? this.firstAccountIdTarget.value : null;
      this.isMenuOpen = false;
  }
  
  selectClickableContainerTargetConnected(element) {
    this.categories = [];
    this.initialize();
  }

  initialize() {
      if (this.hasCategoryCheckboxTargets) {
          let categoryIds = [];
          this.categoryCheckboxTargets.forEach(checkbox => {
              if (checkbox.getAttribute('checked')) {
                  const categoryId = checkbox.id.split('check-box-')[1];
                  categoryIds.push(categoryId);
              }
          });
          this.categories = categoryIds;
      }
  }
  
  resetMenuOpen() {
    this.isMenuOpen = false;
  }
    
    initializeCategories() {
      this.isMenuOpen = false;
      if (document.getElementById('location_categories')) {
        if (this.hasHiddenCategoriesInputTarget) {
          this.categories = this.hiddenCategoriesInputTarget.value.split(',');
        }
      }
    }

    onCheckBoxChange(e) {
        const path = e.params.path;
        const selectedCategoryId = e.target.id.split('check-box-')[1];
        if (selectedCategoryId === '-1') {
            // this means the user has selected all categories
            const uncheckAll = this.categories.includes(selectedCategoryId)
            this.categories = [];
            this.categoryCheckboxTargets.forEach(checkbox => {
                if (uncheckAll) {
                    checkbox.removeAttribute('checked');
                    checkbox.checked = false;
                } else {
                    const currentCheckboxId = checkbox.id.split('check-box-')[1];
                    this.categories.push(currentCheckboxId);
                    checkbox.setAttribute('checked', 'true');
                    checkbox.checked = true;
                }
            });
        } else {
            if (!e.target.checked && this.categories.includes(selectedCategoryId)) {
                const index = this.categories.indexOf(selectedCategoryId);
                this.categories.splice(index, 1);
                e.target.removeAttribute('checked');
                e.target.checked = false;
            } else if (e.target.checked && !this.categories.includes(selectedCategoryId)) {
                this.categories.push(selectedCategoryId);
                e.target.setAttribute('checked', 'true');
                e.target.checked = true;
            }
        }

        const categoriesHiddenInput = document.getElementById(path);
        if (categoriesHiddenInput) categoriesHiddenInput.setAttribute('value', this.categories.join(','));

        const formData = new FormData();
        formData.append('categories', this.categories);
        this.toggleSubmitButton();
        fetch(`/${path}/selected_categories`, {
            method: "PUT",
            headers: {"X-CSRF-Token": this.token},
            body: formData
        })
            .then(response => response.text())
            .then(html => Turbo.renderStreamMessage(html))
            .catch((err) => {
                handleError(err, this.identifier)
            });
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

    closeImportCategoriesFromAnotherAccountModal() {
        $("#delete_category_modal_ref").modal("hide");
    }

    handleSubmitDelete() {
        this.closeDeleteModal();
        this.fetchBaseModal();
    }

    handleSubmitImportCategoriesFromAnotherAccount() {
        this.closeImportCategoriesFromAnotherAccountModal()
        this.fetchBaseModal();
    }

    focusInput() {
        this.searchInputTarget.classList.add('category--search-container-focus');
    }

    blurInput() {
        this.searchInputTarget.classList.remove('category--search-container-focus');
    }

    pickColor(e) {
        e.preventDefault();
        e.stopPropagation();
        const attributeKey = 'data-categories-hex-value';
        const selectedColor = e.target.getAttribute(attributeKey);
        this.hiddenHexInputTarget.value = selectedColor;
        this.colorBallTargets.forEach(elem => {
            if (elem.getAttribute(attributeKey) === selectedColor) {
                elem.classList.add('category--marker-selected');
            } else {
                elem.classList.remove('category--marker-selected');
            }
        });
        this.currentPickedColorTarget.style.backgroundColor = selectedColor;
        this.closeColorPicker();
    }

    toggleCategoriesDropdown(shouldOpen, path, holderId) {
        const url = shouldOpen ? `${path}/open_dropdown?${holderId}` : `${path}/close_dropdown?${holderId}`;
        fetch(url, {
            method: "GET",
            headers: {"X-CSRF-Token": this.token},
        })
            .then(response => response.text())
            .then(html => {
                Turbo.renderStreamMessage(html);
                if (shouldOpen) emitCustomEvent('handleCategorySearch');
            })
            .catch((err) => {
                handleError(err, this.identifier);
            });
    }

    toggleFocus(e) {
      if(e) {
        e.preventDefault();
        e.stopPropagation();
      }
      const path = this.selectClickableContainerTarget.dataset.categoriesPathParam;
      let holderId = this.selectClickableContainerTarget.dataset.categoriesHolderIdValue;
      if (holderId === null || holderId === undefined) {
        if (this.accountId === null || this.accountId === undefined) {
          if (this.hasFirstAccountIdTarget) {
            this.accountId = this.firstAccountIdTarget.value;
          } else {
            return;
          }
        }
        holderId = `account_id=${this.accountId}`;
      }
      document.removeEventListener('click', this.closeMenuIfClickedOutside.bind(this));
      
      if (this.isMenuOpen) {
        this.selectClickableContainerTarget.classList.remove('category--location-select-container-focus');
        this.toggleCategoriesDropdown(false, path, holderId);
      } else {
        document.addEventListener('click', this.closeMenuIfClickedOutside.bind(this));
        this.selectClickableContainerTarget.classList.add('category--location-select-container-focus');
        this.toggleCategoriesDropdown(true, path, holderId);
      }
      this.isMenuOpen = !this.isMenuOpen;
    }
  
  closeMenuIfClickedOutside(event) {
    if(!this.isMenuOpen) return;
    event.stopPropagation();
    const clickedTarget = event.target;
    const clickableContainer = this.selectClickableContainerTarget;
    const categoriesMenu = document.getElementById(clickableContainer.dataset.categoriesMenuId);
    if(!categoriesMenu) return;
    if (!this.selectClickableContainerTarget.contains(clickedTarget) && !categoriesMenu.contains(clickedTarget)) {
      this.toggleFocus();
    }
  }

    handleCategorySearchResponse() {
        this.categoryCheckboxTargets.forEach(checkbox => {
            const currentCheckboxId = checkbox.id.split('check-box-')[1];
            if (this.categories.includes(currentCheckboxId)) {
                checkbox.setAttribute('checked', 'true');
            }
        })
    }

    toggleColorPicker() {
        const classList = this.colorPickerTarget.classList;
        if (classList.contains('invisible')) {
            classList.remove('invisible');
        } else {
            classList.add('invisible');
        }
    }

    closeColorPicker() {
        this.colorPickerTarget.classList.add('invisible');
    }

    checkCloseColorPicker(e) {
        if (!document.getElementById('category--color-picker-ref')) return;
        if (e.type === 'click') {
            if (this.colorPickerCaretTarget.contains(e.target)) {
                e.preventDefault();
                e.stopPropagation();
                this.toggleColorPicker();
            } else this.closeColorPicker();
        }
    }

    disableSubmitButton(categoryId) {
        const submitButton = document.getElementById(`category--submit-${categoryId}`);
        if (submitButton) {
            submitButton.classList.add('disabled');
            submitButton.setAttribute('disabled', 'true');
            submitButton.type = 'button';
        }
    }

    enableSubmitButton(categoryId) {
        const submitButton = document.getElementById(`category--submit-${categoryId}`);
        if (submitButton) {
            submitButton.classList.remove('disabled');
            submitButton.removeAttribute('disabled');
            submitButton.type = 'submit';
        }
    }

    checkCategoryName(e) {
        const categoryId = e.target.getAttribute('data-category-id');
        if (!e.target.value) {
            this.disableSubmitButton(categoryId);
        } else {
            this.enableSubmitButton(categoryId);
        }
    }

    clearSearchInput() {
        const input = document.getElementById('query');
        if (input) input.value = null;
    }

    handleCategoryCreated(e) {
        if (e.detail.formSubmission.location.pathname === '/categories' && e.detail.success) {
            this.clearSearchInput();
            setTimeout(() => emitCustomEvent('handleCategorySearch'), 100); // need to add a little delay to let turbo re-render components on screen
        }
    }

    clearCategories() {
        this.categories = [];
    }

    showCategoriesForSelectedAccount(event) {
        this.accountId = event.target.value;
        this.clearCategories();
    }

    onImportFromAnotherAccount(event) {
        event.preventDefault();
        const url = event.target.href;
        // make a turbo request to the href
        fetch(url, {
            method: "GET",
            headers: {"X-CSRF-Token": this.token},
        }).then(response => response.text())
            .then(html => {
                this.closeBaseModal();
                Turbo.renderStreamMessage(html);
            })
            .catch((err) => {
                handleError(err, this.identifier);
            });
    }
  
  toggleSubmitButton() {
    const submitButton = this.element.querySelector('input[type="submit"]');
    if(!submitButton) return;
    if(this.categories.length > 0) {
      submitButton.removeAttribute('disabled');
    } else {
      submitButton.setAttribute('disabled', 'disabled');
    }
  }
}