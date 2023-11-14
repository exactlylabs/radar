import { Controller } from "@hotwired/stimulus";
import { emitCustomEvent } from "../eventsEmitter";
import handleError from "./error_handler_controller";
import jsQR from "jsqr";

const UNDO_ADD_TIMEOUT = 3000;
const BASE_BANNER_MESSAGE = `Point your camera at the pod's QR code`;
const INTERACTION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error'
}

export default class extends Controller {
  
  static targets = [
    "canvas",
    "closeCanvas",
    "canvasUnderlay",
    "canvasFocus",
    "canvasInfo",
    "undoableBanner",
    "continueButton",
    "allPodIdsHiddenInput",
    "alertIcon"
  ];
  
  connect(){
    this.video = document.createElement("video");
    this.isOpen = false;
    this.addPodTimeoutId = null;
    this.loadingBarTimeoutId = null;
    this.currentPodId = null;
    this.analyzedPodIds = new Set();
    this.addedPods = new Set();
    this.availablePodIds = [];
    this.successAudio = new Audio('audios/success.wav');
    this.errorAudio = new Audio('audios/error.wav');
  }
  
  handleInteraction(type) {
    // Not that big of a deal if the audios fails for some reason, but want to catch it
    if(type === INTERACTION_TYPES.SUCCESS) {
      this.successAudio.play().catch(() => {});
    } else {
      this.errorAudio.play().catch(() => {});
    }
    
    // Double check vibrate support (mainly for iOS)
    if('vibrate' in navigator) {
      navigator.vibrate(200);
    }
  }
  
  allPodIdsHiddenInputTargetConnected(target) {
    const currentTargetValue = target.value;
    if(!currentTargetValue || currentTargetValue === '') return;
    this.availablePodIds = JSON.parse(currentTargetValue);
  }
  
  canvasTargetConnected(target) {
    this.canvas = target.getContext("2d", { willReadFrequently: true });
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
          this.showContinueButton();
          requestAnimationFrame(this.tick.bind(this));
        })
        .catch(e => { alert(e); });
    } catch (e) {
      this.close();
      handleError(e, this.identifier);
    }
  }
  
  close() {
    this.isOpen = false;
    this.canvasInfoTarget.hidden = true;
    this.canvasFocusTarget.hidden = true;
    this.canvasTarget.hidden = true;
    this.closeCanvasTarget.hidden = true;
    this.canvasUnderlayTarget.hidden = true;
    this.hideContinueButton();
    this.resetContinueButton();
    this.currentPodId = null;
    this.addedPods.clear();
    this.analyzedPodIds.clear();
    
    // stop current video stream from webcam on browser
    const stream = this.video.srcObject;
    const tracks = stream.getTracks();
    tracks.forEach(track => { track.stop(); });
  }
  
  tick() {
    try {
      if (!this.isOpen) return;
      if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
        this.canvasInfoTarget.hidden = false;
        this.canvasFocusTarget.hidden = false;
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
          imageData.height,
          { inversionAttempts: "dontInvert" }
        );
        if (code) {
          if (this.doesCodeComply(code.data)) {
            const podId = code.data.split('/check/')[1];
            
            if(!this.analyzedPodIds.has(podId)) {
              
              this.analyzedPodIds.add(podId);
              
              if(this.availablePodIds.includes(podId)) {
                this.currentPodId = podId;
                this.showUndoableBanner();
                this.addPodTimeoutId = setTimeout(this.addPod.bind(this), UNDO_ADD_TIMEOUT);
              } else {
                this.handleInteraction(INTERACTION_TYPES.ERROR);
                this.renderWrongPodAlert();
              }
            }
          } else {
            this.handleInteraction(INTERACTION_TYPES.ERROR);
            this.renderUnknownQRCodeAlert();
          }
        }
      }
      requestAnimationFrame(this.tick.bind(this));
    } catch (e) {
      this.close();
      handleError(e, this.identifier);
    }
  }
  
  addPod() {
    this.handleInteraction(INTERACTION_TYPES.SUCCESS);
    this.hideUndoableBanner();
    emitCustomEvent('addPodFromQR', { detail: { podId: this.currentPodId } });
    this.renderPodAddedAlert();
    this.addedPods.add(this.currentPodId);
    this.enableContinueButton();
  }
  
  resetLoadingBar() {
    if(this.loadingBarTimeoutId) {
      clearTimeout(this.loadingBarTimeoutId);
      this.loadingBarTimeoutId = null;
    }
    this.undoableBannerTarget.dataset.loading = 'false';
  }
  
  startLoadingBar() {
    this.undoableBannerTarget.dataset.loading = 'true';
    this.loadingBarTimeoutId = setTimeout(this.resetLoadingBar.bind(this), UNDO_ADD_TIMEOUT);
  }
  
  hideUndoableBanner() {
    if(this.addPodTimeoutId) {
      clearTimeout(this.addPodTimeoutId);
      this.addPodTimeoutId = null;
    }
    this.undoableBannerTarget.setAttribute('hidden', 'hidden');
    this.resetLoadingBar();
  }
  
  showUndoableBanner() {
    this.undoableBannerTarget.removeAttribute('hidden');
    this.undoableBannerTarget.querySelector('p').innerHTML = `<span>${this.currentPodId}</span> added to list.`;
    this.startLoadingBar();
  }
  
  undoAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    this.analyzedPodIds.delete(this.currentPodId);
    clearTimeout(this.addPodTimeoutId);
    this.addPodTimeoutId = null;
    this.hideUndoableBanner();
  }
  
  showContinueButton() {
    this.continueButtonTarget.removeAttribute('hidden');
  }
  
  enableContinueButton() {
    this.continueButtonTarget.removeAttribute('disabled');
    this.continueButtonTarget.innerText = `Continue with ${this.addedPods.size} pod${this.addedPods.size === 1 ? '' : 's'}.`;
  }
  
  resetContinueButton() {
    this.continueButtonTarget.setAttribute('disabled', 'disabled');
    this.continueButtonTarget.innerText = 'Continue';
  }
  
  hideContinueButton() {
    this.continueButtonTarget.setAttribute('hidden', 'hidden');
  }
  
  resetCanvasInfo() {
    this.alertIconTarget.setAttribute('hidden', 'hidden');
    this.canvasInfoTarget.querySelector('span').innerText = BASE_BANNER_MESSAGE;
  }
  
  renderPodAddedAlert() {
    this.alertIconTarget.setAttribute('hidden', 'hidden');
    this.canvasInfoTarget.querySelector('span').innerText = `${this.currentPodId} added successfully.`;
    setTimeout(this.resetCanvasInfo.bind(this), 2000);
  }
  
  renderWrongPodAlert() {
    this.alertIconTarget.removeAttribute('hidden');
    this.canvasInfoTarget.querySelector('span').innerText = `This pod doesn't exist or doesn't belong to you.`;
    setTimeout(this.resetCanvasInfo.bind(this), 2000);
  }
  
  renderUnknownQRCodeAlert() {
    this.alertIconTarget.removeAttribute('hidden');
    this.canvasInfoTarget.querySelector('span').innerText = `Unprocessable QR Code.`;
    setTimeout(this.resetCanvasInfo.bind(this), 2000);
  }
  
  doesCodeComply(url) {
    const regex = /check\/[a-zA-Z0-9]{12}/;
    return regex.test(url);
  }
}