import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";
import {emitCustomEvent} from "../eventsEmitter";
import {AlertTypes} from "../alerts";

export default class extends Controller {
  
  ADDRESS_SEARCH_DELAY = 500;
  
  static targets = [
    "name",
    "address",
    "map",
    "latitude",
    "longitude",
    "manualLatLong",
    "expectedDownload",
    "expectedUpload",
    "geoIcon",
    "clearIcon",
    "spinner",
    "conditional",
    "addressWrapper",
    "manualLatLongWrapper",
    "submitButton",
    "spinnerButton",
    "addressNotFoundMessage",
    "suggestionsContainer"
  ];

  connect() {
    this.address = this.addressTarget.value;
    this.isCreation = this.element.querySelector("input[name='id']")?.value === "" || false;
    this.isManuallySetting = this.manualLatLongTarget.checked;
    this.token = document.querySelector('meta[name="csrf-token"]').content;
    if (this.isCreation) {
      this.populatePinAndCoordinatesFromUserIp();
    } else {
      this.mapTarget.setAttribute(
        "data-location-latitude-value",
        this.latitudeTarget.value
      );
      this.mapTarget.setAttribute(
        "data-location-longitude-value",
        this.longitudeTarget.value
      );
    }
  }
  
  populatePinAndCoordinatesFromUserIp() {
    fetch("/geocode", {
      method: "POST",
      headers: { "X-CSRF-Token": this.token },
    })
      .then((res) => res.json())
      .then((res) => {
        this.latitudeTarget.value = res[0];
        this.longitudeTarget.value = res[1];
        this.mapTarget.setAttribute("data-location-latitude-value", res[0]);
        this.mapTarget.setAttribute("data-location-longitude-value", res[1]);
      })
      .catch((err) => {
        handleError(err, this.identifier);
      })
      .finally(this.hideSpinnerAndShowIcon.bind(this));
  }

  autofillAddress(lat, lon) {
    clearTimeout(this.addressTimeout);
    this.addressWrapperTarget.style.border = 'none';
    this.addressWrapperTarget.style.borderRadius = 'none';
    this.addressTimeout = setTimeout(
      function () {
        let formData = new FormData();
        formData.append("query", `[${lat}, ${lon}]`);
        fetch("/reverse_geocode", {
          method: "POST",
          headers: { "X-CSRF-Token": this.token },
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            if(this.selectedSuggestion) return;
            this.addressTarget.value = data.address
          })
          .catch((err) => {
            handleError(err, this.identifier);
          })
          .finally(this.hideSpinnerAndShowIcon.bind(this));
      }.bind(this),
      this.ADDRESS_SEARCH_DELAY
    );
  }
  
  selectForcedSuggestion(e) {
    this.interacted = true;
    this.selectedSuggestion = true;
    this.addressWrapperTarget.style.border = 'none';
    this.addressWrapperTarget.style.borderRadius = 'none';
    this.spinnerTarget.classList.remove("d-none");
    this.geoIconTarget.classList.add("d-none");
    // if address is empty, we will geocode based off the IP
    const formData = new FormData();
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        this.useGeolocation.bind(this),
        this.doGeocodeRequest.bind(this, formData)
      );
    } else {
      this.doGeocodeRequest(formData);
    }
    this.hideClearInputButton();
    this.hideSuggestions();
  }
  
  selectSuggestion(e) {
    this.selectedSuggestion = true;
    const suggestion = e.target;
    const coordinates = JSON.parse(suggestion.dataset.coordinates);
    this.latitudeTarget.value = coordinates[0];
    this.longitudeTarget.value = coordinates[1];
    this.mapTarget.setAttribute("data-location-latitude-value", coordinates[0]);
    this.mapTarget.setAttribute("data-location-longitude-value", coordinates[1]);
    this.addressTarget.value = suggestion.dataset.fullAddress;
    this.clearSuggestions();
  }
  
  useGeolocation(geolocationPosition) {
    const userGeoLatitude = geolocationPosition.coords.latitude;
    const userGeoLongitude = geolocationPosition.coords.longitude;
    this.latitudeTarget.value = userGeoLatitude;
    this.longitudeTarget.value = userGeoLongitude;
    this.mapTarget.setAttribute(
      "data-location-latitude-value",
      userGeoLatitude
    );
    this.mapTarget.setAttribute(
      "data-location-longitude-value",
      userGeoLongitude
    );
  }
  
  useGeolocationAndAutofill(geolocationPosition) {
    this.useGeolocation(geolocationPosition);
    this.autofillAddress(geolocationPosition.coords.latitude, geolocationPosition.coords.longitude);
  }
  
  autofillGeoData() {
    this.interacted = true;
    this.selectedSuggestion = false;
    this.addressWrapperTarget.style.border = 'none';
    this.addressWrapperTarget.style.borderRadius = 'none';
    this.spinnerTarget.classList.remove("d-none");
    this.geoIconTarget.classList.add("d-none");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        this.useGeolocationAndAutofill.bind(this),
        this.handleGeoError.bind(this)
      );
    }
  }
  
  hideSpinnerAndShowIcon() {
    this.spinnerTarget.classList.add("d-none");
    if(document.activeElement === this.addressTarget) {
      this.clearIconTarget.classList.remove("d-none");
    } else {
      this.geoIconTarget.classList.remove("d-none");
    }
  }
  
  handleGeoError(error) {
    this.hideSpinnerAndShowIcon();
    emitCustomEvent('renderAlert', {
      detail: {
        message: "We could not detect your current location. Make sure you enable location access in your browser and try again.",
        type: AlertTypes.ERROR
      }
    });
  }

  fetchGeoData(address) {
    this.address = address;
    clearTimeout(this.addressTimeout);
    this.addressTimeout = setTimeout(this.fetch.bind(this), this.ADDRESS_SEARCH_DELAY);
  }
  
  fetchSuggestionsRequest() {
    this.resetErrorState();
    if(this.address === "") return;
    this.showLoading();
    let formData = new FormData();
    formData.append("address", this.address);
    fetch("/suggestions", {
      method: "POST",
      headers: { "X-CSRF-Token": this.token },
      body: formData,
    })
      .then((response) => response.text())
      .then((text) => Turbo.renderStreamMessage(text))
      .catch((err) => {
        handleError(err, this.identifier, false);
      })
      .finally(this.hideSpinnerAndShowIcon.bind(this));
  }
  
  showLoading() {
    this.spinnerTarget.classList.remove("d-none");
    this.geoIconTarget.classList.add("d-none");
    this.clearIconTarget.classList.add("d-none");
  }
  
  resetErrorState() {
    this.addressTarget.dataset.error = 'false';
    if(this.hasMapTarget) this.mapTarget.dataset.error = 'false';
    if(this.hasAddressNotFoundMessageTarget) this.addressNotFoundMessageTarget.setAttribute("hidden", "hidden");
  }
  
  fetch() {
    this.resetErrorState();
    if(this.address === "" || this.address.length < 5) return;
    this.showLoading();
    
    let formData = new FormData();
    formData.append("address", this.address);
    this.doGeocodeRequest(formData);
  }
  
  doGeocodeRequest(formData) {
    this.addressTarget.dataset.error = 'false';
    if(this.hasMapTarget) this.mapTarget.dataset.error = 'false';
    if(this.hasAddressNotFoundMessageTarget) this.addressNotFoundMessageTarget.setAttribute("hidden", "hidden");
    fetch("/geocode", {
      method: "POST",
      headers: { "X-CSRF-Token": this.token },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.length > 0) {
          const [lat, lng] = data;
          this.mapTarget.setAttribute("data-location-latitude-value", lat);
          this.mapTarget.setAttribute("data-location-longitude-value", lng);
          this.latitudeTarget.value = lat;
          this.longitudeTarget.value = lng;
        } else {
          this.addressTarget.dataset.error = 'true';
          if(this.hasMapTarget) this.mapTarget.dataset.error = 'true';
          if(this.hasAddressNotFoundMessageTarget) this.addressNotFoundMessageTarget.removeAttribute("hidden");
        }
      })
      .catch((err) => {
        handleError(err, this.identifier);
      })
      .finally(this.hideSpinnerAndShowIcon.bind(this));
  }
  
  onAddressBlur(e) {
    this.hideSuggestions();
    this.hideClearInputButton();
  }
  
  onAddressFocus(e) {
    if(this.addressTarget.value && !this.selectedSuggestion && this.interacted && !this.isManuallySetting) {
      this.showSuggestions();
    }
    if(this.addressTarget.value !== "") {
      this.showClearInputButton();
    } else {
      this.hideClearInputButton();
    }
  }
  
  onAddressChange(e) {
    this.address = e.target.value;
    this.selectedSuggestion = false;
    this.interacted = true;
    if(this.addressTarget.value !== "") this.showClearInputButton();
    if(this.isManuallySetting) return;
    this.fetchSuggestions(e.target.value);
  }
  
  clearInput(e) {
    e.preventDefault();
    this.addressTarget.value = "";
    this.address = "";
    this.clearSuggestions();
    this.hideClearInputButton();
  }
  
  showClearInputButton() {
    if(!this.spinnerTarget.classList.contains('d-none')) return;
    this.clearIconTarget.classList.remove('d-none');
    this.geoIconTarget.classList.add('d-none');
  }
  
  hideClearInputButton() {
    this.clearIconTarget.classList.add('d-none');
    this.geoIconTarget.classList.remove('d-none');
    this.spinnerTarget.classList.add('d-none');
  }
  
  fetchSuggestions(address) {
    if(this.address === "") {
      this.hideSuggestions();
      return;
    }
    clearTimeout(this.addressTimeout);
    this.addressTimeout = setTimeout(this.fetchSuggestionsRequest.bind(this), this.ADDRESS_SEARCH_DELAY);
  }
  
  hideSuggestionsIfClickedOutside(e) {
    if(!this.suggestionsContainerTarget.contains(e.target) &&
       !this.addressTarget.contains(e.target) &&
       !this.addressWrapperTarget.contains(e.target)
    ) {
      this.hideSuggestions();
    }
  }
  
  hideSuggestionsIfEscapePressed(e) {
    if(e.key === 'Escape') {
      this.hideSuggestions();
    }
  }
  
  showUseCurrentSuggestion() {
    this.showSuggestions();
    this.showCurrentUseAddress();
  }
  
  showCurrentUseAddress() {
    const useCurrentSuggestionLink = this.suggestionsContainerTarget.querySelector('button[data-is-use-option="true"]');
    if(useCurrentSuggestionLink) {
      const span = useCurrentSuggestionLink.querySelector('span');
      span.innerText = `Use "${this.address}"`;
    }
  }
  
  clearSuggestions() {
    this.showCurrentUseAddress();
    const suggestions = this.suggestionsContainerTarget.querySelectorAll('button.networks--address-suggestion:not([data-is-use-option="true"])');
    suggestions.forEach(suggestion => suggestion.remove());
    this.hideSuggestions();
  }
  
  showSuggestions() {
    if(this.hasSuggestionsContainerTarget) {
      this.showCurrentUseAddress();
      this.suggestionsContainerTarget.removeAttribute('hidden');
    }
    window.addEventListener('click', this.hideSuggestionsIfClickedOutside.bind(this));
    window.addEventListener('keydown', this.hideSuggestionsIfEscapePressed.bind(this));
  }
  
  hideSuggestions() {
    if(this.hasSuggestionsContainerTarget) {
      this.suggestionsContainerTarget.setAttribute('hidden', 'hidden');
    }
    window.removeEventListener('click', this.hideSuggestionsIfClickedOutside.bind(this));
    window.removeEventListener('keydown', this.hideSuggestionsIfEscapePressed.bind(this));
  }
  
  handlePinMoved(e) {
    const { coordinates } = e.detail;
    this.latitudeTarget.value = coordinates.lat;
    this.longitudeTarget.value = coordinates.lng;
    this.mapTarget.setAttribute("data-location-latitude-value", coordinates.lat);
    this.mapTarget.setAttribute("data-location-longitude-value", coordinates.lng);
    this.autofillAddress(coordinates.lat, coordinates.lng);
    this.hideClearInputButton();
  }
  
  onLatitudeChange(e) {
    if (!isNaN(Number(e.target.value))) {
      this.mapTarget.setAttribute(
        "data-location-latitude-value",
        e.target.value
      );
    }
    this.autofillAddress(e.target.value, this.longitudeTarget.value);
  }

  onLongitudeChange(e) {
    if (!isNaN(Number(e.target.value))) {
      this.mapTarget.setAttribute(
        "data-location-longitude-value",
        e.target.value
      );
    }
    this.autofillAddress(this.latitudeTarget.value, e.target.value);
  }

  onManualChange(e) {
    const toggableElements = [
      ...this.conditionalTargets,
      this.latitudeTarget,
      this.longitudeTarget,
    ];
    const isReadOnly = !e.target.checked;
    toggableElements.forEach((element) => {
      element.classList.toggle("text-muted");
      if (isReadOnly) {
        element.setAttribute("readonly", isReadOnly);
        // we might have more than one (hidden modals for creation/edition)
        const locationAddressElements = this.addressTargets;
        let currentAddressElementValue;
        for (
          let i = 0;
          !currentAddressElementValue && i < locationAddressElements.length;
          i++
        ) {
          if (locationAddressElements[i].offsetParent)
            currentAddressElementValue = locationAddressElements[i].value;
        }
        // force lat/long to be those from given address, if present
        if (currentAddressElementValue)
          this.fetchGeoData(currentAddressElementValue, this);
      } else {
        element.removeAttribute("readonly");
      }
    });
  }

  networksOnManualChange(e) {
    this.isManuallySetting = e.target.checked;
    if(e.target.checked) {
      this.showLatLngFields();
    } else {
      this.hideLatLngFields();
    }
  }

  showLatLngFields() {
    this.manualLatLongWrapperTarget.removeAttribute("hidden");
  }

  hideLatLngFields() {
    this.manualLatLongWrapperTarget.setAttribute("hidden", true);
  }

  clearLocationModalAndClose() {
    this.nameTarget.value = null;
    this.addressTarget.value = null;
    this.latitudeTarget.value = null;
    this.longitudeTarget.value = null;
    this.manualLatLongTarget.checked = false;
    this.expectedUploadTarget.value = null;
    this.expectedDownloadTarget.value = null;
    $("#new_location_modal").modal("hide");
  }
}
