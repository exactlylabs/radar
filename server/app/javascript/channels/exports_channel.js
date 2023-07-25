import consumer from "./consumer";
import { emitCustomEvent } from "../eventsEmitter";

consumer.subscriptions.create({ channel: 'ExportsChannel' }, {
  // Called when there is an incoming message on the queue
  received(data) {
    if(typeof data !== 'object') return;
    if('has_pending_downloads' in data && data.has_pending_downloads) {
      const progressElement = document.getElementById('pending-downloads-progress');
      if(progressElement && progressElement.style.display === 'none') progressElement.style.display = 'block';
    } else if('has_pending_downloads' in data && !data.has_pending_downloads) {
      const pending = document.getElementsByClassName('pending');
      const progressElement = document.getElementById('pending-downloads-progress');
      const tooltipElement = document.getElementById('downloads-tooltip');
      if(progressElement && progressElement.style.display === 'block') progressElement.style.display = 'none';
      if(tooltipElement && tooltipElement.style.display !== 'none') tooltipElement.style.display = 'none';
      if(pending && pending.length > 0) {
        const button = pending[0];
        if(button) {
          button.classList.remove('pending');
          button.classList.remove('disabled');
        }
      }
    } else if('progress' in data) {
      const {progress} = data;
      emitCustomEvent('showProgress', { detail: { progress } });
    } else if('url' in data){
      // Fire an automatic download once the file's url is available
      const link = document.createElement("a");
      link.download = name;
      link.href = data.url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
});