import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = [ "address", "map", "latitude", "longitude" ];

  connect() {
  }

  onAddressChange(e) {
    var that = this;
    clearTimeout(this.addressTimeout);
  
    this.addressTimeout = setTimeout(function() {
      let formData = new FormData();
      formData.append("address", e.target.value);

      fetch('/geocode', {
        method: 'POST',
        body: formData
      }).then(response => response.json())
      .then(data => {
        that.mapTarget.setAttribute('data-location-latitude-value', data[0]);
        that.mapTarget.setAttribute('data-location-longitude-value', data[1]);
        this.latitudeTarget.value = data[0];
        this.longitudeTarget.value = data[1];
      });
      
      //?address=${this.addressTarget.value}`)
    }.bind(this), 1000);
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
}