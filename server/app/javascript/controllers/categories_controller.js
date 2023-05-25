import { Controller } from "@hotwired/stimulus";
import { emitCustomEvent } from "../eventsEmitter";

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
    "colorPickerCaret"
  ];

  static values = {
    hex: String,
    locationId: Number,
  }

  connect() {
    console.log('connect')
    KTMenu.createInstances();
    this.categories = [];
  }

  initialize() {
    console.log('initialize')
    if(this.categoryCheckboxTargets) {
      let categoryIds = [];
      this.categoryCheckboxTargets.forEach(checkbox => {
        if(checkbox.getAttribute('checked')) {
          const categoryId = checkbox.id.split('check-box-')[1];
          categoryIds.push(categoryId);
        }
      });
      this.categories = categoryIds;
    }
  }

  initializeCategories() {
    if (document.getElementById('location_categories')) {
      if(this.hiddenCategoriesInputTarget) {
        this.categories = this.hiddenCategoriesInputTarget.value.split(',');
      }
    }
  }

  onCheckBoxChange(e) {
    if(e.target.checked) e.target.setAttribute('checked', 'true');
    else e.target.removeAttribute('checked');

    const selectedCategoryId = e.target.id.split('check-box-')[1];
    
    if(this.categories.includes(selectedCategoryId)) {
      const index = this.categories.indexOf(selectedCategoryId);
      this.categories.splice(index, 1);
    } else {
      this.categories.push(selectedCategoryId);
    }
    
    const categoriesHiddenInput = document.getElementById('location_categories');
    if(categoriesHiddenInput) categoriesHiddenInput.setAttribute('value', this.categories.join(','));

    const formData = new FormData();
    formData.append('categories', this.categories);
    const token = document.getElementsByName("csrf-token")[0].content;
    fetch('/location_categories/selected_categories', {
      method: "PUT",
      headers: { "X-CSRF-Token": token },
      body: formData
    })
    .then (response => response.text())
    .then(html => Turbo.renderStreamMessage(html))
    .catch((err) => { handleError(err, this.identifier) });
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
    e.preventDefault();
    e.stopPropagation();
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
    this.currentPickedColorTarget.style.backgroundColor = selectedColor;
    this.closeColorPicker();
  }

  toggleCategoriesDropdown(shouldOpen) {
    const url = shouldOpen ? `/location_categories/open_dropdown${!!this.locationIdValue ? `?location_id=${this.locationIdValue}` : ''}` : '/location_categories/close_dropdown';
    const token = document.getElementsByName("csrf-token")[0].content;
    fetch(url, {
      method: "GET",
      headers: { "X-CSRF-Token": token },
    })
      .then (response => response.text())
      .then(html => {
        Turbo.renderStreamMessage(html);
        if(shouldOpen) emitCustomEvent('handleCategorySearch');
      })
      .catch((err) => {
        handleError(err, this.identifier);
      });
  }

  toggleFocus() {
    if(this.selectClickableContainerTarget.classList.contains('category--location-select-container-focus')) {
      this.selectClickableContainerTarget.classList.remove('category--location-select-container-focus');
      this.toggleCategoriesDropdown(false);
    } else {
      this.selectClickableContainerTarget.classList.add('category--location-select-container-focus');
      this.toggleCategoriesDropdown(true);
    }
  }

  handleCategorySearchResponse() {
    this.categoryCheckboxTargets.forEach(checkbox => {
      const currentCheckboxId = checkbox.id.split('check-box-')[1];
      if(this.categories.includes(currentCheckboxId)) {
        checkbox.setAttribute('checked', 'true');
      }
    })
  }

  toggleColorPicker() {
    const classList = this.colorPickerTarget.classList;
    if(classList.contains('invisible')) {
      classList.remove('invisible');
    } else {
      classList.add('invisible');
    }
  }

  closeColorPicker() {
    this.colorPickerTarget.classList.add('invisible');
  }

  checkCloseColorPicker(e) {
    if(!document.getElementById('category--color-picker-ref')) return;
    if(e.type === 'click') {
      if(this.colorPickerCaretTarget.contains(e.target)){
        e.preventDefault();
        e.stopPropagation();
        this.toggleColorPicker();
      }
      else this.closeColorPicker();
    }
  }

  disableSubmitButton(categoryId) {
    const submitButton = document.getElementById(`category--submit-${categoryId}`);
    if(submitButton) {
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
    if(!e.target.value) {
      this.disableSubmitButton(categoryId);
    } else {
      this.enableSubmitButton(categoryId);
    }
  }

  clearSearchInput() {
    const input = document.getElementById('query');
    if(input) input.value = null;
  }

  handleCategoryCreated(e) {
    if(e.detail.formSubmission.location.pathname === '/categories' && e.detail.success) {
      this.clearSearchInput();
      setTimeout(() => emitCustomEvent('handleCategorySearch'), 100); // need to add a little delay to let turbo re-render components on screen
    }
  }

  clearCategories() {
    this.categories = [];
  }
}