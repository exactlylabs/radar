import { add, Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "address", "map", "latitude", "longitude", "manual_lat_long" ];

  connect() {
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
      });
    }.bind(this), 1000);
  }

  onAddressChange(e) {
    const manualSwitchElements = document.querySelectorAll('[id=location_manual_lat_long]');
    let isSwitchOn = undefined;
    for(let i = 0 ; isSwitchOn === undefined && i < manualSwitchElements.length ; i++) {
      if(manualSwitchElements[i].offsetParent) isSwitchOn = manualSwitchElements[i].checked;
    }
    if(isSwitchOn) return; // If switch is on, prevent geo searching
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
}