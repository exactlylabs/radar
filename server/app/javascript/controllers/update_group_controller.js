import { Controller } from '@hotwired/stimulus';

export default class extends Controller {
  static targets = ["bar", "handle", "fill", "input", "text"];

  connect() {
    console.log("hey");
    var progressBar = $(this.barTarget);
    var handle = $(this.handleTarget);
    var fill = $(this.fillTarget);
    var percent = $(this.inputTarget);
    var text = $(this.textTarget);

    // Added this timeout because the width is returning -2 when connect is called.
    // probably related to the element not being drawn yet.
    setTimeout(function() {
      var progress = parseInt(percent.attr("value"));
      var barWidth = progressBar.width();
      var handleLeft = Math.round((progress / 100) * barWidth);

      handle.css('left', handleLeft + 'px');
      fill.css('width', handleLeft + 'px');
    }, 200);
    
    handle.on('mousedown', function(e) {
      e.preventDefault();
      handle.addClass('dragging');
      
      $(document).on('mousemove', moveHandle);
      $(document).on('mouseup', releaseHandle);
    });

    function moveHandle(e) {
      var barLeft = progressBar.offset().left;
      var barWidth = progressBar.width();
      var mouseX = e.pageX;
      var offsetX = mouseX - barLeft;
      
      var progress = Math.round((offsetX / barWidth) * 100);
      progress = Math.max(0, Math.min(progress, 100));
      
      var handleLeft = Math.round((progress / 100) * barWidth);
      handle.css('left', handleLeft + 'px');
      fill.css('width', handleLeft + 'px');
      text.text(progress + '%');
      percent.attr("value", progress);
    }

    function releaseHandle() {
      handle.removeClass('dragging');
      
      $(document).off('mousemove', moveHandle);
      $(document).off('mouseup', releaseHandle);
    }
  }

  initProgressBar() {
    
  }

}
