import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = {
    latitude: Number,
    longitude: Number
  }

  connect() {
    // Wait until target div is bigger than 0x0
    this.observer = new ResizeObserver((entries) => {
      if (entries.length > 0 &&
          entries[0].contentRect.width > 0 &&
          entries[0].contentRect.height > 0) {
        this.display();
      }
    });

    this.observer.observe(this.element);
  }

  disconnect() {
    this.observer.disconnect();
  }

  display() {
    if (this.drawn === true) {
      return;
    }
    this.drawn = true;

    this.map = L.map(this.element)
               .setView([this.latitudeValue, this.longitudeValue], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.addOrUpdateMarker();
  }

  addOrUpdateMarker() {
    if(this.map === undefined) {
      return;
    }

    if(this.marker) {
      this.marker.remove();
    }

    this.marker = L.marker([this.latitudeValue, this.longitudeValue]);
    this.marker.addTo(this.map);
    this.map.setView([this.latitudeValue, this.longitudeValue], 13);
  }

  latitudeValueChanged() {
    this.addOrUpdateMarker();
  }

  longitudeValueChanged() {
    this.addOrUpdateMarker();
  }
}
