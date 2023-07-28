import { Controller } from "@hotwired/stimulus";
import handleError from "./error_handler_controller";

export default class extends Controller {
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
    "spinner",
    "conditional",
    "addressWrapper",
    "manualLatLongWrapper"
  ];

  connect() {
    this.address = this.addressTarget.value;
    if (!this.latitudeTarget?.value && !this.longitudeTarget?.value) {
      fetch("/geocode", { method: "POST" })
        .then((res) => res.json())
        .then((res) => {
          this.mapTarget.setAttribute("data-location-latitude-value", res[0]);
          this.mapTarget.setAttribute("data-location-longitude-value", res[1]);
          this.spinnerTarget.classList.add("d-none");
          this.geoIconTarget.classList.remove("d-none");
        })
        .catch((err) => {
          handleError(err, this.identifier);
        });
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

  autofillAddress(lat, lon) {
    let that = this;
    clearTimeout(this.addressTimeout);
    this.addressWrapperTarget.style.border = 'none';
    this.addressWrapperTarget.style.borderRadius = 'none';
    this.addressTimeout = setTimeout(
      function () {
        let formData = new FormData();
        formData.append("query", `[${lat}, ${lon}]`);
        fetch("/reverse_geocode", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => (that.addressTarget.value = `${data[1]}, ${data[0]}`))
          .catch((err) => {
            handleError(err, this.identifier);
          })
          .finally(() => {
            this.spinnerTarget.classList.add("d-none");
            this.geoIconTarget.classList.remove("d-none");
          });
      }.bind(this),
      1000
    );
  }

  autofillGeoData() {
    this.addressWrapperTarget.style.border = 'none';
    this.addressWrapperTarget.style.borderRadius = 'none';
    this.spinnerTarget.classList.remove("d-none");
    this.geoIconTarget.classList.add("d-none");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const userGeoLatitude = position.coords.latitude;
        const userGeoLongitude = position.coords.longitude;
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
        this.autofillAddress(userGeoLatitude, userGeoLongitude);
      });
    }
  }

  fetchGeoData(address) {
    this.address = address;
    clearTimeout(this.addressTimeout);
    this.addressTimeout = setTimeout(this.fetch.bind(this), 1000);
  }

  fetch() {
    let formData = new FormData();
    formData.append("address", this.address);
    fetch("/geocode", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        // fallback location to center of the US
        const defaultLatitude = 40.566296;
        const defaultLongitude = -97.264547;
        let coordinates = [defaultLatitude, defaultLongitude];
        if (data.length > 0) {
          this.addressWrapperTarget.style.border = 'none';
          this.addressWrapperTarget.style.borderRadius = 'none';
          coordinates = data;
        } else {
          this.addressWrapperTarget.style.border = 'solid 1px red';
          this.addressWrapperTarget.style.borderRadius = '6px';
        }
        this.mapTarget.setAttribute(
          "data-location-latitude-value",
          coordinates[0]
        );
        this.mapTarget.setAttribute(
          "data-location-longitude-value",
          coordinates[1]
        );
        this.latitudeTarget.value = coordinates[0];
        this.longitudeTarget.value = coordinates[1];
      })
      .catch((err) => {
        handleError(err, this.identifier);
      });
  }

  onAddressChange(e) {
    const isSwitchOn = this.manualLatLongTarget.checked;
    if (isSwitchOn) return; // If switch is on, prevent geo searching
    this.fetchGeoData(e.target.value);
  }

  onLatitudeChange(e) {
    if (!isNaN(Number(e.target.value))) {
      this.mapTarget.setAttribute(
        "data-location-latitude-value",
        e.target.value
      );
    }
  }

  onLongitudeChange(e) {
    if (!isNaN(Number(e.target.value))) {
      this.mapTarget.setAttribute(
        "data-location-longitude-value",
        e.target.value
      );
    }
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
