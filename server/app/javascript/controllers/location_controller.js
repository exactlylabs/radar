import { Controller } from "@hotwired/stimulus";
import { MAPBOX_URL } from "../map";
import neutralLocationIcon from '../../assets/images/location-neutral-icon.png';

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

    // Limit map bounds to display America + Africa + Western Europe mainly
    const topLeftBoundingPoint = L.latLng(80.011830, -172.614055);
    const bottomRightBoundingPoint = L.latLng(-65.116127, 53.220752);
    const bounds = L.latLngBounds(topLeftBoundingPoint, bottomRightBoundingPoint);
    this.map.setMaxBounds(bounds);
    this.map.setMinZoom(3);
    this.map.on('drag', () => {this.map.panInsideBounds(bounds, {animate: false})});

    L.tileLayer(MAPBOX_URL, {
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

    const icon = L.icon({
      iconUrl: neutralLocationIcon,
      iconSize: [30, 36],
      iconAnchor: [10, 30],
      popupAnchor: [7, -30],
    });

    if (this.element.getAttribute("data-draggable") === "true") {
      this.marker = L.marker([this.latitudeValue, this.longitudeValue], {
        draggable: true,
        icon: icon
      });
      this.marker.on("dragend", (e) => this.updateMapPosition(e));
    } else {
      this.marker = L.marker([this.latitudeValue, this.longitudeValue], {icon});
    }
    this.marker.addTo(this.map);
    this.map.setView([this.latitudeValue, this.longitudeValue], this.map.zoom);
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
