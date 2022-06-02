import { Controller } from '@hotwired/stimulus'

export default class extends Controller {
  connect() {
    var map = L.map("map").setView([51.505, -0.09], 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    var markers = [];
    const locations = document.querySelectorAll('.location-row');
    console.log(locations);
    locations.forEach(l => {
      const online = l.getAttribute('data-location-online') === 'true';
      const latitude = l.getAttribute('data-location-latitude');
      const longitude = l.getAttribute('data-location-longitude');
      const locationId = l.getAttribute('data-location-id');
      const locationName = l.getAttribute('data-location-name');
      const latestDownload = l.getAttribute('data-location-download') ? parseFloat(l.getAttribute('data-location-download')) : -1;
      const latestUpload = l.getAttribute('data-location-upload') ? parseFloat(l.getAttribute('data-location-upload')) : -1;
      var icon = L.divIcon({
        html: `<?xml version="1.0" encoding="utf-8"?>
                <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
                <span class="svg-icon svg-icon-2hx">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" enable-background="new 0 0 365 560">
                    <path style="fill: #00AEEF" opacity="1" d="M18.0624 15.3453L13.1624 20.7453C12.5624 21.4453 11.5624 21.4453 10.9624 20.7453L6.06242 15.3453C4.56242 13.6453 3.76242 11.4453 4.06242 8.94534C4.56242 5.34534 7.46242 2.44534 11.0624 2.04534C15.8624 1.54534 19.9624 5.24534 19.9624 9.94534C20.0624 12.0453 19.2624 13.9453 18.0624 15.3453Z"/>
                    <path style="white: transparent" d="M12.0624 13.0453C13.7193 13.0453 15.0624 11.7022 15.0624 10.0453C15.0624 8.38849 13.7193 7.04535 12.0624 7.04535C10.4056 7.04535 9.06241 8.38849 9.06241 10.0453C9.06241 11.7022 10.4056 13.0453 12.0624 13.0453Z"/>
                  </svg>
                </span>`,
        className: online ? "location--online" : "location--offline",
        iconSize: [20, 30],
        iconAnchor: [10, 30],
        popupAnchor: [0, -30],
      });
      var marker = L.marker([latitude, longitude], {icon: icon}).addTo(map)
        .bindPopup(`<a href="/locations/${locationId}">${locationName}</a>
          <br />${online ? "Online" : "Offline"}<br />
          Latest Download: ${latestDownload > 0 ? latestDownload.toFixed(3) : '-'} mbps<br />
          Latest Upload: ${latestUpload > 0 ? latestUpload.toFixed(3) : '-'} mbps`);
      markers.push(marker);
    });

    var group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds());

    this.observer = new ResizeObserver((entries) => {
      if (entries.length > 0 &&
          entries[0].contentRect.width > 0 &&
          entries[0].contentRect.height > 0) {
        map.fitBounds(group.getBounds());
      }
    });

    this.observer.observe(document.querySelector('#map'));
  }
}