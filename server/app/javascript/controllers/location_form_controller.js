import { add, Controller } from "@hotwired/stimulus";
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
  ];

  connect() {
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
    let that = this;
    clearTimeout(this.addressTimeout);
    this.addressTimeout = setTimeout(
      function () {
        let formData = new FormData();
        formData.append("address", address);
        fetch("/geocode", {
          method: "POST",
          body: formData,
        })
          .then((response) => response.json())
          .then((data) => {
            that.mapTarget.setAttribute(
              "data-location-latitude-value",
              data[0]
            );
            that.mapTarget.setAttribute(
              "data-location-longitude-value",
              data[1]
            );
            this.latitudeTarget.value = data[0];
            this.longitudeTarget.value = data[1];
          })
          .catch((err) => {
            handleError(err, this.identifier);
          });
      }.bind(this),
      1000
    );
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
