import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ["bar", "handle", "fill", "input", "text"];

  connect() {}

  onMouseDown (e) {
    this.handleTarget.classList.add('dragging');
    document.addEventListener('mouseup', this.releaseHandle.bind(this));
    document.addEventListener('mousemove', this.moveHandle.bind(this));
  }

  releaseHandle() {
    this.handleTarget.classList.remove('dragging');
    document.removeEventListener('mouseup', this.releaseHandle.bind(this));
    document.removeEventListener('mousemove', this.moveHandle.bind(this));
  }

  moveHandle(e) {
    if (!this.handleTarget.classList.contains('dragging')) return;
    let barLeft = $(this.barTarget).offset().left;
    let barWidth = $(this.barTarget).width();
    let mouseX = e.pageX;
    let offsetX = mouseX - barLeft;

    let progress = Math.round((offsetX / barWidth) * 100);
    progress = Math.max(0, Math.min(progress, 100));
    if (progress > 50) {
      this.textTarget.style.color = 'white';
    } else {
      this.textTarget.style.color = 'black';
    }
    this.handleTarget.style = `left: ${progress}%;`
    this.fillTarget.style = `width: ${progress}%;`;
    this.textTarget.innerText = progress + '%';
    this.inputTarget.setAttribute("value", progress);
  }
}
