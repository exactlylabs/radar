/*
  The idea behind this method is to centralize alert snackbar handling for
  error responses thrown inside Controllers involving HTTP requests.
  Basic usage example:
    ...
    .then(res => if(...) showAlert(res.msg);
    ...
 */
export default function showAlert(msg) {
  const alert = `
    <div class="alert alert-dismissible alert-danger d-flex flex-row align-items-center p-5" style="position: fixed; bottom: 75px; left: 140px; z-index: 5">
      <span class="svg-icon svg-icon-danger svg-icon-2hx me-3">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect opacity="0.3" x="2" y="2" width="20" height="20" rx="10" fill="currentColor"/>
          <rect x="11" y="17" width="7" height="2" rx="1" transform="rotate(-90 11 17)" fill="currentColor"/>
          <rect x="11" y="9" width="2" height="2" rx="1" transform="rotate(-90 11 9)" fill="currentColor"/>
        </svg>
      </span>
      <h4 class="text-danger mb-0">${msg}</h4>
      <button type="button" class="btn btn-icon ms-10" data-bs-dismiss="alert">
              <span class="svg-icon svg-icon-gray-400 svg-icon-2hx">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect opacity="0.3" x="2" y="2" width="20" height="20" rx="5" fill="currentColor"/>
                  <rect x="7" y="15.3137" width="12" height="2" rx="1" transform="rotate(-45 7 15.3137)" fill="currentColor"/>
                  <rect x="8.41422" y="7" width="12" height="2" rx="1" transform="rotate(45 8.41422 7)" fill="currentColor"/>
                </svg>
              </span>
      </button>
    </div>
    `;
  document.body.appendChild(htmlToElement(alert));
}

function htmlToElement(html) {
  const template = document.createElement('template');
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.firstChild;
}