import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  static values = {
    latitude: Number,
    longitude: Number,
  };

  connect() {
    // Wait until target div is bigger than 0x0
    this.observer = new ResizeObserver((entries) => {
      if (
        entries.length > 0 &&
        entries[0].contentRect.width > 0 &&
        entries[0].contentRect.height > 0
      ) {
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
    this.latitudeValue = this.latitudeValue || 40.566296; // Specific coordinates to fallback onto almost center point of the US
    this.longitudeValue = this.longitudeValue || -97.264547;

    this.map = L.map(this.element).setView(
      [this.latitudeValue, this.longitudeValue],
      13
    );

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.addOrUpdateMarker();
  }

  addOrUpdateMarker() {
    if (this.map === undefined) {
      return;
    }

    if (this.marker) {
      this.marker.remove();
    }

    if(isNaN(this.latitudeValue) || isNaN(this.longitudeValue)) {
      this.latitudeValue = 40.566296; // Specific coordinates to fallback onto almost center point of the US
      this.longitudeValue = -97.264547;
    }

    if (this.element.getAttribute("data-draggable") === "true") {
      this.marker = L.marker([this.latitudeValue, this.longitudeValue], {
        draggable: true,
      });
      this.marker.on("dragend", (e) => this.updateMapPosition(e));
    } else {
      this.marker = L.marker([this.latitudeValue, this.longitudeValue]);
    }
    this.marker.addTo(this.map);
    this.map.setView([this.latitudeValue, this.longitudeValue], 13);
  }

  updateMapPosition(e) {
    const marker = e.target;
    const { lat, lng } = marker.getLatLng();
    this.latitudeValue = lat;
    this.longitudeValue = lng;
    document.querySelector("#location_latitude").value = lat;
    document.querySelector("#location_longitude").value = lng;
    this.addOrUpdateMarker();
  }

  latitudeValueChanged() {
    this.addOrUpdateMarker();
  }

  longitudeValueChanged() {
    this.addOrUpdateMarker();
  }
}
