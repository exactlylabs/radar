import { Controller } from "@hotwired/stimulus"

export default class extends Controller {

  connect() {}

  selectAccount(e) {
    // prevent <i> or <a> from switching account on click
    if(e.target.localName === 'i' || e.target.localName === 'a') {
      return false;
    }
    const selectedAccountId = e.target.id.split('@')[1];
    const cookieArray = document.cookie.split(';');
    let currentAccount;
    cookieArray.forEach(cookie => {
      if(cookie.trim().includes('radar_current_account_id')) {
        currentAccount = cookie.split('=')[1];
      }
    });
    if(currentAccount && currentAccount === selectedAccountId) return;
    document.cookie = `radar_current_account_id=${selectedAccountId}; path=/`;
    window.location.reload();
  }

}