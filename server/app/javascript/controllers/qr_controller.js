import { Controller } from "@hotwired/stimulus";
import { emitCustomEvent } from "../eventsEmitter";
import jsQR from "jsqr";

export default class extends Controller {
  
  static targets = ["canvas", "closeCanvas", "canvasUnderlay"];
  
  connect(){
    this.canvas = this.canvasTarget.getContext("2d");
    this.video = document.createElement("video");
    this.isOpen = false;
  }
  
  openVideoSource() {
    try {
      this.isOpen = true;
      navigator
        .mediaDevices
        .getUserMedia({
          audio: false,
          video: { facingMode: "environment" }
        })
        .then((stream) => {
          this.video.srcObject = stream;
          this.video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
          this.video.setAttribute('autoplay', '');
          this.video.setAttribute('muted', '');
          this.video.setAttribute('playsinline', '')
          this.video.play();
          requestAnimationFrame(this.tick.bind(this));
        })
        .catch(e => { alert(e); });
    } catch (e) {
      alert('open -> ' + e.message);
    }
  }
  
  close() {
    this.isOpen = false;
    this.canvasTarget.hidden = true;
    this.closeCanvasTarget.hidden = true;
    this.canvasUnderlayTarget.hidden = true;
    
    // stop current video stream from webcam on browser
    const stream = this.video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => { track.stop(); });
  }
  
  tick() {
    try {
      if (!this.isOpen) return;
      if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        this.canvasTarget.hidden = false;
        this.closeCanvasTarget.hidden = false;
        this.canvasUnderlayTarget.hidden = false;
        this.canvasTarget.height = this.video.videoHeight;
        this.canvasTarget.width = this.video.videoWidth;
        this.canvas.drawImage(this.video, 0, 0, this.canvasTarget.width, this.canvasTarget.height);
        const imageData = this.canvas.getImageData(0, 0, this.canvasTarget.width, this.canvasTarget.height);
        const code = jsQR(
          imageData.data,
          imageData.width,
          imageData.height, { inversionAttempts: "dontInvert" }
        );
        if (code) {
          if (this.doesCodeComply(code.data)) {
            const string = code.data.replace('http://localhost:3000', 'https://c92a-190-247-7-163.ngrok-free.app');
            const url = new URL(string);
            url.searchParams.set('management_mode', 'true');
            window.location.href = url;
          } else {
            emitCustomEvent('renderAlert', {
              detail: {
                alertType: 'error',
                message: `Oops! Seems like the QR code you scanned is not valid.`
              }
            });
          }
          
        }
      }
      requestAnimationFrame(this.tick.bind(this));
    } catch (e) {
      alert('tick -> ' + e.message);
    }
  }
  
  doesCodeComply(url) {
    const regex = /check\/[a-zA-Z0-9]{12}/;
    return regex.test(url);
  }
}