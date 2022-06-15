import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "name", "address", "map", "latitude", "longitude", "manualLatLong", "automaticLocation", "expectedDownload", "expectedUpload", "geoIcon", "spinner" ];

  connect() {
    const lat = this.latitudeTarget.value ? this.latitudeTarget.value : geoplugin_latitude();
    const long = this.longitudeTarget.value ? this.longitudeTarget.value : geoplugin_longitude();
    this.mapTarget.setAttribute('data-location-latitude-value', lat);
    this.mapTarget.setAttribute('data-location-longitude-value', long);
    this.spinnerTarget.classList.add("d-none");
    this.geoIconTarget.classList.remove("d-none");
  }

  autofillAddress(lat, lon) {
    let that = this;
    clearTimeout(this.addressTimeout);
    this.addressTimeout = setTimeout(function() {
      let formData = new FormData();
      formData.append("query", `[${lat}, ${lon}]`);
      fetch('/reverse_geocode', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => that.addressTarget.value = `${data[1]}, ${data[0]}`)
      .catch(err => {
        // TODO: Integrate Sentry reporting!
        console.error(err);
      })
      .finally(() => {
        this.spinnerTarget.classList.add("d-none");
        this.geoIconTarget.classList.remove("d-none");
      });
    }.bind(this), 1000)
  }

  autofillGeoData() {
    this.spinnerTarget.classList.remove("d-none");
    this.geoIconTarget.classList.add("d-none");
    if('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const userGeoLatitude = position.coords.latitude;
          const userGeoLongitude = position.coords.longitude;
          this.latitudeTarget.value = userGeoLatitude;
          this.longitudeTarget.value = userGeoLongitude;
          this.mapTarget.setAttribute('data-location-latitude-value', userGeoLatitude);
          this.mapTarget.setAttribute('data-location-longitude-value', userGeoLongitude);
          this.autofillAddress(userGeoLatitude, userGeoLongitude);
          this.automaticLocationTarget.value = true;
        }
      )
    }
  }

  fetchGeoData(address) {
    let that = this;
    clearTimeout(this.addressTimeout);
    this.addressTimeout = setTimeout(function() {
      let formData = new FormData();
      formData.append("address", address);
      fetch('/geocode', {
        method: 'POST',
        body: formData
      })
      .then(response => response.json())
      .then(data => {
        that.mapTarget.setAttribute('data-location-latitude-value', data[0]);
        that.mapTarget.setAttribute('data-location-longitude-value', data[1]);
        this.latitudeTarget.value = data[0];
        this.longitudeTarget.value = data[1];
      })
      .catch(err => {
        // TODO: Integrate Sentry reporting!
        console.error(err);
      })
    }.bind(this), 1000);
  }

  onAddressChange(e) {
    const manualSwitchElements = document.querySelectorAll('[id=location_manual_lat_long]');
    let isSwitchOn = undefined;
    for(let i = 0 ; isSwitchOn === undefined && i < manualSwitchElements.length ; i++) {
      if(manualSwitchElements[i].offsetParent) isSwitchOn = manualSwitchElements[i].checked;
    }
    if(isSwitchOn || this.automaticLocationTarget.value === 'true') return; // If switch is on, prevent geo searching
    this.fetchGeoData(e.target.value);
  }

  onLatitudeChange(e) {
    if (!isNaN(Number(e.target.value))) {
      this.mapTarget.setAttribute('data-location-latitude-value', e.target.value);
    }
  }

  onLongitudeChange(e) {
    if (!isNaN(Number(e.target.value))) {
      this.mapTarget.setAttribute('data-location-longitude-value', e.target.value);
    }
  }

  onManuallyChange(e) {
    const conditionalClassElements = document.getElementsByClassName('conditional');
    const isReadOnly = !e.target.checked;
    conditionalClassElements.forEach(element => {
      element.classList.toggle('text-muted');
      if(isReadOnly) {
        element.setAttribute('readonly', isReadOnly);
        // we might have more than one (hidden modals for creation/edition)
        const locationAddressElements = document.querySelectorAll('[id=location_address]');
        let currentAddressElementValue;
        for(let i = 0 ; !currentAddressElementValue && i < locationAddressElements.length ; i++) {
          if(locationAddressElements[i].offsetParent) currentAddressElementValue = locationAddressElements[i].value;
        }
        // force lat/long to be those from given address, if present
        if(currentAddressElementValue) this.fetchGeoData(currentAddressElementValue, this);
      } else {
        element.removeAttribute('readonly');
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
    $('#new_location_modal').modal('hide');
  }
}