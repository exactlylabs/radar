import { Controller } from "@hotwired/stimulus";

//Using a global variable to prevent console error:
//`Map container is already initialized`
let map;

export default class extends Controller {
  disconnect() {
    // clear map so it can get properly initialized on re-render
    map = null;
  }

  connect() {
    if (!document.querySelector("#map")) return; // don't try to initialize a map if the <div id="map"> is not present on the screen
    if (!map) map = L.map("map").setView([51.505, -0.09], 13); // only initialize the map if it has not been yet

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    var markers = [];
    const locations = document.querySelectorAll(".location-row");
    locations.forEach((l) => {
      const online = l.getAttribute("data-location-online") === "true";
      const latitude = l.getAttribute("data-location-latitude");
      const longitude = l.getAttribute("data-location-longitude");
      const locationId = l.getAttribute("data-location-id");
      const locationName = l.getAttribute("data-location-name");
      const latestDownload = l.getAttribute("data-location-download")
        ? parseFloat(l.getAttribute("data-location-download"))
        : -1;
      const latestUpload = l.getAttribute("data-location-upload")
        ? parseFloat(l.getAttribute("data-location-upload"))
        : -1;
      const downloadDiff = l.getAttribute("data-location-download-diff");
      const uploadDiff = l.getAttribute("data-location-upload-diff");
      const expectedDownload = l.getAttribute(
        "data-location-expected-download"
      );
      const expectedUpload = l.getAttribute("data-location-expected-upload");
      var icon = L.divIcon({
        html: `<?xml version="1.0" encoding="utf-8"?>
                <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
                <span class="svg-icon svg-icon-2hx">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" enable-background="new 0 0 365 560">
                    <path style="fill: ${
                      online ? "#00AEEF" : "#f1416c"
                    }" opacity="1" d="M18.0624 15.3453L13.1624 20.7453C12.5624 21.4453 11.5624 21.4453 10.9624 20.7453L6.06242 15.3453C4.56242 13.6453 3.76242 11.4453 4.06242 8.94534C4.56242 5.34534 7.46242 2.44534 11.0624 2.04534C15.8624 1.54534 19.9624 5.24534 19.9624 9.94534C20.0624 12.0453 19.2624 13.9453 18.0624 15.3453Z"/>
                    <path style="white: transparent" d="M12.0624 13.0453C13.7193 13.0453 15.0624 11.7022 15.0624 10.0453C15.0624 8.38849 13.7193 7.04535 12.0624 7.04535C10.4056 7.04535 9.06241 8.38849 9.06241 10.0453C9.06241 11.7022 10.4056 13.0453 12.0624 13.0453Z"/>
                  </svg>
                </span>`,
        className: online ? "location--online" : "location--offline",
        iconSize: [36, 43],
        iconAnchor: [10, 30],
        popupAnchor: [0, -30],
      });
      const popupElement = `
         <div class="d-flex flex-column justify-content-center align-items-center p-1 w-275px">
            <div class="d-flex flex-row w-100">
                <div class="d-flex align-items-center justify-content-center me-5" 
                     style="border-radius:50%; background-color: ${
                       online ? "#f1faff" : "#fff5f7"
                     }; min-width: 42px; width: 42px; min-height: 42px; height: 42px">
                  <span class="svg-icon svg-icon-1 svg-icon-${
                    online ? "primary" : "danger"
                  }" style="position: relative;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path opacity="0.3" d="M18.0624 15.3453L13.1624 20.7453C12.5624 21.4453 11.5624 21.4453 10.9624 20.7453L6.06242 15.3453C4.56242 13.6453 3.76242 11.4453 4.06242 8.94534C4.56242 5.34534 7.46242 2.44534 11.0624 2.04534C15.8624 1.54534 19.9624 5.24534 19.9624 9.94534C20.0624 12.0453 19.2624 13.9453 18.0624 15.3453Z" fill="${
                        online ? "#00AEEF" : "#f1416c"
                      }"/>
                      <path d="M12.0624 13.0453C13.7193 13.0453 15.0624 11.7022 15.0624 10.0453C15.0624 8.38849 13.7193 7.04535 12.0624 7.04535C10.4056 7.04535 9.06241 8.38849 9.06241 10.0453C9.06241 11.7022 10.4056 13.0453 12.0624 13.0453Z" fill="black"/>
                    </svg>
                  </span>
                </div>
                <div class="text-start">
                    <a href="/locations/${locationId}" style="font-weight: bolder; font-size: 15px; color: #3f4254; text-decoration: none">${locationName}</a>
                    <div style="color: #b5b5c3; font-size: 14px; font-weight: bold">${
                      online ? "Online" : "Offline"
                    }</div>
                </div>
            </div>
           <div class="d-flex flex-row justify-content-between border-bottom-dashed border-gray-300 w-100 p-3 pt-7">
            <div class="d-flex flex-column justify-content-start text-start">
                <div style="font-size: 14px; color: #5e6278; font-weight: bold; margin-bottom: 2px">Avg. Download</div>
                <div style="font-size: 13px; color: #b5b5c3; font-weight: bold;">Expected: ${expectedDownload} Mbps.</div>
            </div>
            <div class="d-flex flex-column text-end">
                <div style="color: #181c33; font-size: 14px; font-weight: bold; margin-bottom: 2px">${
                  latestDownload > 0 ? latestDownload.toFixed(3) + " Mbps" : "-"
                }</div>
                <div style="color: ${
                  downloadDiff.includes("-") ? "#f1416c" : "#50cd89"
                }">${downloadDiff}</div>
            </div>
           </div>
           <div class="d-flex flex-row justify-content-between border-bottom-dashed border-gray-300 w-100 p-3">
            <div class="d-flex flex-column justify-content-start text-start">
                <div style="font-size: 14px; color: #5e6278; font-weight: bold; margin-bottom: 2px">Avg. Upload</div>
                <div style="font-size: 13px; color: #b5b5c3; font-weight: bold;">Expected: ${expectedUpload} Mbps.</div>
            </div>
            <div class="d-flex flex-column text-end">
                <div style="color: #181c33; font-size: 14px; font-weight: bold; margin-bottom: 2px">${
                  latestUpload > 0 ? latestUpload.toFixed(3) + " Mbps" : "-"
                }</div>
                <div style="color: ${
                  uploadDiff.includes("-") ? "#f1416c" : "#50cd89"
                }">${uploadDiff}</div>
            </div>
           </div>
           <a href="/locations/${locationId}" class="btn btn-light-primary w-100 mt-5" type="button">View Location</a>
         </div>`;
      var marker = L.marker([latitude, longitude], { icon: icon })
        .addTo(map)
        .bindPopup(popupElement);
      markers.push(marker);
    });

    var group = new L.featureGroup(markers);
    map.fitBounds(group.getBounds());

    this.observer = new ResizeObserver((entries) => {
      if (
        entries.length > 0 &&
        entries[0].contentRect.width > 0 &&
        entries[0].contentRect.height > 0
      ) {
        map.fitBounds(group.getBounds());
      }
    });

    this.observer.observe(document.querySelector("#map"));
  }
}
