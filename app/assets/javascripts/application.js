/*
*= require_self
*= require plugins.bundle
*= require style.bundle
*= require scripts.bundle
*/

var initSelect2 = function () {
  var elements = [].slice.call(document.querySelectorAll('[data-control="select2"], [data-kt-select2="true"]'));

  elements.map(function (element) {
    var options = {
      dir: document.body.getAttribute('direction')
    };

    if (element.getAttribute('data-hide-search') == 'true') {
      options.minimumResultsForSearch = Infinity;
    }

    $(element).select2(options);
  });
}

function initialize() {
  KTMenu.init();
  KTToggle.init();
  initSelect2();
  KTApp.initBootstrapTooltips();
}

function frameInit() {
  initSelect2();
}

document.addEventListener("DOMContentLoaded", initialize);
document.addEventListener("turbo:load", initialize);
document.addEventListener("turbo:frame-load", frameInit);