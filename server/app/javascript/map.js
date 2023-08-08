import downloadIcon from "../assets/images/download-icon.png";
import uploadIcon from "../assets/images/upload-icon.png";
import onlineLocationIcon from "../assets/images/location-online-icon.png";
import offlineLocationIcon from "../assets/images/location-offline-icon.png";

const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZXVnZWRhbW0iLCJhIjoiY2xqcmpxNGltMGR4MDNzbzdxYmpyd3R0NCJ9.UoaaSYGn1xA9wlT8Rr0BLw';
const MAPBOX_STYLE_URL = 'https://api.mapbox.com/styles/v1/eugedamm/cljrixdvb00v301qvb4m73x62/tiles/{z}/{x}/{y}';

export const MAPBOX_URL = `${MAPBOX_STYLE_URL}?access_token=${MAPBOX_ACCESS_TOKEN}`;

export function getPopupElement(location) {

  const {
    locationId,
    locationName,
    locationOnline,
    locationDownload,
    locationUpload,
    locationExpectedDownload,
    locationExpectedUpload,
    locationDownloadDiff,
    locationUploadDiff
  } = location.dataset;

  const online = locationOnline === 'true';
  const downloadAvg = !!locationDownload ? parseFloat(locationDownload).toFixed(2) : -1;
  const uploadAvg = !!locationUpload ? parseFloat(locationUpload).toFixed(2) : -1;
  const expectedDownload = !!locationExpectedDownload ? parseFloat(locationExpectedDownload) : -1;
  const expectedUpload = !!locationExpectedUpload ? parseFloat(locationExpectedUpload) : -1;
  const downloadDiff = !!locationDownloadDiff ? locationDownloadDiff : '-';
  const uploadDiff = !!locationUploadDiff ? locationUploadDiff : '-';

  return `
      <div class="widgets--location-popup-container">
        <div class="widgets--location-popup-header-container">
          <div class="widgets--location-pin-container me-3" data-online="${online}">
            <img src="${online ? onlineLocationIcon : offlineLocationIcon}" width="20" height="20" />
          </div>
          <h3 class="card-main-title m-0">${locationName}</h3>
          <div class="custom-badge custom-badge--${online ? 'online' : 'offline'} ms-auto me-0">
            ${online ? 'Online' : 'Offline'}
          </div>
        </div>
        <div class="widgets--location-popup-content-container">
          <div class="widgets--location-popup-row">
            <div class="widgets--location-popup-cell">
              <div class="widgets--speed-container">
                <img src="${downloadIcon}" width="16" height="16" />  
                <p class="forms--label m-0">Avg. Download</p>
              </div>
            </div>
            <div class="widgets--location-popup-cell">
              <div class="widgets--speed-container">
                <span class="help-dark-text">${downloadAvg > 0 ? `${downloadAvg} Mbps` : 'Not available'}</span>
                <span class="help-small-text">/</span>
                <span class="help-small-text">${expectedDownload > 0 ? `${expectedDownload} Mbps` : 'Not available'}</span>
              </div>
              <span class="widgets--location-diff-text"
                  data-negative="${!!downloadDiff && downloadDiff.includes('-')}"
                >${!!downloadDiff ? downloadDiff : '-'}</span>
            </div>
          </div>
          <div class="widgets--location-popup-row">
            <div class="widgets--location-popup-cell">
              <div class="widgets--speed-container">
                <img src="${uploadIcon}" width="16" height="16" />  
                <p class="forms--label m-0">Avg. Upload</p>
              </div>
            </div>
            <div class="widgets--location-popup-cell">
              <div class="widgets--speed-container">
                <span class="help-dark-text">${uploadAvg > 0 ? `${uploadAvg} Mbps` : 'Not available'}</span>
                <span class="help-small-text">/</span>
                <span class="help-small-text">${expectedUpload > 0 ? `${expectedUpload} Mbps` : 'Not available'}</span>
              </div>
              <span class="widgets--location-diff-text"
                  data-negative="${!!uploadDiff && uploadDiff.includes('-')}"
                >${!!uploadDiff ? uploadDiff : '-'}</span>
            </div>
          </div>
          <a href="/locations/${locationId}" class="w-100 custom-button custom-button--secondary custom-button--lg">
            View details
          </a>
        </div>
      </div>
    `;
}