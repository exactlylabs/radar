import { Controller } from "@hotwired/stimulus";
import onlineLocationIcon from "../../assets/images/location-online-icon.png";
import offlineLocationIcon from "../../assets/images/location-offline-icon.png";
import { MAPBOX_URL, getPopupElement } from "../map";

//Using a global variable to prevent console error:
//`Map container is already initialized`
let map;

export default class extends Controller {

  static targets = ["locationRow"];

  connect() {
    if (!document.querySelector("#map")) return; // don't try to initialize a map if the <div id="map"> is not present on the screen
    
    // Try and prevent having a re-initialization of the map
    if(map) {
      map.off();
      map.remove();
    }
    map = L.map("map", { zoomControl: false }).setView([51.505, -0.09], 13);

    // Add zoom control in desired position
    L.control.zoom({
      position: 'bottomleft'
    }).addTo(map);

    L.tileLayer(MAPBOX_URL, {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    this.markers = null;

    this.populateLocationsMap();

    // Limit map bounds to display America + Africa + Western Europe mainly
    const topLeftBoundingPoint = L.latLng(80.011830, -172.614055);
    const bottomRightBoundingPoint = L.latLng(-65.116127, 53.220752);
    const bounds = L.latLngBounds(topLeftBoundingPoint, bottomRightBoundingPoint);

    let group;
    if(this.markers.length > 0) {
      group = new L.featureGroup(this.markers);
      map.fitBounds(group.getBounds());
    } else {
      map.fitBounds(bounds);
    }

    map.setMaxBounds(bounds);
    map.setMinZoom(3);
    map.on('drag', () => {map.panInsideBounds(bounds, {animate: false})});

    this.observer = new ResizeObserver((entries) => {
      if (
        entries.length > 0 &&
        entries[0].contentRect.width > 0 &&
        entries[0].contentRect.height > 0 &&
        !!map
      ) {
        if(!!group) map.fitBounds(group.getBounds());
        else map.fitBounds(bounds);
      }
    });

    this.observer.observe(document.querySelector("#map"));
  }

  renderLocationsMap() {
    if (!document.querySelector("#map") || !map) return;
    this.populateLocationsMap();
  }

  populateLocationsMap() {
    // clear map so it can get properly initialized on re-render
    if(map && this.markers) {
      this.markers.forEach(m => map.removeLayer(m));
    }

    this.markers = [];

    const locations = this.locationRowTargets;
    if(!locations || locations.length === 0) return;
    
    locations.forEach((l) => {
      const {
        locationOnline,
        locationLatitude,
        locationLongitude,
      } = l.dataset;

      const online = locationOnline === "true";

      const icon = L.icon({
        iconUrl: online ? onlineLocationIcon : offlineLocationIcon,
        iconSize: [36, 36],
        iconAnchor: [10, 30],
        popupAnchor: [7, -30],
      });

      const popupElement = getPopupElement(l);

      const marker = L
        .marker([locationLatitude, locationLongitude], { icon: icon })
        .addTo(map)
        .bindPopup(popupElement);

      this.markers.push(marker);
    });
  }
}
